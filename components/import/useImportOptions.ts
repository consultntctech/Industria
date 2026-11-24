import { useQueries } from "@tanstack/react-query";
import { ImportSpec, RelationSource } from "@/lib/import/importSpecs";
import { getCategoriesByOrg } from "@/lib/actions/category.action";
import { getSuppliersByOrg } from "@/lib/actions/supplier.action";
import { getProdTypesByOrg } from "@/lib/actions/prodtype.action";
import { getBatchesByOrg } from "@/lib/actions/batch.action";
import { getStoragesByOrg } from "@/lib/actions/storage.action";
import { getDepartmentsByOrg } from "@/lib/actions/department.action";
import { getEmployeeByOrg } from "@/lib/actions/employee.action";
import { IResponse } from "@/types/Types";

export type RelationOption = {
  id: string;
  label: string;
  /** Packaging types: ids of their suppliers (items may only use these). */
  supplierIds?: string[];
};

type Doc = Record<string, unknown> & { _id: string };
const idOf = (v: unknown) => (v && typeof v === "object" && "_id" in v ? String((v as { _id: unknown })._id) : String(v));

const LOADERS: Record<RelationSource, (org: string) => Promise<RelationOption[]>> = {
  categories: async (org) => list(await getCategoriesByOrg(org)).map((d) => ({ id: d._id, label: String(d.name) })),
  suppliers: async (org) => list(await getSuppliersByOrg(org)).map((d) => ({ id: d._id, label: String(d.name) })),
  packagingTypes: async (org) =>
    list(await getProdTypesByOrg(org)).map((d) => ({
      id: d._id,
      label: `${d.name}${d.code ? ` (${d.code})` : ""}`,
      supplierIds: ((d.suppliers as unknown[]) ?? []).map(idOf),
    })),
  packagingBatches: async (org) =>
    list(await getBatchesByOrg(org))
      .filter((d) => d.type === "Packaging Material")
      .map((d) => ({ id: d._id, label: String(d.code) })),
  storages: async (org) => list(await getStoragesByOrg(org)).map((d) => ({ id: d._id, label: String(d.name) })),
  departments: async (org) => list(await getDepartmentsByOrg(org)).map((d) => ({ id: d._id, label: String(d.name) })),
  employees: async (org) =>
    list(await getEmployeeByOrg(org)).map((d) => ({ id: d._id, label: `${d.name}${d.email ? ` (${d.email})` : ""}` })),
};

function list(res: IResponse): Doc[] {
  if (res?.error || !Array.isArray(res?.payload)) return [];
  return (res.payload as Doc[]).map((d) => ({ ...d, _id: String(d._id) }));
}

/** Loads the options for every related item the spec needs, scoped to `org`. */
export function useImportOptions(spec: ImportSpec, org: string | undefined) {
  const sources = [...new Set(spec.relations.map((r) => r.source))];
  const queries = useQueries({
    queries: sources.map((source) => ({
      queryKey: ["import-options", source, org],
      queryFn: () => LOADERS[source](org as string),
      enabled: !!org,
      staleTime: 30_000,
    })),
  });

  const options: Partial<Record<RelationSource, RelationOption[]>> = {};
  sources.forEach((s, i) => (options[s] = queries[i].data ?? []));
  const isLoading = queries.some((q) => q.isLoading);
  return { options, isLoading };
}
