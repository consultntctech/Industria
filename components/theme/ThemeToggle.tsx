'use client';
import { useState, MouseEvent, ReactNode } from "react";
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import { FiMonitor, FiMoon, FiSun, FiCheck } from "react-icons/fi";

type Mode = "light" | "dark" | "system";

const options: { mode: Mode; label: string; icon: ReactNode }[] = [
  { mode: "light", label: "Light", icon: <FiSun /> },
  { mode: "dark", label: "Dark", icon: <FiMoon /> },
  { mode: "system", label: "System", icon: <FiMonitor /> },
];

const ThemeToggle = ({ className }: { className?: string }) => {
  const { mode, systemMode, setMode } = useColorScheme();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  // `mode` is undefined until MUI has read storage on the client.
  if (!mode) return <span className="size-9" />;

  const resolved = mode === "system" ? systemMode : mode;
  const open = (e: MouseEvent<HTMLElement>) => setAnchor(e.currentTarget);

  return (
    <>
      <Tooltip title="Theme">
        <IconButton aria-label="Change theme" onClick={open} className={className} sx={{ color: "inherit" }}>
          {resolved === "dark" ? <FiMoon size={18} /> : <FiSun size={18} />}
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        {options.map((o) => (
          <MenuItem
            key={o.mode}
            selected={mode === o.mode}
            onClick={() => {
              setMode(o.mode);
              setAnchor(null);
            }}
          >
            <ListItemIcon>{o.icon}</ListItemIcon>
            <ListItemText>{o.label}</ListItemText>
            {mode === o.mode && <FiCheck className="ml-3" />}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ThemeToggle;
