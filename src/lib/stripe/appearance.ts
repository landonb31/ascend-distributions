import type { Appearance } from "@stripe/stripe-js";

export const stripeAppearance: Appearance = {
  theme: "night",
  variables: {
    colorPrimary: "#8B5CF6",
    colorBackground: "#0a0a0a",
    colorText: "#fafafa",
    colorTextSecondary: "#a1a1aa",
    colorDanger: "#ef4444",
    fontFamily: "var(--font-inter), system-ui, sans-serif",
    borderRadius: "12px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": {
      border: "1px solid rgba(255, 255, 255, 0.1)",
      backgroundColor: "rgba(255, 255, 255, 0.03)",
      boxShadow: "none",
    },
    ".Input:focus": {
      border: "1px solid rgba(139, 92, 246, 0.5)",
      boxShadow: "0 0 0 1px rgba(139, 92, 246, 0.25)",
    },
    ".Label": {
      color: "#a1a1aa",
      fontWeight: "500",
    },
    ".Tab": {
      border: "1px solid rgba(255, 255, 255, 0.08)",
      backgroundColor: "rgba(255, 255, 255, 0.02)",
    },
    ".Tab--selected": {
      border: "1px solid rgba(139, 92, 246, 0.4)",
      backgroundColor: "rgba(139, 92, 246, 0.12)",
    },
    ".Block": {
      backgroundColor: "rgba(255, 255, 255, 0.02)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
    },
  },
};
