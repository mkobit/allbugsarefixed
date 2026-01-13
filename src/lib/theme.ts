// Centralized theme colors for charts and visualizations
export const THEME_COLORS = {
  dark: {
    backgroundColor: "transparent",
    textColor: "#e2e8f0", // slate-200
  },
  light: {
    backgroundColor: "transparent",
    textColor: "#1e293b", // slate-800
  },
};

export function getThemeColor(isDark: boolean): string {
  return isDark ? THEME_COLORS.dark.textColor : THEME_COLORS.light.textColor;
}
