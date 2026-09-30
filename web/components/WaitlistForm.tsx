"use client";

import { useState } from "react";

type Labels = { placeholder: string; join: string; joined: string; invalid: string; error: string };

export function WaitlistForm({ locale, source, labels }: { locale: string; source: string; labels: Labels }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "ok" | "invalid" | "error">("idle");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale, source }),
      });
      const data = (await res.json()) as { status?: string };
      setState(data.status === "ok" ? "ok" : data.status === "invalid" ? "invalid" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "ok") {
    return <p className="rounded-2xl bg-white/70 px-5 py-4 font-semibold text-plum">{labels.joined}</p>;
  }

  return (
    <form onSubmit={submit} className="w-full max-w-md">
      <div className="flex gap-2 rounded-full bg-white p-1.5 shadow-lg shadow-coral/10 ring-1 ring-plum/10">
        <label htmlFor={`email-${source}`} className="sr-only">
          Email
        </label>
        <input
          id={`email-${source}`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={labels.placeholder}
          className="min-w-0 flex-1 bg-transparent px-4 text-base outline-none placeholder:text-plum/40"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="shrink-0 rounded-full bg-coral px-5 py-3 font-bold text-white transition hover:brightness-105 disabled:opacity-60"
        >
          {labels.join}
        </button>
      </div>
      {state === "invalid" && <p className="mt-2 px-4 text-sm text-coral">{labels.invalid}</p>}
      {state === "error" && <p className="mt-2 px-4 text-sm text-coral">{labels.error}</p>}
    </form>
  );
}
