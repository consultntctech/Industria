'use client'

import { useState } from "react";
import { Tooltip } from "@mui/material";
import { FaFileImport } from "react-icons/fa";
import dynamic from "next/dynamic";
import { useCanUser } from "@/hooks/useAuth";
import { useCanCreateUsers, useSettings } from "@/config/useSettings";
import { IMPORT_SPECS, ImportEntity } from "@/lib/import/importSpecs";

// The dialog (and exceljs) only load when someone opens it.
const ImportDialog = dynamic(() => import("./ImportDialog"), { ssr: false });

type ImportButtonProps = { entity: ImportEntity };

/** Import from Excel/CSV. Only shown to users who may create records on this table. */
const ImportButton = ({ entity }: ImportButtonProps) => {
  const spec = IMPORT_SPECS[entity];
  const [open, setOpen] = useState(false);
  const { primaryColour } = useSettings();
  const canCreate = useCanUser(spec.tableId, "CREATE");
  const canCreateUsers = useCanCreateUsers();

  if (!canCreate || (entity === "users" && !canCreateUsers)) return null;

  return (
    <>
      <Tooltip title={`Import ${spec.title.toLowerCase()} from Excel or CSV`}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{ color: primaryColour, borderColor: primaryColour }}
          className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium hover:opacity-80"
        >
          <FaFileImport /> Import
        </button>
      </Tooltip>
      {open && <ImportDialog entity={entity} open={open} onClose={() => setOpen(false)} />}
    </>
  );
};

export default ImportButton;
