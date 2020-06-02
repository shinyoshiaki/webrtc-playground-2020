import { useState, useCallback } from "react";

export default function useInput(
  init?: string
): [string, (e: { target: { value: string } }) => void, () => void] {
  const [value, setValue] = useState(init || "");
  const input = useCallback((e: any) => {
    setValue(e.target.value);
  }, []);
  const clear = useCallback(() => {
    setValue("");
  }, []);

  return [value, input, clear];
}
