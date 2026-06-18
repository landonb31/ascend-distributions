"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

type VerificationCodeInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
};

export function VerificationCodeInput({
  value,
  onChange,
  disabled,
  id = "code",
}: VerificationCodeInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }, (_, index) => value[index] ?? "");

  function updateAt(index: number, nextChar: string) {
    const digit = nextChar.replace(/\D/g, "").slice(-1);
    const chars = Array.from({ length: 6 }, (_, i) => value[i] ?? "");
    chars[index] = digit;
    onChange(chars.join("").replace(/\s/g, ""));

    if (digit && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, key: string) {
    if (key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    onChange(pasted);
    const focusIndex = Math.min(pasted.length, 5);
    inputsRef.current[focusIndex]?.focus();
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-3" role="group" aria-label="6-digit verification code">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputsRef.current[index] = element;
          }}
          id={index === 0 ? id : undefined}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          className={cn(
            "h-14 w-11 sm:h-16 sm:w-12 rounded-lg border border-white/10 bg-white/5 text-center text-2xl font-mono font-semibold text-foreground",
            "focus:border-ascend-purple focus:outline-none focus:ring-2 focus:ring-ascend-purple/30",
            disabled && "opacity-50"
          )}
          onChange={(event) => updateAt(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event.key)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}
