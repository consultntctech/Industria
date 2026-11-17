'use client';
import { useMemo, useState } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle, IconButton, InputAdornment, TextField, CircularProgress } from "@mui/material";
import { IoClose } from "react-icons/io5";
import { FiCheck, FiSearch } from "react-icons/fi";
import { IOtherCurrency } from "@/lib/models/othercurrency.model";
import { ICurrency } from "@/lib/models/currency.model";

type Props = {
  open: boolean;
  onClose: () => void;
  currencies: IOtherCurrency[];
  activeId: string | null;
  base: ICurrency | null | undefined;
  loading: boolean;
  onSelect: (id: string) => void;
};

const CurrencyPickerDialog = ({ open, onClose, currencies, activeId, base, loading, onSelect }: Props) => {
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const sorted = [...currencies].sort((a, b) =>
      a.type === "default" ? -1 : b.type === "default" ? 1 : a.name.localeCompare(b.name)
    );
    if (!term) return sorted;
    return sorted.filter(
      (c) => c.name?.toLowerCase().includes(term) || c.symbol?.toLowerCase().includes(term)
    );
  }, [currencies, q]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" aria-labelledby="currency-picker-title">
      <DialogTitle id="currency-picker-title" sx={{ pr: 6 }}>
        Select currency
        <span className="block greyText mt-1">
          New amounts you enter anywhere in the app are recorded in this currency and converted to{" "}
          {base?.symbol || base?.name || "your primary currency"} for reporting.
        </span>
        <IconButton aria-label="Close" onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <IoClose />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <div className="p-3">
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder="Search currencies"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <FiSearch />
                  </InputAdornment>
                ),
              },
            }}
          />
        </div>
        {loading ? (
          <div className="flex-center p-6">
            <CircularProgress size={22} />
          </div>
        ) : list.length === 0 ? (
          <div className="p-6 text-center greyText">
            {currencies.length === 0 ? (
              <>
                No currencies yet.{" "}
                <Link className="link" href="/dashboard/config/currency" onClick={onClose}>
                  Configure currencies
                </Link>
              </>
            ) : (
              "No currency matches your search."
            )}
          </div>
        ) : (
          <ul role="listbox" aria-label="Currencies" className="max-h-80 overflow-y-auto pb-2">
            {list.map((c) => {
              const selected = c._id === activeId;
              return (
                <li key={c._id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => onSelect(c._id)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left cursor-pointer hover:bg-gray-100 ${
                      selected ? "bg-gray-100" : ""
                    }`}
                  >
                    <span className="inline-flex h-8 min-w-10 items-center justify-center rounded-md border border-gray-200 px-1.5 text-sm font-semibold">
                      {c.symbol}
                    </span>
                    <span className="flex flex-1 flex-col">
                      <span className="text-sm font-medium">
                        {c.name}
                        {c.type === "default" && <span className="ml-2 greyText2">Primary</span>}
                      </span>
                      {c.type !== "default" && (
                        <span className="greyText2">
                          1 {c.symbol} = {c.rate} {base?.symbol}
                        </span>
                      )}
                    </span>
                    {selected && <FiCheck className="text-indigo-600" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CurrencyPickerDialog;
