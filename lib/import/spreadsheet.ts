// Browser-side template generation and file parsing for imports.
// exceljs is loaded on demand so it never weighs down normal page loads.
import { CellValue, ImportField, ImportSpec, MAX_IMPORT_ROWS, matchHeader } from "./importSpecs";

type ExcelModule = typeof import("exceljs");
const loadExcel = async (): Promise<ExcelModule> => {
  const mod = await import("exceljs");
  return ((mod as unknown as { default?: ExcelModule }).default ?? mod) as ExcelModule;
};

const DATA_SHEET = "Data";
const LISTS_SHEET = "Lists";
const fileBase = (spec: ImportSpec) => `${spec.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-import-template`;

const download = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export function describeFormat(field: ImportField): string {
  switch (field.type) {
    case "number": return field.min !== undefined ? `Number, ${field.min} or more` : "Number";
    case "date": return field.notInFuture ? "Date (YYYY-MM-DD), not in the future" : "Date (YYYY-MM-DD)";
    case "boolean": return "Yes or No";
    case "enum": return `One of: ${field.options?.join(", ")}`;
    case "email": return "Email address";
    default: return field.suggestions ? `Text. Suggested: ${field.suggestions.join(", ")}` : "Text";
  }
}

const colLetter = (n: number) => {
  let s = "";
  for (; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
};

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export async function downloadExcelTemplate(spec: ImportSpec) {
  const ExcelJS = await loadExcel();
  const wb = new ExcelJS.Workbook();
  wb.creator = "Industra";

  const data = wb.addWorksheet(DATA_SHEET, { views: [{ state: "frozen", ySplit: 1 }] });
  const guide = wb.addWorksheet("Instructions");
  const lists = wb.addWorksheet(LISTS_SHEET, { state: "hidden" });

  // ---- Data sheet: one header per field, with dropdowns and checks -------
  data.columns = spec.fields.map((f) => ({
    header: f.header,
    key: f.key,
    width: Math.max(14, f.header.length + 4, f.type === "longtext" ? 36 : 0),
  }));
  const header = data.getRow(1);
  header.font = { bold: true };
  header.height = 20;

  let listCol = 0;
  spec.fields.forEach((f, idx) => {
    const col = idx + 1;
    const cell = header.getCell(col);
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: f.required ? "FFFDE2E2" : "FFEFF3F8" } };
    cell.note = `${f.required ? "Required. " : "Optional. "}${describeFormat(f)}. ${f.help}`;

    // Lists live on a hidden sheet so long lists are not cut off.
    const values = f.type === "enum" ? f.options : f.type === "boolean" ? ["Yes", "No"] : f.suggestions;
    let listRef: string | undefined;
    if (values?.length) {
      listCol += 1;
      const letter = colLetter(listCol);
      lists.getCell(`${letter}1`).value = f.header;
      values.forEach((v, i) => (lists.getCell(`${letter}${i + 2}`).value = v));
      listRef = `${LISTS_SHEET}!$${letter}$2:$${letter}$${values.length + 1}`;
    }

    const column = data.getColumn(col);
    if (f.type === "date") column.numFmt = "yyyy-mm-dd";
    if (f.type === "text" || f.type === "email" || f.type === "longtext") column.numFmt = "@";

    for (let r = 2; r <= MAX_IMPORT_ROWS + 1; r++) {
      const c = data.getCell(r, col);
      if (listRef) {
        c.dataValidation = {
          type: "list",
          allowBlank: !f.required,
          formulae: [listRef],
          // Suggestions allow other text; fixed lists do not.
          showErrorMessage: f.type !== "text",
          errorStyle: "stop",
          errorTitle: f.header,
          error: describeFormat(f),
        };
      } else if (f.type === "number") {
        c.dataValidation = {
          type: "decimal",
          operator: "greaterThanOrEqual",
          allowBlank: true,
          formulae: [f.min ?? -1e15],
          showErrorMessage: true,
          errorTitle: f.header,
          error: describeFormat(f),
        };
      } else if (f.type === "date") {
        c.dataValidation = {
          type: "date",
          operator: f.notInFuture ? "lessThanOrEqual" : "greaterThan",
          allowBlank: true,
          formulae: [f.notInFuture ? new Date() : new Date(1900, 0, 1)],
          showErrorMessage: true,
          errorTitle: f.header,
          error: describeFormat(f),
        };
      }
    }
  });

  // ---- Instructions sheet ------------------------------------------------
  guide.columns = [{ width: 26 }, { width: 11 }, { width: 46 }, { width: 52 }, { width: 24 }];
  const title = guide.addRow([`${spec.title} import`]);
  title.font = { bold: true, size: 14 };
  guide.addRow([]);
  [
    `1. Fill in the "${DATA_SHEET}" sheet, one ${spec.title.toLowerCase().replace(/s$/, "")} per row. Keep the header row as it is.`,
    "2. Columns marked Required must be filled. Blank optional columns use their default.",
    `3. Upload the file on the ${spec.title} page using Import. You can import up to ${MAX_IMPORT_ROWS} rows at a time.`,
    spec.relations.length
      ? `4. After uploading, you will select the ${spec.relations.map((r) => r.label).join(", ")} for each row, then save.`
      : "4. Review the rows, then save.",
    "5. Nothing is saved until every row passes the checks.",
  ].forEach((line) => guide.addRow([line]));
  spec.notes.forEach((n) => guide.addRow([`Note: ${n}`]));
  guide.addRow([]);

  const head = guide.addRow(["Column", "Required", "Format / accepted values", "Notes", "Example"]);
  head.font = { bold: true };
  head.eachCell((c) => (c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEFF3F8" } }));
  spec.fields.forEach((f) => {
    const row = guide.addRow([f.header, f.required ? "Yes" : "No", describeFormat(f), f.help, f.example]);
    row.alignment = { wrapText: true, vertical: "top" };
  });

  if (spec.relations.length) {
    guide.addRow([]);
    guide.addRow(["Selected after upload (not columns in this file)"]).font = { bold: true };
    spec.relations.forEach((r) => {
      const req = r.required === true ? "Yes" : r.required === "unlessSystemAdmin" ? "Yes*" : "No";
      guide.addRow([r.label, req, r.multiple ? "One or more" : "One", r.help]).alignment = { wrapText: true, vertical: "top" };
    });
    if (spec.relations.some((r) => r.required === "unlessSystemAdmin")) {
      guide.addRow(["* Optional for system administrators."]);
    }
  }

  const buffer = await wb.xlsx.writeBuffer();
  download(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${fileBase(spec)}.xlsx`);
}

const csvEscape = (v: string) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

export function downloadCsvTemplate(spec: ImportSpec) {
  const line = spec.fields.map((f) => csvEscape(f.header)).join(",");
  // BOM so Excel opens the file as UTF-8
  download(new Blob(["﻿" + line + "\r\n"], { type: "text/csv;charset=utf-8" }), `${fileBase(spec)}.csv`);
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

export type ParsedFile = {
  rows: Record<string, CellValue>[];
  unknownHeaders: string[];
  missingColumns: string[];
};

/** RFC 4180 CSV parser (quoted fields, escaped quotes, CRLF/LF). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const s = text.replace(/^﻿/, "");

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (quoted) {
      if (ch === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && s[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += ch;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const cellToValue = (v: unknown): CellValue => {
  if (v === null || v === undefined) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return v;
  if (typeof v === "object") {
    const o = v as { text?: unknown; richText?: { text: string }[]; result?: unknown; error?: unknown; hyperlink?: string };
    if (o.richText) return o.richText.map((t) => t.text).join("");
    if ("result" in o) return cellToValue(o.result);
    if (o.text !== undefined) return cellToValue(o.text);
    if (o.error) return null;
  }
  return String(v);
};

function buildRows(spec: ImportSpec, headers: string[], body: CellValue[][]): ParsedFile {
  const keys = headers.map((h) => matchHeader(spec, h));
  const unknownHeaders = headers.filter((h, i) => h.trim() && !keys[i]);
  const present = new Set(keys.filter(Boolean));
  const missingColumns = spec.fields.filter((f) => f.required && !present.has(f.key)).map((f) => f.header);

  const rows: Record<string, CellValue>[] = [];
  for (const cells of body) {
    const rec: Record<string, CellValue> = {};
    keys.forEach((k, i) => {
      if (k) rec[k] = cells[i] ?? null;
    });
    const empty = Object.values(rec).every((v) => v === null || (typeof v === "string" && v.trim() === ""));
    if (!empty) rows.push(rec);
  }
  return { rows, unknownHeaders, missingColumns };
}

export async function parseImportFile(spec: ImportSpec, file: File): Promise<ParsedFile> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".csv")) {
    const table = parseCsv(await file.text());
    const [headers = [], ...body] = table;
    return buildRows(spec, headers, body);
  }

  if (name.endsWith(".xlsx")) {
    const ExcelJS = await loadExcel();
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await file.arrayBuffer());
    const ws =
      wb.getWorksheet(DATA_SHEET) ??
      wb.worksheets.find((w) => w.name !== "Instructions" && w.name !== LISTS_SHEET) ??
      wb.worksheets[0];
    if (!ws) return { rows: [], unknownHeaders: [], missingColumns: spec.fields.filter((f) => f.required).map((f) => f.header) };

    const width = ws.columnCount;
    const headers: string[] = [];
    for (let c = 1; c <= width; c++) headers.push(String(cellToValue(ws.getRow(1).getCell(c).value) ?? ""));

    const body: CellValue[][] = [];
    for (let r = 2; r <= ws.rowCount; r++) {
      const row = ws.getRow(r);
      const cells: CellValue[] = [];
      for (let c = 1; c <= width; c++) cells.push(cellToValue(row.getCell(c).value));
      body.push(cells);
    }
    return buildRows(spec, headers, body);
  }

  throw new Error("Upload an .xlsx or .csv file");
}
