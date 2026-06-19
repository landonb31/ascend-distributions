import { createHash } from "crypto";

function upcCheckDigit(base11: string) {
  let sum = 0;
  for (let i = 0; i < 11; i++) {
    const digit = Number(base11[i]);
    sum += i % 2 === 0 ? digit * 3 : digit;
  }
  const mod = sum % 10;
  return mod === 0 ? 0 : 10 - mod;
}

export function generateUpc(seed: string) {
  const hash = createHash("sha256").update(seed).digest("hex");
  const prefix = "019"; // Ascend prefix block placeholder
  const body = hash.replace(/\D/g, "").slice(0, 8).padEnd(8, "0");
  const base11 = `${prefix}${body}`.slice(0, 11);
  return `${base11}${upcCheckDigit(base11)}`;
}

export function generateIsrc(seed: string) {
  const hash = createHash("sha256").update(seed).digest("hex");
  const year = new Date().getFullYear().toString().slice(-2);
  const registrant = "ASC";
  const designation = hash.replace(/\D/g, "").slice(0, 5).padStart(5, "0");
  return `US-${registrant}-${year}-${designation}`;
}

export function normalizeUpc(value?: string | null) {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  return digits.length === 12 ? digits : null;
}

export function normalizeIsrc(value?: string | null) {
  if (!value) return null;
  const cleaned = value.trim().toUpperCase();
  return /^[A-Z]{2}-[A-Z0-9]{3}-\d{2}-\d{5}$/.test(cleaned) ? cleaned : null;
}
