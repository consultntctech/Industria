'use client';
import { ReactNode } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

/**
 * MUI owns the colour-scheme state (light / dark / system) and toggles the `dark`
 * class on <html>. Tailwind's `dark:` variant and the CSS tokens in globals.css
 * key off that same class, so MUI widgets and Tailwind markup always agree.
 *
 * No <CssBaseline/>: its Emotion global <style> is rendered inline during SSR
 * and causes a hydration mismatch in the App Router. globals.css already sets
 * the page background, text colour and `color-scheme` it would provide.
 */
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#4F46E5" },
        secondary: { main: "#0EA5E9" },
        background: { default: "#F5F7FB", paper: "#FFFFFF" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#818CF8" },
        secondary: { main: "#38BDF8" },
        background: { default: "#0B0F17", paper: "#121826" },
        divider: "#263043",
        text: { primary: "#E5E7EB", secondary: "#94A3B8" },
      },
    },
  },
  shape: { borderRadius: 8 },
  typography: { fontFamily: "var(--font-geist-sans), system-ui, sans-serif" },
  components: {
    MuiDialog: { styleOverrides: { paper: { backgroundImage: "none" } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
  },
});

export default function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme} defaultMode="system" modeStorageKey="industra-theme">
      {children}
    </ThemeProvider>
  );
}
