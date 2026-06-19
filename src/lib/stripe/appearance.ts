import type { Appearance } from "@stripe/stripe-js";

export const stripeFonts = [
  {
    cssSrc:
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
  },
];

export const stripeAppearance: Appearance = {
  theme: "night",
  variables: {
    colorPrimary: "#8B5CF6",
    colorBackground: "#111111",
    colorText: "#f4f4f5",
    colorTextSecondary: "#d4d4d8",
    colorDanger: "#f87171",
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSizeBase: "16px",
    fontWeightNormal: "400",
    fontWeightMedium: "500",
    fontWeightBold: "600",
    spacingUnit: "5px",
    borderRadius: "10px",
  },
  rules: {
    ".Input": {
      border: "1px solid rgba(255, 255, 255, 0.14)",
      backgroundColor: "rgba(255, 255, 255, 0.06)",
      boxShadow: "none",
      fontSize: "16px",
      lineHeight: "24px",
      padding: "12px 14px",
      color: "#fafafa",
    },
    ".Input:focus": {
      border: "1px solid rgba(139, 92, 246, 0.6)",
      boxShadow: "0 0 0 2px rgba(139, 92, 246, 0.2)",
    },
    ".Input::placeholder": {
      color: "#a1a1aa",
    },
    ".Label": {
      color: "#e4e4e7",
      fontSize: "14px",
      fontWeight: "500",
      marginBottom: "8px",
    },
    ".Tab": {
      border: "1px solid rgba(255, 255, 255, 0.12)",
      backgroundColor: "rgba(255, 255, 255, 0.04)",
      fontSize: "15px",
      fontWeight: "500",
      padding: "12px 16px",
    },
    ".Tab--selected": {
      border: "1px solid rgba(139, 92, 246, 0.5)",
      backgroundColor: "rgba(139, 92, 246, 0.15)",
      color: "#fafafa",
    },
    ".TabLabel": {
      fontSize: "15px",
      fontWeight: "500",
    },
    ".Block": {
      backgroundColor: "rgba(255, 255, 255, 0.03)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    },
    ".Text": {
      color: "#e4e4e7",
      fontSize: "15px",
      lineHeight: "22px",
    },
    ".Error": {
      fontSize: "14px",
      lineHeight: "20px",
    },
  },
};
