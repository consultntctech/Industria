// Shared definitions for spreadsheet imports. Used by the template generator,
// the browser-side review grid and the server import action, so the rules a
// user sees are the rules the server enforces.
//
// Deliberately NOT a 'use server' module.
import { PACKAGING_CATEGORY, PACKAGING_SUBCATEGORY } from "@/Data/PackagingProcesses";

export type ImportEntity =
  | "products"
  | "categories"
  | "packagingTypes"
  | "packagingItems"
  | "suppliers"
  | "employees"
  | "users"
  | "departments";

export type FieldType = "text" | "longtext" | "email" | "number" | "date" | "enum" | "boolean";

export type ImportField = {
  key: string;
  header: string;
  type: FieldType;
  required?: boolean;
  /** Allowed values for enum fields. */
  options?: readonly string[];
  /** Suggested values for free-text fields (template dropdown that still allows other text). */
  suggestions?: readonly string[];
  min?: number;
  /** Dates may not be later than today. */
  notInFuture?: boolean;
  defaultValue?: string | number | boolean;
  help: string;
  example: string;
};

export type RelationSource =
  | "categories"
  | "suppliers"
  | "packagingTypes"
  | "packagingBatches"
  | "storages"
  | "departments"
  | "employees";

export type ImportRelation = {
  key: string;
  label: string;
  source: RelationSource;
  multiple: boolean;
  /** true, or "unlessSystemAdmin" to mirror forms that relax the rule for system admins. */
  required: boolean | "unlessSystemAdmin";
  help: string;
  /** Not applicable (hidden, nothing sent) when a field has one of these values. */
  hideWhen?: { field: string; values: string[] };
};

export const relationApplies = (rel: ImportRelation, values: Record<string, CellValue>) =>
  !rel.hideWhen || !rel.hideWhen.values.includes(String(values[rel.hideWhen.field] ?? ""));

export type ImportSpec = {
  entity: ImportEntity;
  title: string;
  /** Permission table id; the import needs CREATE on it. */
  tableId: string;
  fields: ImportField[];
  relations: ImportRelation[];
  /** System admins pick the target organization (mirrors the create forms). */
  orgSelectable?: boolean;
  notes: string[];
};

export const MAX_IMPORT_ROWS = 500;

export const PRODUCT_TYPES = ["Raw Material", "Work in Progress", "Processed Good"] as const;
export const QUALITY_STATUSES = ["Pass", "Partial", "Fail"] as const;

export const IMPORT_SPECS: Record<ImportEntity, ImportSpec> = {
  products: {
    entity: "products",
    title: "Products",
    tableId: "28",
    fields: [
      { key: "name", header: "Name", type: "text", required: true, help: "Product name. Must be unique for the product type.", example: "Cassava" },
      { key: "code", header: "Product Code", type: "text", required: true, help: "Must be unique across all your products.", example: "C001" },
      { key: "type", header: "Product Type", type: "enum", required: true, options: PRODUCT_TYPES, defaultValue: "Raw Material", help: "One of the listed values.", example: "Raw Material" },
      { key: "threshold", header: "Threshold", type: "number", required: true, min: 0, help: "Reorder level. 0 or more.", example: "10" },
      { key: "uom", header: "Unit of Measure", type: "text", help: "eg. kg, set, dozen, pair.", example: "kg" },
      { key: "description", header: "Description", type: "longtext", help: "Optional notes.", example: "Fresh cassava roots" },
    ],
    relations: [
      { key: "category", label: "Category", source: "categories", multiple: false, required: true, help: "Product category" },
      { key: "suppliers", label: "Suppliers", source: "suppliers", multiple: true, required: false, help: "Suppliers of this product", hideWhen: { field: "type", values: ["Processed Good"] } },
    ],
    notes: ["Suppliers do not apply to Processed Goods."],
  },

  categories: {
    entity: "categories",
    title: "Product Categories",
    tableId: "32",
    fields: [
      { key: "name", header: "Category Name", type: "text", required: true, help: "Must be unique (case does not matter).", example: "Oil" },
      { key: "description", header: "Description", type: "longtext", help: "Optional notes.", example: "Cooking oils" },
    ],
    relations: [],
    notes: [],
  },

  packagingTypes: {
    entity: "packagingTypes",
    title: "Packaging Material Types",
    tableId: "17",
    fields: [
      { key: "name", header: "Item Name", type: "text", required: true, help: "Must be unique (case does not matter).", example: "500ml Bottle" },
      { key: "code", header: "Item Code", type: "text", required: true, help: "Must be unique (case does not matter).", example: "BT500" },
      { key: "category", header: "Category", type: "text", required: true, suggestions: PACKAGING_CATEGORY.map((c) => c.label), help: "Pick a suggested value or type your own.", example: "Packaging" },
      { key: "subcategory", header: "Subcategory", type: "text", suggestions: PACKAGING_SUBCATEGORY.map((c) => c.label), help: "Optional. Pick a suggested value or type your own.", example: "Bottle" },
      { key: "threshold", header: "Reorder Level", type: "number", min: 0, defaultValue: 0, help: "0 or more. Defaults to 0.", example: "100" },
      { key: "uom", header: "Unit of Measure", type: "text", help: "eg. liters, units.", example: "units" },
      { key: "reusable", header: "Reusable", type: "boolean", defaultValue: false, help: "Yes or No. Defaults to No.", example: "No" },
      { key: "description", header: "Description", type: "longtext", help: "Optional notes.", example: "Clear PET bottle" },
    ],
    relations: [
      { key: "suppliers", label: "Suppliers", source: "suppliers", multiple: true, required: false, help: "Suppliers of this material type" },
    ],
    notes: [],
  },

  packagingItems: {
    entity: "packagingItems",
    title: "Packaging Material Items",
    tableId: "12",
    fields: [
      { key: "name", header: "Item Name", type: "text", required: true, help: "Name of the received item.", example: "500ml Bottles - March" },
      { key: "qStatus", header: "Quality Status", type: "enum", options: QUALITY_STATUSES, defaultValue: "Pass", help: "Pass, Partial or Fail. Defaults to Pass.", example: "Pass" },
      { key: "dateReceived", header: "Date Received", type: "date", required: true, notInFuture: true, help: "YYYY-MM-DD. Cannot be in the future.", example: "2026-03-14" },
      { key: "quantity", header: "Quantity Received", type: "number", required: true, min: 1, help: "1 or more.", example: "1000" },
      { key: "qRejected", header: "Quantity Rejected", type: "number", required: true, min: 0, defaultValue: 0, help: "0 or more, not more than the quantity received.", example: "0" },
      { key: "reasonForRejection", header: "Reason for Rejection", type: "longtext", help: "Required when the quantity rejected is more than 0.", example: "" },
      { key: "unitPrice", header: "Unit Price", type: "number", required: true, min: 0, help: "In the currency selected in the app when you import.", example: "0.5" },
      { key: "charges", header: "Charges", type: "number", min: 0, defaultValue: 0, help: "Extra charges, in the selected currency. Defaults to 0.", example: "20" },
      { key: "description", header: "Description", type: "longtext", help: "Optional notes.", example: "" },
    ],
    relations: [
      { key: "type", label: "Material Type", source: "packagingTypes", multiple: false, required: true, help: "Packaging material type" },
      { key: "batch", label: "Batch", source: "packagingBatches", multiple: false, required: true, help: "Packaging Material batch" },
      { key: "suppliers", label: "Suppliers", source: "suppliers", multiple: true, required: false, help: "Only suppliers of the chosen material type" },
      { key: "storages", label: "Storage", source: "storages", multiple: true, required: true, help: "Storage locations" },
    ],
    notes: [
      "Total cost is calculated as (quantity received - quantity rejected) x unit price, using the currency selected in the app at import time.",
    ],
  },

  suppliers: {
    entity: "suppliers",
    title: "Suppliers",
    tableId: "41",
    fields: [
      { key: "name", header: "Company/Individual Name", type: "text", required: true, help: "Supplier name.", example: "Acme Supplies Ltd" },
      { key: "person", header: "Contact Person", type: "text", required: true, help: "Contact person's name.", example: "Ama Mensah" },
      { key: "email", header: "Email", type: "email", help: "Optional. Must be a valid email.", example: "sales@acme.com" },
      { key: "phone", header: "Phone", type: "text", required: true, help: "Phone number.", example: "+233 20 000 0000" },
      { key: "address", header: "Address", type: "text", required: true, help: "Address.", example: "12 Ring Road, Accra" },
      { key: "isActive", header: "Active", type: "boolean", defaultValue: true, help: "Yes or No. Defaults to Yes.", example: "Yes" },
      { key: "description", header: "Description", type: "longtext", help: "Optional notes.", example: "" },
    ],
    relations: [],
    notes: [],
  },

  employees: {
    entity: "employees",
    title: "Employees",
    tableId: "96",
    orgSelectable: true,
    fields: [
      { key: "name", header: "Name", type: "text", required: true, help: "Full name.", example: "Kofi Boateng" },
      { key: "address", header: "Address", type: "text", required: true, help: "Address.", example: "5 High Street, Kumasi" },
      { key: "phone", header: "Phone", type: "text", required: true, help: "Phone number.", example: "+233 24 000 0000" },
      { key: "email", header: "Email", type: "email", required: true, help: "Must be valid and not used by another employee.", example: "kofi@example.com" },
      { key: "description", header: "Description", type: "longtext", help: "Optional notes.", example: "" },
    ],
    relations: [
      { key: "department", label: "Department", source: "departments", multiple: false, required: true, help: "Employee's department" },
    ],
    notes: [
      "If a user account already exists for an email in your organization, the employee is created from that user account's details.",
    ],
  },

  users: {
    entity: "users",
    title: "Users",
    tableId: "38",
    orgSelectable: true,
    fields: [
      { key: "name", header: "Name", type: "text", required: true, help: "Full name.", example: "Esi Owusu" },
      { key: "address", header: "Address", type: "text", required: true, help: "Address.", example: "8 Castle Road, Accra" },
      { key: "phone", header: "Phone", type: "text", required: true, help: "Phone number.", example: "+233 26 000 0000" },
      { key: "email", header: "Email", type: "email", required: true, help: "Must be valid and not used by another user.", example: "esi@example.com" },
      { key: "description", header: "Description", type: "longtext", help: "Optional notes.", example: "" },
    ],
    relations: [
      { key: "department", label: "Department", source: "departments", multiple: false, required: true, help: "Roles come from the department" },
    ],
    notes: [
      "Each user receives a welcome email with a generated password.",
      "If an employee record already exists for an email in your organization, its details are overwritten with the imported ones.",
    ],
  },

  departments: {
    entity: "departments",
    title: "Departments",
    tableId: "95",
    orgSelectable: true,
    fields: [
      { key: "name", header: "Name", type: "text", required: true, help: "Department name.", example: "Sales" },
      { key: "description", header: "Description", type: "longtext", help: "Optional notes.", example: "" },
    ],
    relations: [
      { key: "head", label: "HOD", source: "employees", multiple: false, required: "unlessSystemAdmin", help: "Head of department" },
    ],
    notes: [],
  },
};

// ---------------------------------------------------------------------------
// Value parsing and validation (pure; runs in the browser and on the server)
// ---------------------------------------------------------------------------

export type CellValue = string | number | boolean | null;
export type ImportRowInput = {
  values: Record<string, CellValue>;
  relations: Record<string, string | string[] | null>;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TRUE_WORDS = ["yes", "y", "true", "1"];
const FALSE_WORDS = ["no", "n", "false", "0"];

const isBlank = (v: unknown) => v === null || v === undefined || (typeof v === "string" && v.trim() === "");

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Accepts YYYY-MM-DD, DD/MM/YYYY, or an Excel serial number; returns YYYY-MM-DD or null. */
export function toISODate(v: unknown): string | null {
  if (isBlank(v)) return null;
  if (typeof v === "number" && v > 0 && v < 100000) {
    const ms = Math.round((v - 25569) * 86400 * 1000); // Excel epoch
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
  }
  const s = String(v).trim();
  let y: number, m: number, d: number;
  let match = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) {
    [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  } else if ((match = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/))) {
    [d, m, y] = [Number(match[1]), Number(match[2]), Number(match[3])];
  } else {
    return null;
  }
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return date.toISOString().slice(0, 10);
}

/** Normalizes one cell into the value the server expects, or returns an error message. */
export function parseCell(field: ImportField, raw: unknown): { value: CellValue; error?: string } {
  if (isBlank(raw)) {
    if (field.defaultValue !== undefined) return { value: field.defaultValue };
    if (field.required) return { value: null, error: `${field.header} is required` };
    return { value: null };
  }

  switch (field.type) {
    case "number": {
      const n = typeof raw === "number" ? raw : Number(String(raw).replace(/,/g, "").trim());
      if (!Number.isFinite(n)) return { value: null, error: `${field.header} must be a number` };
      if (field.min !== undefined && n < field.min) return { value: n, error: `${field.header} must be ${field.min} or more` };
      return { value: n };
    }
    case "boolean": {
      if (typeof raw === "boolean") return { value: raw };
      const s = String(raw).trim().toLowerCase();
      if (TRUE_WORDS.includes(s)) return { value: true };
      if (FALSE_WORDS.includes(s)) return { value: false };
      return { value: null, error: `${field.header} must be Yes or No` };
    }
    case "enum": {
      const s = String(raw).trim().toLowerCase();
      const match = field.options?.find((o) => o.toLowerCase() === s);
      if (!match) return { value: String(raw), error: `${field.header} must be one of: ${field.options?.join(", ")}` };
      return { value: match };
    }
    case "date": {
      const iso = toISODate(raw);
      if (!iso) return { value: String(raw), error: `${field.header} must be a date (YYYY-MM-DD)` };
      if (field.notInFuture && iso > todayISO()) return { value: iso, error: `${field.header} cannot be in the future` };
      return { value: iso };
    }
    case "email": {
      const s = String(raw).trim().toLowerCase();
      if (!EMAIL_RE.test(s)) return { value: s, error: `${field.header} must be a valid email` };
      return { value: s };
    }
    default:
      return { value: String(raw).trim() };
  }
}

export type RowCheck = { values: Record<string, CellValue>; errors: string[] };

/**
 * Validates one row's fields, cross-field rules and required related items.
 * `isSystemAdmin` relaxes relations marked "unlessSystemAdmin", like the forms do.
 */
export function validateRow(spec: ImportSpec, row: ImportRowInput, isSystemAdmin: boolean): RowCheck {
  const values: Record<string, CellValue> = {};
  const errors: string[] = [];

  for (const field of spec.fields) {
    const { value, error } = parseCell(field, row.values?.[field.key]);
    values[field.key] = value;
    if (error) errors.push(error);
  }

  for (const rel of spec.relations) {
    if (!relationApplies(rel, values)) continue;
    const required = rel.required === true || (rel.required === "unlessSystemAdmin" && !isSystemAdmin);
    const v = row.relations?.[rel.key];
    const empty = !v || (Array.isArray(v) && v.length === 0);
    if (required && empty) errors.push(`Select ${rel.multiple ? "at least one " : "a "}${rel.label.toLowerCase()}`);
  }

  // Cross-field rules mirrored from the forms
  if (spec.entity === "packagingItems") {
    const qty = Number(values.quantity ?? 0);
    const rejected = Number(values.qRejected ?? 0);
    if (rejected > qty) errors.push("Quantity rejected cannot be more than quantity received");
    if (rejected > 0 && isBlank(values.reasonForRejection)) errors.push("Reason for rejection is required when items are rejected");
  }

  return { values, errors };
}

/** Maps a spreadsheet header to a field key (case, spaces and a trailing * are ignored). */
export function matchHeader(spec: ImportSpec, header: string): string | null {
  const norm = (s: string) => s.toLowerCase().replace(/\*/g, "").replace(/[\s_\-/]+/g, "").trim();
  const h = norm(header);
  if (!h) return null;
  const field = spec.fields.find((f) => norm(f.header) === h || norm(f.key) === h);
  return field?.key ?? null;
}
