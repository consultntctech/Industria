'use client';
import { Fragment, KeyboardEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, IconButton, CircularProgress } from "@mui/material";
import { skipToken, useQuery } from "@tanstack/react-query";
import { FiSearch, FiCornerDownLeft, FiFileText, FiArrowRight } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { useAuth } from "@/hooks/useAuth";
import { NavLinks } from "@/Data/NavLinks";
import { filterNavLinks } from "@/Data/roles/permissions";
import { flattenNav } from "@/functions/helpers";
import { ISessionRole } from "@/types/Types";
import { globalSearch } from "@/lib/actions/search.action";
import type { SearchHit } from "@/lib/actions/search.action";

type Row =
  | { kind: "page"; key: string; group: string; title: string; subtitle?: string; href: string; icon: ReactNode }
  | { kind: "record"; key: string; group: string; title: string; subtitle?: string; href: string };

const useDebounced = <T,>(value: T, ms: number) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
};

/** Highlights the matched part of a label. */
const Highlight = ({ text, term }: { text: string; term: string }) => {
  const i = term ? text.toLowerCase().indexOf(term.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-sm bg-transparent font-semibold text-indigo-600">{text.slice(i, i + term.length)}</mark>
      {text.slice(i + term.length)}
    </>
  );
};

type GlobalSearchProps = { open: boolean; onClose: () => void };

const GlobalSearch = ({ open, onClose }: GlobalSearchProps) => {
  const router = useRouter();
  const { user } = useAuth();
  const { data: roles } = useQuery<ISessionRole[]>({
    queryKey: ["permissions", user?._id],
    queryFn: skipToken,
    enabled: Boolean(user),
  });

  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const term = useDebounced(q.trim(), 250);

  // Pages the user can open, from the same permission-filtered nav as the sidebar.
  const pages = useMemo(() => {
    const visible = filterNavLinks(user, roles, NavLinks());
    return flattenNav(visible).map(({ item }) => item);
  }, [user, roles]);

  const { data: hits = [], isFetching } = useQuery({
    queryKey: ["global-search", user?._id, term],
    queryFn: async (): Promise<SearchHit[]> => {
      const res = await globalSearch(term);
      return res.error ? [] : ((res.payload as SearchHit[]) ?? []);
    },
    enabled: open && !!user && term.length >= 2,
    staleTime: 15_000,
    placeholderData: (prev) => prev,
  });

  const rows = useMemo<Row[]>(() => {
    const t = q.trim().toLowerCase();
    const pageRows: Row[] = pages
      .filter((p) => !t || p.title.toLowerCase().includes(t) || p.link?.toLowerCase().includes(t))
      .slice(0, t ? 6 : 8)
      .map((p) => ({
        kind: "page",
        key: `page-${p.id}`,
        group: "Pages",
        title: p.title,
        subtitle: p.link,
        href: p.link!,
        icon: p.icon,
      }));
    const recordRows: Row[] =
      term.length >= 2
        ? hits.map((h) => ({ kind: "record", key: `${h.group}-${h.id}`, ...h }))
        : [];
    return [...pageRows, ...recordRows];
  }, [pages, hits, q, term]);

  useEffect(() => setCursor(0), [q]);

  useEffect(() => {
    if (!open) setQ("");
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${cursor}"]`)?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const go = (row?: Row) => {
    if (!row) return;
    onClose();
    router.push(row.href);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, rows.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(rows[cursor]);
    }
  };

  const typing = q.trim() !== term;
  const searching = term.length >= 2 && (isFetching || typing);
  const noRecords = term.length >= 2 && !searching && hits.length === 0;

  let lastGroup = "";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-label="Search"
      slotProps={{ paper: { sx: { alignSelf: "flex-start", mt: { xs: 2, sm: 10 }, overflow: "hidden" } } }}
    >
      <div className="flex items-center gap-3 border-b border-gray-200 px-4 py-3">
        <FiSearch className="text-gray-500 shrink-0" size={18} />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search records, people and pages…"
          aria-label="Search"
          role="combobox"
          aria-expanded
          aria-controls="global-search-list"
          aria-activedescendant={rows[cursor] ? `gs-${rows[cursor].key}` : undefined}
          className="flex-1 bg-transparent text-base outline-none focus-visible:outline-none"
          style={{ outline: "none" }}
        />
        {searching && <CircularProgress size={16} />}
        <IconButton size="small" aria-label="Close search" onClick={onClose}>
          <IoClose />
        </IconButton>
      </div>

      <ul id="global-search-list" ref={listRef} role="listbox" className="max-h-[60vh] overflow-y-auto py-2">
        {rows.map((row, i) => {
          const header = row.group !== lastGroup ? row.group : null;
          lastGroup = row.group;
          const active = i === cursor;
          return (
            <Fragment key={row.key}>
              {header && (
                <li role="presentation" className="px-4 pb-1 pt-3 text-[0.7rem] font-semibold uppercase tracking-wide text-gray-500">
                  {header}
                </li>
              )}
              <li
                id={`gs-${row.key}`}
                role="option"
                aria-selected={active}
                data-index={i}
                onMouseMove={() => setCursor(i)}
                onClick={() => go(row)}
                className={`mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 ${active ? "bg-gray-100" : ""}`}
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-500">
                  {row.kind === "page" ? row.icon : <FiFileText />}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">
                    <Highlight text={row.title} term={q.trim()} />
                  </span>
                  {row.subtitle && <span className="truncate greyText2">{row.subtitle}</span>}
                </span>
                {active ? <FiCornerDownLeft className="text-gray-500" /> : <FiArrowRight className="text-gray-400 opacity-0" />}
              </li>
            </Fragment>
          );
        })}

        {term.length < 2 && q.trim().length > 0 && (
          <li className="px-4 py-3 greyText">Type at least 2 characters to search records.</li>
        )}
        {noRecords && (
          <li className="px-4 py-6 text-center greyText">
            No records match “{term}” in the modules you can access.
          </li>
        )}
      </ul>

      <div className="flex items-center gap-4 border-t border-gray-200 px-4 py-2 greyText2">
        <span className="flex items-center gap-1"><span className="kbd">↑</span><span className="kbd">↓</span> navigate</span>
        <span className="flex items-center gap-1"><span className="kbd">Enter</span> open</span>
        <span className="flex items-center gap-1"><span className="kbd">Esc</span> close</span>
        <span className="ml-auto hidden sm:inline">Results limited to your organization and permissions</span>
      </div>
    </Dialog>
  );
};

export default GlobalSearch;
