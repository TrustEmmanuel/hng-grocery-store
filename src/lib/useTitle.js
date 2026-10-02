import { useEffect } from "react";

export function useTitle(title) {
  useEffect(() => {
    document.title = title
      ? `${title} · TajMart`
      : "TajMart — Your neighborhood Nigerian grocery";
  }, [title]);
}
