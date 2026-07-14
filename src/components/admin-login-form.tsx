"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "admin", password: "rupiya123" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || "ورود ناموفق بود.");
      }

      router.push("/admin");
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "ورود ناموفق بود.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="space-y-2 text-sm text-[#d7c39f]">
        <span>نام کاربری</span>
        <input
          value={form.username}
          onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
          placeholder="admin"
          required
        />
      </label>

      <label className="space-y-2 text-sm text-[#d7c39f]">
        <span>رمز عبور</span>
        <input
          type="password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          placeholder="••••••••"
          required
        />
      </label>

      <button type="submit" disabled={isSubmitting} className="luxury-button w-full rounded-full px-6 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-70">
        {isSubmitting ? "در حال ورود..." : "ورود به داشبورد"}
      </button>

      {error ? <p className="text-sm text-[#d49e92]">{error}</p> : null}
    </form>
  );
}
