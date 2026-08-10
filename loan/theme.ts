export const theme = {
  color: {
    bg: "#F7F4EE",
    ink: "#1C2B33",
    inkSoft: "#5C6B73",
    hairline: "#C9C0AC",
    gold: "#B99B5A",
    goldMuted: "#8A7B5C",
    panel: "#1C2B33",
    panelText: "#F7F4EE",
    panelTextMuted: "#C9C0AC",
    panelBorder: "#3A4A52",
    white: "#FFFFFF",
  },
  font: {
    display: "'Georgia', serif",
    mono: "'IBM Plex Mono', 'Courier New', monospace",
  },
  space: (n: number) => n * 4,
  radius: 4,
} as const;
