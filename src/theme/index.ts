export const colors = {
  brand: {
    DEFAULT: "#0EA5E9",
    light: "#E0F2FE",
    dark: "#0284C7",
    50: "#F0F9FF",
  },
  success: { DEFAULT: "#10B981", light: "#D1FAE5" },
  warning: { DEFAULT: "#F59E0B", light: "#FEF3C7" },
  danger: { DEFAULT: "#EF4444", light: "#FEE2E2" },
  coral: { DEFAULT: "#F87171", light: "#FFF1F2" },
  purple: { DEFAULT: "#8B5CF6", light: "#EDE9FE" },
  surface: { DEFAULT: "#F8FAFB", card: "#FFFFFF", secondary: "#F1F5F9" },
  text: { DEFAULT: "#1E293B", secondary: "#64748B", muted: "#94A3B8" },
  border: { DEFAULT: "#E2E8F0", focus: "#0EA5E9" },
};

export const fonts = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semibold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  mono: "JetBrainsMono_400Regular",
  monoMedium: "JetBrainsMono_500Medium",
};

export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 22,
  "2xl": 28,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 20, full: 9999 };

export const shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHover: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  glow: {
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
  },
};
