'use server'

// Bulk import from spreadsheets. Every row is validated with the shared import
// rules, its related items are checked against the target organization, and
// duplicates are checked against both the file and the database. Nothing is
// written unless every row passes. Rows are then created one by one through the
// same create actions the forms use, so their server-side rules still apply.
import { isValidObjectId, Model } from "mongoose";
import { IResponse } from "@/types/Types";
import { respond } from "../misc";
import { connectDB } from "../mongoose";
import { resolveServerAccess } from "../auth/serverPermissions";
import { authorizeUserCreation } from "../auth/userCreationPolicy";
import {
  CellValue,
  IMPORT_SPECS,
  ImportEntity,
  ImportRowInput,
  MAX_IMPORT_ROWS,
  RelationSource,
  relationApplies,
  validateRow,
} from "../import/importSpecs";
import Category from "../models/category.model";
import Supplier from "../models/supplier.model";
import ProdType from "../models/prodtype.model";
import Batch from "../models/batch.model";
import Storage from "../models/storage.model";
import Department from "../models/department.model";
import Employee from "../models/employee.model";
import User from "../models/user.model";
import Product from "../models/product.model";
import OtherCurrency from "../models/othercurrency.model";
import { createProduct } from "./product.action";
import { createCategory } from "./category.action";
import { createProdType } from "./prodtype.action";
import { createProdItem } from "./proditem.action";
import { createSupplier } from "./supplier.action";
import { checkEmployeeForUser, createEmployee } from "./employee.action";
import { createUser } from "./user.action";
import { createDepartment } from "./department.action";

export type ImportRowStatus = "valid" | "invalid" | "created" | "failed";
export type ImportRowResult = {
  row: number;
  status: ImportRowStatus;
  errors: string[];
  warnings: string[];
  message?: string;
};
export type ImportResult = {
  dryRun: boolean;
  results: ImportRowResult[];
  valid: number;
  invalid: number;
  created: number;
  failed: number;
};

export type ImportOptions = {
  /** Validate only; never writes. */
  dryRun?: boolean;
  /** Target organization; only honoured for system admins on org-selectable tables. */
  orgId?: string;
  /** Active currency for packaging items (rate is read from the database). */
  currencyId?: string;
};

type Lean = { _id: unknown; [k: string]: unknown };

const RELATION_MODELS: Record<RelationSource, { model: Model<any>; filter?: Record<string, unknown>; select: string }> = {
  categories: { model: Category, select: "_id" },
  suppliers: { model: Supplier, select: "_id" },
  packagingTypes: { model: ProdType, select: "_id suppliers" },
  packagingBatches: { model: Batch, filter: { type: "Packaging Material" }, select: "_id" },
  storages: { model: Storage, select: "_id" },
  departments: { model: Department, select: "_id" },
  employees: { model: Employee, select: "_id name" },
};

const CASE_INSENSITIVE = { locale: "en", strength: 2 } as const;
const lower = (v: CellValue) => String(v ?? "").trim().toLowerCase();
const asIds = (v: string | string[] | null | undefined): string[] => (!v ? [] : Array.isArray(v) ? v : [v]).filter(Boolean);

export async function importRecords(
  entity: ImportEntity,
  rows: ImportRowInput[],
  options: ImportOptions = {},
): Promise<IResponse> {
  try {
    const spec = IMPORT_SPECS[entity];
    if (!spec) return respond("Unknown import type", true, {}, 400);

    const access = await resolveServerAccess();
    if (!access) return respond("Unauthorized access. Please log in.", true, {}, 401);
    if (!access.can(spec.tableId, "CREATE")) {
      return respond(`You do not have permission to create ${spec.title.toLowerCase()}`, true, {}, 403);
    }

    if (!Array.isArray(rows) || rows.length === 0) return respond("There are no rows to import", true, {}, 400);
    if (rows.length > MAX_IMPORT_ROWS) {
      return respond(`You can import up to ${MAX_IMPORT_ROWS} rows at a time`, true, {}, 400);
    }

    const session = access.session;
    const isAdmin = access.isSystemAdmin;
    let org = String(session.org);
    if (spec.orgSelectable && isAdmin) {
      if (!options.orgId || !isValidObjectId(options.orgId)) return respond("Select an organization", true, {}, 400);
      org = options.orgId;
    }

    if (entity === "users") {
      const auth = await authorizeUserCreation(org, ["CREATE"]);
      if ("error" in auth) return auth.error;
    }

    await connectDB();

    // ---- 1. Field rules -------------------------------------------------
    const checks = rows.map((row) => validateRow(spec, row, isAdmin));
    const results: ImportRowResult[] = checks.map((c, i) => ({
      row: i + 1,
      status: "valid",
      errors: [...c.errors],
      warnings: [],
    }));
    const values = checks.map((c) => c.values);

    // Only the relations that apply to each row are kept and sent on.
    const relations = rows.map((row, i) => {
      const out: Record<string, string[]> = {};
      for (const rel of spec.relations) {
        if (!relationApplies(rel, values[i])) continue;
        out[rel.key] = asIds(row.relations?.[rel.key]);
      }
      return out;
    });

    // ---- 2. Related items must exist in the target organization ------------
    const found: Partial<Record<RelationSource, Map<string, Lean>>> = {};
    for (const rel of spec.relations) {
      const ids = new Set(relations.flatMap((r) => r[rel.key] ?? []));
      const bad = [...ids].filter((id) => !isValidObjectId(id));
      const { model, filter, select } = RELATION_MODELS[rel.source];
      const docs = await model
        .find({ _id: { $in: [...ids].filter((id) => isValidObjectId(id)) }, org, ...(filter ?? {}) })
        .select(select)
        .lean<Lean[]>();
      const map = found[rel.source] ?? new Map<string, Lean>();
      docs.forEach((d) => map.set(String(d._id), d));
      found[rel.source] = map;

      relations.forEach((r, i) => {
        const missing = (r[rel.key] ?? []).filter((id) => bad.includes(id) || !map.has(id));
        if (missing.length) results[i].errors.push(`${rel.label}: selected item was not found in this organization`);
      });
    }

    // Packaging items: suppliers must belong to the chosen material type (as in the form).
    if (entity === "packagingItems") {
      relations.forEach((r, i) => {
        const type = found.packagingTypes?.get(r.type?.[0] ?? "");
        if (!type || !r.suppliers?.length) return;
        const allowed = new Set(((type.suppliers as unknown[]) ?? []).map(String));
        if (r.suppliers.some((s) => !allowed.has(s))) {
          results[i].errors.push("Suppliers must be suppliers of the selected material type");
        }
      });
    }

    // ---- 3. Duplicates (in the file and in the database) --------------------
    const dupInFile = (key: (i: number) => string, label: string) => {
      const seen = new Map<string, number>();
      values.forEach((_, i) => {
        const k = key(i);
        if (!k) return;
        if (seen.has(k)) results[i].errors.push(`${label} is repeated in this file (row ${seen.get(k)})`);
        else seen.set(k, i + 1);
      });
    };

    if (entity === "products") {
      dupInFile((i) => lower(values[i].code), "Product code");
      dupInFile((i) => (values[i].name ? `${lower(values[i].type)}|${lower(values[i].name)}` : ""), "Name for this product type");
      const codes = values.map((v) => String(v.code ?? "").trim()).filter(Boolean);
      const names = values.map((v) => String(v.name ?? "").trim()).filter(Boolean);
      const [codeHits, nameHits] = await Promise.all([
        Product.find({ org, code: { $in: codes } }).collation(CASE_INSENSITIVE).select("code").lean<{ code: string }[]>(),
        Product.find({ org, name: { $in: names } }).collation(CASE_INSENSITIVE).select("name type").lean<{ name: string; type: string }[]>(),
      ]);
      const takenCodes = new Set(codeHits.map((p) => lower(p.code)));
      const takenNames = new Set(nameHits.map((p) => `${lower(p.type)}|${lower(p.name)}`));
      values.forEach((v, i) => {
        if (v.code && takenCodes.has(lower(v.code))) results[i].errors.push("A product with this code already exists");
        if (v.name && takenNames.has(`${lower(v.type)}|${lower(v.name)}`)) {
          results[i].errors.push("A product with this name already exists for this product type");
        }
      });
    }

    if (entity === "categories") {
      dupInFile((i) => lower(values[i].name), "Category name");
      const hits = await Category.find({ org, lowerName: { $in: values.map((v) => lower(v.name)) } })
        .select("lowerName").lean<{ lowerName: string }[]>();
      const taken = new Set(hits.map((c) => c.lowerName));
      values.forEach((v, i) => {
        if (v.name && taken.has(lower(v.name))) results[i].errors.push("Category already exists");
      });
    }

    if (entity === "packagingTypes") {
      dupInFile((i) => lower(values[i].name), "Item name");
      dupInFile((i) => lower(values[i].code), "Item code");
      const [nameHits, codeHits] = await Promise.all([
        ProdType.find({ org, nameLower: { $in: values.map((v) => lower(v.name)) } }).select("nameLower").lean<{ nameLower: string }[]>(),
        ProdType.find({ org, codeLower: { $in: values.map((v) => lower(v.code)) } }).select("codeLower").lean<{ codeLower: string }[]>(),
      ]);
      const names = new Set(nameHits.map((p) => p.nameLower));
      const codes = new Set(codeHits.map((p) => p.codeLower));
      values.forEach((v, i) => {
        if ((v.name && names.has(lower(v.name))) || (v.code && codes.has(lower(v.code)))) {
          results[i].errors.push("A packaging material type with this name or code already exists");
        }
      });
    }

    if (entity === "employees" || entity === "users") {
      dupInFile((i) => lower(values[i].email), "Email");
      const emails = values.map((v) => lower(v.email)).filter(Boolean);
      const [employees, users] = await Promise.all([
        Employee.find({ email: { $in: emails } }).select("email org").lean<{ email: string; org?: unknown }[]>(),
        User.find({ email: { $in: emails } }).select("email org").lean<{ email: string; org?: unknown }[]>(),
      ]);
      const empBy = new Map(employees.map((e) => [lower(e.email), e]));
      const userBy = new Map(users.map((u) => [lower(u.email), u]));

      values.forEach((v, i) => {
        const email = lower(v.email);
        if (!email) return;
        const emp = empBy.get(email);
        const user = userBy.get(email);
        if (entity === "employees") {
          // Same rules as checkEmployeeForUser
          if (emp) results[i].errors.push("Employee already exists");
          else if (user && String(user.org) !== org) results[i].errors.push("This email belongs to a user in another organization");
          else if (user) results[i].warnings.push("A user account exists for this email; the employee will be created from the user account's details");
        } else {
          // Same rules as checkUserForEmployee
          if (user) results[i].errors.push("User already exists");
          else if (emp && String(emp.org) !== org) results[i].errors.push("This email belongs to an employee in another organization");
          else if (emp) results[i].warnings.push("An employee record exists for this email; its details will be overwritten");
        }
      });
    }

    // Packaging items: the active currency must belong to the organization.
    let currency: { _id: unknown; rate: number } | null = null;
    if (entity === "packagingItems" && options.currencyId) {
      if (!isValidObjectId(options.currencyId)) return respond("Invalid currency", true, {}, 400);
      currency = await OtherCurrency.findOne({ _id: options.currencyId, org }).select("_id rate").lean<{ _id: unknown; rate: number }>();
      if (!currency) return respond("The selected currency was not found in this organization", true, {}, 400);
    }

    results.forEach((r) => (r.status = r.errors.length ? "invalid" : "valid"));
    const invalid = results.filter((r) => r.status === "invalid").length;

    const summary = (dryRun: boolean): ImportResult => ({
      dryRun,
      results,
      valid: results.filter((r) => r.status === "valid").length,
      invalid: results.filter((r) => r.status === "invalid").length,
      created: results.filter((r) => r.status === "created").length,
      failed: results.filter((r) => r.status === "failed").length,
    });

    if (options.dryRun) {
      return respond(invalid ? `${invalid} row(s) need attention` : "All rows are valid", false, summary(true), 200);
    }
    if (invalid) {
      return respond(`Nothing was imported. Fix the ${invalid} row(s) with errors and try again.`, true, summary(false), 422);
    }

    // ---- 4. Create, one row at a time, through the normal create actions -------
    const owner = { org, createdBy: session._id, creator: session.name };
    const one = (r: Record<string, string[]>, key: string) => r[key]?.[0];

    for (let i = 0; i < rows.length; i++) {
      const v = values[i];
      const r = relations[i];
      let res: IResponse;

      switch (entity) {
        case "products":
          res = await createProduct({
            name: v.name as string, code: v.code as string, type: v.type as string,
            threshold: Number(v.threshold ?? 0), uom: (v.uom as string) || undefined,
            description: (v.description as string) || undefined,
            category: one(r, "category"), suppliers: r.suppliers ?? [], ...owner,
          });
          break;
        case "categories":
          res = await createCategory({ name: v.name as string, description: (v.description as string) || undefined, ...owner });
          break;
        case "packagingTypes":
          res = await createProdType({
            name: v.name as string, code: v.code as string,
            category: v.category as string, subcategory: (v.subcategory as string) || undefined,
            threshold: Number(v.threshold ?? 0), uom: (v.uom as string) || undefined,
            reusable: !!v.reusable, description: (v.description as string) || undefined,
            suppliers: r.suppliers ?? [], stock: 0, available: 0, used: 0, ...owner,
          });
          break;
        case "packagingItems": {
          // Same calculation as the packaging item form
          const quantity = Number(v.quantity ?? 0);
          const rejected = Number(v.qRejected ?? 0);
          const unitPrice = Number(v.unitPrice ?? 0);
          const rate = currency?.rate || 1;
          const originalCost = (quantity - rejected) * unitPrice;
          res = await createProdItem({
            name: v.name as string, description: (v.description as string) || undefined,
            qStatus: (v.qStatus as string) || "Pass",
            dateReceived: new Date(v.dateReceived as string),
            quantity, qRejected: rejected,
            reasonForRejection: (v.reasonForRejection as string) || undefined,
            unitPrice, price: originalCost * rate, charges: Number(v.charges ?? 0) * rate,
            stock: quantity - rejected, used: 0,
            type: one(r, "type"), batch: one(r, "batch"),
            suppliers: r.suppliers ?? [], storages: r.storages ?? [],
            original: { amount: originalCost, rate, currency: currency ? String(currency._id) : undefined },
            ...owner,
          } as never);
          break;
        }
        case "suppliers":
          res = await createSupplier({
            name: v.name as string, person: v.person as string, email: (v.email as string) || undefined,
            phone: v.phone as string, address: v.address as string,
            isActive: v.isActive !== false, description: (v.description as string) || undefined, ...owner,
          });
          break;
        case "employees": {
          // Same flow as the employee form: reuse a user account's details when one exists.
          const check = await checkEmployeeForUser(v.email as string, org);
          if (check.code === 422) {
            res = await createEmployee(check.payload as never);
          } else if (check.code === 200) {
            res = await createEmployee({
              name: v.name as string, address: v.address as string, phone: v.phone as string,
              email: v.email as string, description: (v.description as string) || undefined,
              department: one(r, "department"), org, creator: session.name,
            });
          } else {
            res = check;
          }
          break;
        }
        case "users":
          res = await createUser({
            name: v.name as string, address: v.address as string, phone: v.phone as string,
            email: v.email as string, description: (v.description as string) || undefined,
            department: one(r, "department"), org, creator: isAdmin ? "System" : session.name,
          });
          break;
        case "departments": {
          const headId = one(r, "head");
          const head = headId ? found.employees?.get(headId) : undefined;
          res = await createDepartment({
            name: v.name as string, description: (v.description as string) || undefined,
            head: headId, headName: (head?.name as string) || "", roles: [], ...owner,
          });
          break;
        }
        default:
          res = respond("Unknown import type", true, {}, 400);
      }

      results[i].status = res.error ? "failed" : "created";
      results[i].message = res.message;
      if (res.error) results[i].errors.push(res.message);
    }

    const result = summary(false);
    const message = result.failed
      ? `Imported ${result.created} of ${rows.length} row(s). ${result.failed} failed.`
      : `Imported ${result.created} row(s) successfully.`;
    return respond(message, result.failed > 0 && result.created === 0, result, result.failed ? 207 : 201);
  } catch (error) {
    console.error(error);
    return respond("Error occurred while importing", true, {}, 500);
  }
}
