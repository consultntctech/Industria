'use server';

import { Model, Types } from "mongoose";
import { IResponse } from "@/types/Types";
import { respond } from "../misc";
import { resolveServerAccess } from "../auth/serverPermissions";
import User from "../models/user.model";
import Supplier from "../models/supplier.model";
import Customer from "../models/customer.model";
import Product from "../models/product.model";
import Category from "../models/category.model";
import Batch from "../models/batch.model";
import RMaterial from "../models/rmaterial.mode";
import Production from "../models/production.model";
import Good from "../models/good.model";
import Labourer from "../models/labourer.model";
import ProdItem from "../models/proditem.model";
import ProdType from "../models/prodtype.model";
import Package from "../models/package.model";
import Sales from "../models/sales.model";
import Order from "../models/order.model";
import Storage from "../models/storage.model";
import Equipment from "../models/equipment.model";
import ECategory from "../models/ecategory.model";
import EType from "../models/etype.model";
import Department from "../models/department.model";
import Employee from "../models/employee.model";
import Role from "../models/role.model";
import RoleTemplate from "../models/roletemplate.model";
import Organization from "../models/org.model";

export type SearchHit = {
  id: string;
  group: string;
  title: string;
  subtitle?: string;
  href: string;
};

type Doc = Record<string, unknown> & { _id: Types.ObjectId };

type Source = {
  /** Permission table id (Data/roles/table.ts). READ on it is required. */
  tableId: string;
  group: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any>;
  /** Fields matched against the query (dot paths allowed). */
  fields: string[];
  title: (d: Doc) => string;
  subtitle?: (d: Doc) => string | undefined;
  href: (id: string) => string;
  /** Only searchable by the platform (system admin) org. */
  systemAdminOnly?: boolean;
  /** Not scoped by `org` (the collection *is* the org list). */
  unscoped?: boolean;
};

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : undefined);
const join = (...v: unknown[]) => v.map(str).filter(Boolean).join(" · ") || undefined;
const nested = (d: Doc, path: string) =>
  path.split(".").reduce<unknown>((acc, k) => (acc && typeof acc === "object" ? (acc as Record<string, unknown>)[k] : undefined), d);

const SOURCES: Source[] = [
  { tableId: "28", group: "Products", model: Product, fields: ["name", "code"], title: (d) => String(d.name), subtitle: (d) => join(d.code, d.type), href: (id) => `/dashboard/products/types?Id=${id}` },
  { tableId: "32", group: "Product categories", model: Category, fields: ["name"], title: (d) => String(d.name), subtitle: (d) => str(d.description), href: (id) => `/dashboard/products/categories?Id=${id}` },
  { tableId: "55", group: "Batches", model: Batch, fields: ["code"], title: (d) => String(d.code), subtitle: (d) => str(d.type), href: (id) => `/dashboard/products/batches?Id=${id}` },
  { tableId: "87", group: "Raw materials", model: RMaterial, fields: ["materialName"], title: (d) => String(d.materialName), subtitle: (d) => str(d.qStatus), href: (id) => `/dashboard/products/raw-materials?Id=${id}` },
  { tableId: "8", group: "Production", model: Production, fields: ["name"], title: (d) => String(d.name), subtitle: (d) => str(d.status), href: (id) => `/dashboard/processing/production/${id}` },
  { tableId: "88", group: "Unfinished goods", model: Good, fields: ["name", "serialName"], title: (d) => String(d.name), subtitle: (d) => str(d.serialName), href: (id) => `/dashboard/processing/goods?Id=${id}` },
  { tableId: "91", group: "Labourers", model: Labourer, fields: ["name", "phone", "email"], title: (d) => String(d.name), subtitle: (d) => join(d.phone, d.email), href: (id) => `/dashboard/processing/labourers?Id=${id}` },
  { tableId: "17", group: "Packaging material types", model: ProdType, fields: ["name", "code"], title: (d) => String(d.name), subtitle: (d) => str(d.code), href: (id) => `/dashboard/distribution/materials/types?Id=${id}` },
  { tableId: "12", group: "Packaging material items", model: ProdItem, fields: ["materialName", "name"], title: (d) => String(d.materialName || d.name), subtitle: (d) => str(d.name), href: (id) => `/dashboard/distribution/materials/items?Id=${id}` },
  { tableId: "99", group: "Packages", model: Package, fields: ["name"], title: (d) => String(d.name), subtitle: (d) => str(d.approvalStatus), href: (id) => `/dashboard/distribution/packaging/${id}` },
  { tableId: "82", group: "Sales", model: Sales, fields: ["invoice.code"], title: (d) => `Invoice ${String(nested(d, "invoice.code") ?? "")}`, href: (id) => `/dashboard/transactions/sales?Id=${id}` },
  { tableId: "86", group: "Orders", model: Order, fields: ["salesOrder.code", "purchaseOrder"], title: (d) => `Order ${String(nested(d, "salesOrder.code") ?? "")}`, subtitle: (d) => join(d.purchaseOrder && `PO ${d.purchaseOrder}`, d.status), href: (id) => `/dashboard/transactions/orders?Id=${id}` },
  { tableId: "33", group: "Customers", model: Customer, fields: ["name", "email", "phone"], title: (d) => String(d.name), subtitle: (d) => join(d.email, d.phone), href: (id) => `/dashboard/transactions/customers/${id}` },
  { tableId: "41", group: "Suppliers", model: Supplier, fields: ["name", "email", "phone"], title: (d) => String(d.name), subtitle: (d) => join(d.email, d.phone), href: (id) => `/dashboard/suppliers/${id}` },
  { tableId: "77", group: "Storage", model: Storage, fields: ["name", "location"], title: (d) => String(d.name), subtitle: (d) => str(d.location), href: (id) => `/dashboard/storage/${id}` },
  { tableId: "94", group: "Equipment", model: Equipment, fields: ["name", "serialNumber", "tag", "brand", "model"], title: (d) => String(d.name), subtitle: (d) => join(d.serialNumber, d.status), href: (id) => `/dashboard/equipment/items?Id=${id}` },
  { tableId: "94", group: "Equipment types", model: EType, fields: ["name"], title: (d) => String(d.name), href: (id) => `/dashboard/equipment/types?Id=${id}` },
  { tableId: "94", group: "Equipment categories", model: ECategory, fields: ["name"], title: (d) => String(d.name), href: (id) => `/dashboard/equipment/categories?Id=${id}` },
  { tableId: "95", group: "Departments", model: Department, fields: ["name"], title: (d) => String(d.name), subtitle: (d) => str(d.headName), href: (id) => `/dashboard/departments/${id}` },
  { tableId: "96", group: "Employees", model: Employee, fields: ["name", "email", "phone"], title: (d) => String(d.name), subtitle: (d) => join(d.email, d.phone), href: (id) => `/dashboard/employees?Id=${id}` },
  { tableId: "38", group: "Users", model: User, fields: ["name", "email"], title: (d) => String(d.name), subtitle: (d) => str(d.email), href: (id) => `/dashboard/users?Id=${id}` },
  { tableId: "27", group: "Roles", model: Role, fields: ["name"], title: (d) => String(d.name), subtitle: (d) => str(d.description), href: (id) => `/dashboard/roles?Id=${id}` },
  { tableId: "23", group: "Role templates", model: RoleTemplate, fields: ["name"], title: (d) => String(d.name), subtitle: (d) => str(d.description), href: (id) => `/dashboard/templates?Id=${id}` },
  { tableId: "100", group: "Organizations", model: Organization, fields: ["name", "email"], title: (d) => String(d.name), subtitle: (d) => str(d.email), href: (id) => `/dashboard/organizations?Id=${id}`, systemAdminOnly: true, unscoped: true },
];

const PER_GROUP = 5;
const MAX_QUERY = 64;

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Search across every module the signed-in user may READ, limited to their
 * own organization. Identity, org and permissions all come from the server
 * session and database — nothing the client sends widens the scope.
 */
export async function globalSearch(rawQuery: string): Promise<IResponse> {
  try {
    const query = String(rawQuery ?? "").trim().slice(0, MAX_QUERY);
    if (query.length < 2) return respond("Query too short", false, [], 200);

    const access = await resolveServerAccess();
    if (!access) return respond("Unauthorized access. Please log in.", true, [], 401);

    const orgId = new Types.ObjectId(String(access.session.org));
    const pattern = new RegExp(escapeRegex(query), "i");

    const allowed = SOURCES.filter(
      (s) => access.can(s.tableId, "READ") && (!s.systemAdminOnly || access.isSystemAdmin)
    );

    const results = await Promise.all(
      allowed.map(async (s) => {
        const filter: Record<string, unknown> = {
          $or: s.fields.map((f) => ({ [f]: pattern })),
        };
        if (!s.unscoped) filter.org = orgId;

        // Only the fields we display are read (never e.g. password hashes).
        const projection = Array.from(
          new Set([...s.fields, "name", "description", "status", "type", "approvalStatus", "qStatus", "headName", "serialName", "location"])
        )
          .filter((f) => s.model.schema.path(f) || s.model.schema.path(f.split(".")[0]))
          .join(" ");

        const docs = await s.model
          .find(filter)
          .select(projection)
          .sort({ updatedAt: -1 })
          .limit(PER_GROUP)
          .lean<Doc[]>()
          .exec();

        return docs.map<SearchHit>((d) => ({
          id: String(d._id),
          group: s.group,
          title: s.title(d) || "Untitled",
          subtitle: s.subtitle?.(d),
          href: s.href(String(d._id)),
        }));
      })
    );

    return respond("Search complete", false, results.flat(), 200);
  } catch (error) {
    console.log(error);
    return respond("Error occured while searching", true, [], 500);
  }
}
