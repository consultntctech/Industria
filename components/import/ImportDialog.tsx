'use client'

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Autocomplete, Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, TablePagination, TextField } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { FaFileCsv, FaFileExcel, FaTrashAlt, FaUpload } from "react-icons/fa";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { isSystemAdmin } from "@/Data/roles/permissions";
import { useActiveCurrency } from "@/components/currency/CurrencyProvider";
import SearchSelectOrgs from "@/components/shared/inputs/dropdowns/SearchSelectOrgs";
import GenericLabel from "@/components/shared/inputs/GenericLabel";
import PrimaryButton from "@/components/shared/buttons/PrimaryButton";
import DialogueAlet from "@/components/misc/DialogueAlet";
import {
  CellValue,
  IMPORT_SPECS,
  ImportEntity,
  ImportField,
  ImportRelation,
  ImportRowInput,
  MAX_IMPORT_ROWS,
  parseCell,
  relationApplies,
  validateRow,
} from "@/lib/import/importSpecs";
import { describeFormat, downloadCsvTemplate, downloadExcelTemplate, parseImportFile } from "@/lib/import/spreadsheet";
import { importRecords, ImportResult, ImportRowResult } from "@/lib/actions/import.action";
import { RelationOption, useImportOptions } from "./useImportOptions";

type Row = { id: number; values: Record<string, CellValue>; relations: Record<string, string[]> };

type ImportDialogProps = {
  entity: ImportEntity;
  open: boolean;
  onClose: () => void;
};

const PAGE_SIZES = [10, 25, 50];
const inputClass = "w-full min-w-[7rem] rounded border px-2 py-1 text-sm outline-none focus:border-blue-500";

const ImportDialog = ({ entity, open, onClose }: ImportDialogProps) => {
  const spec = IMPORT_SPECS[entity];
  const { user } = useAuth();
  const isAdmin = isSystemAdmin(user);
  const queryClient = useQueryClient();
  const currency = useActiveCurrency();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"upload" | "review" | "done">("upload");
  const [rows, setRows] = useState<Row[]>([]);
  const [fileName, setFileName] = useState("");
  const [orgId, setOrgId] = useState("");
  const [server, setServer] = useState<Map<number, ImportRowResult>>(new Map());
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState<"" | "parsing" | "checking" | "saving">("");
  const [confirm, setConfirm] = useState(false);
  const [summary, setSummary] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [bulk, setBulk] = useState<Record<string, string[]>>({});

  const needsOrg = !!spec.orgSelectable && isAdmin;
  const targetOrg = needsOrg ? orgId : user?.org;
  const { options, isLoading: optionsLoading } = useImportOptions(spec, targetOrg);

  const reset = () => {
    setStep("upload"); setRows([]); setFileName(""); setServer(new Map()); setChecked(false);
    setBusy(""); setSummary(""); setPage(0); setBulk({});
    if (fileRef.current) fileRef.current.value = "";
  };
  const handleClose = () => { if (busy === "saving") return; reset(); setOrgId(""); onClose(); };

  // Related items belong to one organization; switching org clears them.
  useEffect(() => {
    setRows((prev) => prev.map((r) => ({ ...r, relations: {} })));
    setServer(new Map()); setChecked(false); setBulk({});
  }, [orgId]);

  // ---- per-row validation (same rules the server applies) -----------------
  const checks = useMemo(
    () => new Map(rows.map((r) => [r.id, validateRow(spec, toInput(spec, r), isAdmin)])),
    [rows, spec, isAdmin],
  );
  const rowErrors = (r: Row) => [...(checks.get(r.id)?.errors ?? []), ...(server.get(r.id)?.errors ?? [])]
    .filter((e, i, a) => a.indexOf(e) === i);
  const rowWarnings = (r: Row) => server.get(r.id)?.warnings ?? [];

  const errorCount = rows.filter((r) => rowErrors(r).length).length;
  const warningCount = rows.filter((r) => rowWarnings(r).length).length;

  // ---- options helpers -----------------------------------------------------
  const optionsFor = (rel: ImportRelation, row?: Row): RelationOption[] => {
    const all = options[rel.source] ?? [];
    // Packaging items: only suppliers of the chosen material type (as in the form).
    if (entity === "packagingItems" && rel.key === "suppliers") {
      if (!row) return all;
      const type = options.packagingTypes?.find((t) => t.id === row.relations.type?.[0]);
      const allowed = new Set(type?.supplierIds ?? []);
      return all.filter((o) => allowed.has(o.id));
    }
    return all;
  };

  const pruneSuppliers = (row: Row): Row => {
    if (entity !== "packagingItems" || !row.relations.suppliers?.length) return row;
    const allowed = new Set(optionsFor(spec.relations.find((r) => r.key === "suppliers")!, row).map((o) => o.id));
    return { ...row, relations: { ...row.relations, suppliers: row.relations.suppliers.filter((s) => allowed.has(s)) } };
  };

  // ---- editing ---------------------------------------------------------------
  const touch = (id: number) => {
    setChecked(false);
    setServer((prev) => { const next = new Map(prev); next.delete(id); return next; });
  };
  const setValue = (id: number, key: string, value: CellValue) => {
    touch(id);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, values: { ...r.values, [key]: value } } : r)));
  };
  const setRelation = (id: number, key: string, ids: string[]) => {
    touch(id);
    setRows((prev) => prev.map((r) => (r.id === id ? pruneSuppliers({ ...r, relations: { ...r.relations, [key]: ids } }) : r)));
  };
  const applyToAll = (rel: ImportRelation) => {
    const ids = bulk[rel.key] ?? [];
    setChecked(false); setServer(new Map());
    setRows((prev) => prev.map((r) => {
      if (!relationApplies(rel, checks.get(r.id)?.values ?? r.values)) return r;
      return pruneSuppliers({ ...r, relations: { ...r.relations, [rel.key]: ids } });
    }));
    enqueueSnackbar(`${rel.label} applied to all rows`, { variant: "success" });
  };
  const removeRow = (id: number) => { touch(id); setRows((prev) => prev.filter((r) => r.id !== id)); };

  // ---- file upload -------------------------------------------------------------
  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy("parsing");
    try {
      const parsed = await parseImportFile(spec, file);
      if (parsed.missingColumns.length) {
        enqueueSnackbar(`Missing required column(s): ${parsed.missingColumns.join(", ")}. Use the template headers.`, { variant: "error" });
        return;
      }
      if (!parsed.rows.length) { enqueueSnackbar("The file has no data rows", { variant: "error" }); return; }
      if (parsed.rows.length > MAX_IMPORT_ROWS) {
        enqueueSnackbar(`The file has ${parsed.rows.length} rows. Import up to ${MAX_IMPORT_ROWS} at a time.`, { variant: "error" });
        return;
      }
      if (parsed.unknownHeaders.length) {
        enqueueSnackbar(`Ignored column(s): ${parsed.unknownHeaders.join(", ")}`, { variant: "warning" });
      }
      // Show normalized values (canonical enum spelling, ISO dates, defaults).
      const next: Row[] = parsed.rows.map((raw, i) => {
        const values: Record<string, CellValue> = {};
        spec.fields.forEach((f) => {
          const { value, error } = parseCell(f, raw[f.key]);
          values[f.key] = error ? (raw[f.key] ?? null) : value;
        });
        return { id: i + 1, values, relations: {} };
      });
      setRows(next); setFileName(file.name); setServer(new Map()); setChecked(false); setPage(0);
      setStep("review");
    } catch (err) {
      console.log(err);
      enqueueSnackbar(err instanceof Error ? err.message : "Could not read the file", { variant: "error" });
    } finally {
      setBusy("");
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // ---- server calls ----------------------------------------------------------------
  const payload = () => rows.map((r) => toInput(spec, r));
  const callOptions = (dryRun: boolean) => ({ dryRun, orgId: needsOrg ? orgId : undefined, currencyId: currency?._id });

  const applyResults = (result: ImportResult | undefined, source: Row[]) => {
    const map = new Map<number, ImportRowResult>();
    result?.results?.forEach((res) => { const row = source[res.row - 1]; if (row) map.set(row.id, res); });
    setServer(map);
    return map;
  };

  const runCheck = async (): Promise<Map<number, ImportRowResult> | null> => {
    if (needsOrg && !orgId) { enqueueSnackbar("Select an organization first", { variant: "error" }); return null; }
    setBusy("checking");
    try {
      const res = await importRecords(entity, payload(), callOptions(true));
      if (res.error) { enqueueSnackbar(res.message, { variant: "error" }); return null; }
      const map = applyResults(res.payload as ImportResult, rows);
      setChecked(true);
      return map;
    } catch (err) {
      console.log(err);
      enqueueSnackbar("Error occurred while checking the rows", { variant: "error" });
      return null;
    } finally {
      setBusy("");
    }
  };

  const onSave = async () => {
    if (!rows.length) return;
    if (errorCount) { enqueueSnackbar(`Fix the ${errorCount} row(s) with errors first`, { variant: "error" }); return; }
    const map = checked ? server : await runCheck();
    if (!map) return;
    const blocked = rows.filter((r) => map.get(r.id)?.errors.length).length;
    if (blocked) { enqueueSnackbar(`Fix the ${blocked} row(s) with errors first`, { variant: "error" }); return; }
    if (rows.some((r) => map.get(r.id)?.warnings.length)) { setConfirm(true); return; }
    await execute();
  };

  const execute = async () => {
    setConfirm(false);
    setBusy("saving");
    const source = rows;
    try {
      const res = await importRecords(entity, source.map((r) => toInput(spec, r)), callOptions(false));
      const result = res.payload as ImportResult | undefined;
      if (!result?.results) { enqueueSnackbar(res.message, { variant: "error" }); return; }

      if (result.created) await queryClient.invalidateQueries();
      const map = applyResults(result, source);
      const remaining = source.filter((r) => map.get(r.id)?.status !== "created");
      setRows(remaining);
      setChecked(false);
      enqueueSnackbar(res.message, { variant: res.error || result.failed || result.invalid ? "error" : "success", autoHideDuration: 9000 });

      if (!remaining.length) { setSummary(res.message); setStep("done"); }
    } catch (err) {
      console.log(err);
      enqueueSnackbar("Error occurred while importing", { variant: "error" });
    } finally {
      setBusy("");
    }
  };

  // ---- rendering ------------------------------------------------------------------------
  const pageRows = rows.slice(page * pageSize, page * pageSize + pageSize);

  const renderField = (row: Row, field: ImportField) => {
    const raw = row.values[field.key];
    const invalid = !!parseCell(field, raw).error;
    const cls = `${inputClass} ${invalid ? "border-red-500 bg-red-50" : "border-gray-300"}`;
    const str = raw === null || raw === undefined ? "" : String(raw);

    if (field.type === "enum") {
      return (
        <select className={cls} value={str} onChange={(e) => setValue(row.id, field.key, e.target.value || null)}>
          {!field.required && <option value="">—</option>}
          {!field.options?.includes(str) && str && <option value={str}>{str}</option>}
          {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    }
    if (field.type === "boolean") {
      const v = raw === true ? "Yes" : raw === false ? "No" : str;
      return (
        <select className={cls} value={v} onChange={(e) => setValue(row.id, field.key, e.target.value === "Yes" ? true : e.target.value === "No" ? false : null)}>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      );
    }
    return (
      <input
        className={cls}
        type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
        max={field.type === "date" && field.notInFuture ? new Date().toISOString().slice(0, 10) : undefined}
        min={field.type === "number" ? field.min : undefined}
        value={str}
        title={str}
        onChange={(e) => setValue(row.id, field.key, e.target.value)}
      />
    );
  };

  const renderRelation = (row: Row, rel: ImportRelation) => {
    const values = checks.get(row.id)?.values ?? row.values;
    if (!relationApplies(rel, values)) return <span className="greyText">Not applicable</span>;
    const opts = optionsFor(rel, row);
    const ids = row.relations[rel.key] ?? [];
    const required = rel.required === true || (rel.required === "unlessSystemAdmin" && !isAdmin);
    const missing = required && ids.length === 0;
    const needsType = entity === "packagingItems" && rel.key === "suppliers" && !row.relations.type?.length;

    return (
      <Autocomplete
        size="small"
        multiple={rel.multiple}
        options={opts}
        loading={optionsLoading}
        disabled={needsType || (needsOrg && !orgId)}
        value={rel.multiple ? opts.filter((o) => ids.includes(o.id)) : opts.find((o) => o.id === ids[0]) ?? null}
        onChange={(_, v) => setRelation(row.id, rel.key, (Array.isArray(v) ? v : v ? [v] : []).map((o) => o.id))}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        getOptionLabel={(o) => o.label}
        sx={{ minWidth: 220 }}
        renderInput={(params) => (
          <TextField {...params} error={missing} placeholder={needsType ? "Select a material type first" : `Select ${rel.label.toLowerCase()}`} />
        )}
      />
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xl">
      <DialogTitle>Import {spec.title}</DialogTitle>
      <DialogContent dividers>
        {busy && <LinearProgress className="mb-3" />}

        {step === "upload" && (
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-2">
              <span className="semibold">1. Download a template</span>
              <span className="greyText">Fill in one row per record. The Excel template has dropdowns and an Instructions sheet.</span>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => downloadExcelTemplate(spec).catch(() => enqueueSnackbar("Could not create the template", { variant: "error" }))} className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2 rounded border border-green-700 px-3 py-1.5 text-sm text-green-700 hover:bg-green-50">
                  <FaFileExcel /> Excel template (.xlsx)
                </button>
                <button type="button" onClick={() => downloadCsvTemplate(spec)} className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2 rounded border border-gray-500 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">
                  <FaFileCsv /> CSV template (.csv)
                </button>
              </div>
            </section>

            <section className="flex flex-col gap-2">
              <span className="semibold">Columns the system accepts</span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-100">
                    <tr><th className="p-2">Column</th><th className="p-2">Required</th><th className="p-2">Format / accepted values</th><th className="p-2">Notes</th><th className="p-2">Example</th></tr>
                  </thead>
                  <tbody>
                    {spec.fields.map((f) => (
                      <tr key={f.key} className="border-b border-gray-100 align-top">
                        <td className="p-2 font-medium">{f.header}</td>
                        <td className="p-2">{f.required ? "Yes" : "No"}</td>
                        <td className="p-2">{describeFormat(f)}</td>
                        <td className="p-2">{f.help}</td>
                        <td className="p-2 text-gray-500">{f.example}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {spec.relations.length > 0 && (
                <span className="greyText">
                  After uploading, you will select the {spec.relations.map((r) => r.label).join(", ")} for each row. These are not columns in the file.
                </span>
              )}
              {spec.notes.map((n) => <span key={n} className="greyText">Note: {n}</span>)}
              <span className="greyText">Up to {MAX_IMPORT_ROWS} rows per file. Nothing is saved until every row passes the checks.</span>
            </section>

            <section className="flex flex-col gap-2">
              <span className="semibold">2. Upload your file</span>
              <label className="flex w-fit cursor-pointer items-center gap-2 rounded border border-blue-600 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-50">
                <FaUpload /> Choose .xlsx or .csv file
                <input ref={fileRef} type="file" accept=".xlsx,.csv" className="hidden" onChange={onFile} disabled={!!busy} />
              </label>
            </section>
          </div>
        )}

        {step === "review" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="semibold">{fileName}</span>
                <span className="greyText">
                  {rows.length} row(s) · <span className={errorCount ? "text-red-600" : ""}>{errorCount} with errors</span>
                  {warningCount > 0 && <> · <span className="text-amber-600">{warningCount} with warnings</span></>}
                  {checked && !errorCount && <> · <span className="text-green-700">checked</span></>}
                </span>
              </div>
              <div className="flex gap-2">
                <button type="button" disabled={!!busy} onClick={reset} className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50">Upload a different file</button>
                <button type="button" disabled={!!busy || !rows.length} onClick={runCheck} className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 rounded border border-blue-600 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-50">Check rows</button>
              </div>
            </div>

            {needsOrg && (
              <GenericLabel label="Organization *" input={<SearchSelectOrgs setOrgId={setOrgId} required />} />
            )}
            {entity === "packagingItems" && (
              <span className="greyText">
                Prices and charges are recorded in {currency ? `${currency.name} (${currency.symbol})` : "the primary currency"}. Change the currency from the app header before saving if needed.
              </span>
            )}

            {spec.relations.length > 0 && (
              <div className="flex flex-col gap-2 rounded-xl border border-gray-200 p-3">
                <span className="smallText font-semibold">Apply to all rows</span>
                <div className="flex flex-wrap gap-4">
                  {spec.relations.map((rel) => {
                    const opts = optionsFor(rel);
                    const ids = bulk[rel.key] ?? [];
                    return (
                      <div key={rel.key} className="flex items-center gap-2">
                        <Autocomplete
                          size="small"
                          multiple={rel.multiple}
                          options={opts}
                          disabled={needsOrg && !orgId}
                          value={rel.multiple ? opts.filter((o) => ids.includes(o.id)) : opts.find((o) => o.id === ids[0]) ?? null}
                          onChange={(_, v) => setBulk((b) => ({ ...b, [rel.key]: (Array.isArray(v) ? v : v ? [v] : []).map((o) => o.id) }))}
                          isOptionEqualToValue={(a, b) => a.id === b.id}
                          getOptionLabel={(o) => o.label}
                          sx={{ minWidth: 240 }}
                          renderInput={(params) => <TextField {...params} label={rel.label} />}
                        />
                        <button type="button" onClick={() => applyToAll(rel)} disabled={needsOrg && !orgId} className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 rounded border border-gray-300 px-2 py-1 text-sm hover:bg-gray-50">Apply</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2 min-w-[14rem]">Status</th>
                    {spec.fields.map((f) => <th key={f.key} className="p-2 whitespace-nowrap">{f.header}{f.required ? " *" : ""}</th>)}
                    {spec.relations.map((r) => (
                      <th key={r.key} className="p-2 whitespace-nowrap">{r.label}{r.required === true || (r.required === "unlessSystemAdmin" && !isAdmin) ? " *" : ""}</th>
                    ))}
                    <th className="p-2" />
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((row) => {
                    const errors = rowErrors(row);
                    const warnings = rowWarnings(row);
                    return (
                      <tr key={row.id} className={`border-b border-gray-100 align-top ${errors.length ? "bg-red-50/40" : ""}`}>
                        <td className="p-2 text-gray-500">{row.id}</td>
                        <td className="p-2">
                          {errors.length === 0 && warnings.length === 0 && <span className="text-green-700">Ready</span>}
                          {errors.map((e) => <div key={e} className="text-xs text-red-600">{e}</div>)}
                          {warnings.map((w) => <div key={w} className="text-xs text-amber-600">{w}</div>)}
                        </td>
                        {spec.fields.map((f) => <td key={f.key} className="p-2">{renderField(row, f)}</td>)}
                        {spec.relations.map((rel) => <td key={rel.key} className="p-2">{renderRelation(row, rel)}</td>)}
                        <td className="p-2">
                          <button type="button" title="Remove row" onClick={() => removeRow(row.id)} className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 text-red-600 hover:text-red-800"><FaTrashAlt /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <TablePagination
              component="div"
              count={rows.length}
              page={Math.min(page, Math.max(0, Math.ceil(rows.length / pageSize) - 1))}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={pageSize}
              rowsPerPageOptions={PAGE_SIZES}
              onRowsPerPageChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
            />
            {busy === "saving" && entity === "users" && (
              <span className="greyText">Creating users and sending welcome emails. This can take a while.</span>
            )}
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col gap-2 py-6">
            <span className="semibold text-green-700">{summary}</span>
            <span className="greyText">The {spec.title.toLowerCase()} table has been refreshed.</span>
          </div>
        )}
      </DialogContent>

      <DialogActions>
        <button type="button" onClick={handleClose} disabled={busy === "saving"} className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 rounded px-4 py-1.5 text-sm hover:bg-gray-100">
          {step === "done" ? "Close" : "Cancel"}
        </button>
        {step === "review" && (
          <PrimaryButton
            type="button"
            onClick={onSave}
            disabled={!!busy || !rows.length}
            loading={busy === "saving"}
            text={busy === "saving" ? "Importing…" : `Save ${rows.length} row(s)`}
            className="px-4"
          />
        )}
      </DialogActions>

      <DialogueAlet
        open={confirm}
        handleClose={() => setConfirm(false)}
        agreeClick={execute}
        title="Some rows have warnings"
        content={`${warningCount} row(s) have warnings (shown in amber). Do you want to import all ${rows.length} row(s)?`}
        agreeText="Import"
      />
    </Dialog>
  );
};

/** Shapes a review row into what the import action accepts. */
function toInput(spec: (typeof IMPORT_SPECS)[ImportEntity], row: Row): ImportRowInput {
  const relations: ImportRowInput["relations"] = {};
  spec.relations.forEach((rel) => {
    const ids = row.relations[rel.key] ?? [];
    relations[rel.key] = rel.multiple ? ids : ids[0] ?? null;
  });
  return { values: row.values, relations };
}

export default ImportDialog;
