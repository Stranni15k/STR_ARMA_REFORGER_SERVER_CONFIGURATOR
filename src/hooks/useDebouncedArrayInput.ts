import { useState, useEffect, useRef } from "react";

export function useDebouncedArrayInput(
  initialValue: string[] | undefined,
  onUpdate: (values: string[]) => void,
  debounceMs: number = 500
) {
  const [input, setInput] = useState(initialValue?.join(", ") || "");
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setInput(initialValue?.join(", ") || "");
  }, [initialValue]);

  const handleChange = (value: string) => {
    setInput(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const values = value === "" ? [] : value.split(",").map(v => v.trim()).filter(Boolean);
      onUpdate(values);
    }, debounceMs);
  };

  return { input, handleChange };
}
