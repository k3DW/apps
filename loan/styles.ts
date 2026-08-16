import { type CSSProperties } from "react";
import { theme } from "./theme";

export const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100%",
    background: theme.color.bg,
    fontFamily: theme.font.mono,
    color: theme.color.ink,
    padding: "40px 20px",
    display: "flex",
    justifyContent: "center",
  },
  container: { width: "100%", maxWidth: 480 },

  eyebrow: {
    fontSize: 11,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: theme.color.goldMuted,
    marginBottom: theme.space(1.5),
  },
  eyebrowOnPanel: {
    fontSize: 11,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: theme.color.gold,
    marginBottom: theme.space(2),
  },

  heading: {
    fontFamily: theme.font.display,
    fontSize: 28,
    fontWeight: 400,
    margin: `0 0 ${theme.space(7)}px 0`,
    color: theme.color.ink,
    borderBottom: `2px solid ${theme.color.ink}`,
    paddingBottom: theme.space(4),
  },

  radioOption: {
    display: "flex",
    alignItems: "center",
    gap: theme.space(1),
    fontSize: 12,
    color: theme.color.inkSoft,
    cursor: "pointer",
  },
  radioInput: {
    accentColor: theme.color.goldMuted,
    cursor: "pointer",
  },

  panel: {
    marginTop: theme.space(8),
    padding: theme.space(6),
    background: theme.color.panel,
    color: theme.color.panelText,
    borderRadius: theme.radius,
  },
  panelHeadline: {
    fontFamily: theme.font.display,
    fontSize: 42,
    lineHeight: 1,
  },
  panelRow: {
    marginTop: theme.space(1.5),
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    color: theme.color.panelTextMuted,
  },
  panelRowFirst: {
    marginTop: theme.space(5),
    paddingTop: theme.space(4),
    borderTop: `1px solid ${theme.color.panelBorder}`,
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    color: theme.color.panelTextMuted,
  },
};
