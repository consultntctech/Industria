'use client';
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useFetchOtherCurrencyByOrg } from "@/hooks/fetch/useFetchOtherCurrency";
import { useCurrencyConfig } from "@/hooks/config/useCurrencyConfig";
import { getMyCurrencyPreference, setMyCurrencyPreference } from "@/lib/actions/preference.action";
import { IOtherCurrency } from "@/lib/models/othercurrency.model";
import { ICurrency } from "@/lib/models/currency.model";
import CurrencyPickerDialog from "./CurrencyPickerDialog";

type CurrencyContextValue = {
  /** Currency amounts are entered in. Falls back to the org's default currency. */
  active: IOtherCurrency | null;
  /** The org's primary (book-keeping) currency. */
  base: ICurrency | null | undefined;
  currencies: IOtherCurrency[];
  isLoading: boolean;
  setActive: (id: string) => void;
  openPicker: () => void;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const PREF_KEY = "currency-preference";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { currencies, isPending: currenciesLoading } = useFetchOtherCurrencyByOrg();
  const { currency: base } = useCurrencyConfig();
  const [pickerOpen, setPickerOpen] = useState(false);

  const { data: preferredId, isPending: prefLoading } = useQuery({
    queryKey: [PREF_KEY, user?._id],
    queryFn: async (): Promise<string | null> => {
      const res = await getMyCurrencyPreference();
      if (res.error) return null;
      return (res.payload as { currency: string | null })?.currency ?? null;
    },
    enabled: !!user,
    staleTime: Infinity,
  });

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await setMyCurrencyPreference(id);
      if (res.error) throw new Error(res.message);
      return id;
    },
    onMutate: async (id) => {
      const key = [PREF_KEY, user?._id];
      const previous = qc.getQueryData<string | null>(key);
      qc.setQueryData(key, id);
      return { previous, key };
    },
    onError: (err, _id, ctx) => {
      if (ctx) qc.setQueryData(ctx.key, ctx.previous);
      enqueueSnackbar(err instanceof Error ? err.message : "Could not change currency", { variant: "error" });
    },
    onSuccess: (id) => {
      const cur = currencies.find((c) => c._id === id);
      enqueueSnackbar(`Now entering amounts in ${cur?.name ?? "the selected currency"}`, { variant: "success" });
    },
  });

  const active = useMemo<IOtherCurrency | null>(() => {
    if (!currencies.length) return null;
    return (
      currencies.find((c) => c._id === preferredId) ??
      currencies.find((c) => c.type === "default") ??
      null
    );
  }, [currencies, preferredId]);

  const setActive = useCallback((id: string) => mutation.mutate(id), [mutation]);
  const openPicker = useCallback(() => setPickerOpen(true), []);

  const value = useMemo<CurrencyContextValue>(
    () => ({
      active,
      base,
      currencies,
      isLoading: currenciesLoading || (!!user && prefLoading),
      setActive,
      openPicker,
    }),
    [active, base, currencies, currenciesLoading, prefLoading, user, setActive, openPicker]
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
      <CurrencyPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        currencies={currencies}
        activeId={active?._id ?? null}
        base={base}
        loading={currenciesLoading}
        onSelect={(id) => {
          if (id !== active?._id) setActive(id);
          setPickerOpen(false);
        }}
      />
    </CurrencyContext.Provider>
  );
}

export const useCurrencyContext = (): CurrencyContextValue => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrencyContext must be used inside <CurrencyProvider>");
  return ctx;
};

/** The currency the signed-in user is entering amounts in (global header selection). */
export const useActiveCurrency = (): IOtherCurrency | null => useCurrencyContext().active;

type ActiveCurrencyFieldProps = {
  /** Currency an existing record was originally entered in, if any. */
  savedCurrency?: IOtherCurrency | null;
  label?: string;
};

/**
 * Read-only replacement for the old per-form currency dropdown. Shows which
 * currency the form will use and lets the user switch it globally.
 */
export const ActiveCurrencyField = ({ savedCurrency, label = "Currency" }: ActiveCurrencyFieldProps) => {
  const { active, isLoading, openPicker } = useCurrencyContext();
  const differs = !!savedCurrency?._id && !!active && savedCurrency._id !== active._id;

  return (
    <div className="flex flex-col w-full gap-1">
      <span className="smallText">{label}</span>
      <div className="flex items-center justify-between gap-3 rounded border border-gray-300 px-3 py-1.5">
        {isLoading ? (
          <span className="greyText">Loading…</span>
        ) : active ? (
          <span className="flex items-center gap-2 text-sm">
            <span className="inline-flex min-w-8 justify-center rounded bg-gray-100 px-1.5 font-semibold">
              {active.symbol}
            </span>
            <span>{active.name}</span>
            {active.type !== "default" && <span className="greyText">· rate {active.rate}</span>}
          </span>
        ) : (
          <span className="text-sm text-red-700">
            No currency configured.{" "}
            <Link className="link" href="/dashboard/config/currency">Set one up</Link>
          </span>
        )}
        <button type="button" onClick={openPicker} className="link text-sm font-medium shrink-0">
          Change
        </button>
      </div>
      {differs && (
        <span className="greyText2">
          This record was entered in {savedCurrency?.name} ({savedCurrency?.symbol}). Saving will record amounts in{" "}
          {active?.name}.
        </span>
      )}
    </div>
  );
};
