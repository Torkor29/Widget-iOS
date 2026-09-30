"use client";

import { useState } from "react";

export function CopyCode({ code, copy, copied }: { code: string; copy: string; copied: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          // Clipboard unavailable: the code stays visible on screen.
        }
      }}
      className="rounded-full bg-plum/5 px-4 py-2 text-sm font-semibold text-plum hover:bg-plum/10"
    >
      {done ? copied : copy}
    </button>
  );
}
