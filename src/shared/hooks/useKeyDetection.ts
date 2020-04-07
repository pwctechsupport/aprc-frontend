import { useEffect } from "react";

export default function useKeyDetection(
  key: "Enter" | "Escape",
  callback: Function
) {
  useEffect(() => {
    function escFunction(event: KeyboardEvent): void {
      if (event.key === key) {
        callback();
      }
    }
    document.addEventListener("keydown", escFunction, false);
    return () => {
      document.removeEventListener("keydown", escFunction, false);
    };
  });
}
