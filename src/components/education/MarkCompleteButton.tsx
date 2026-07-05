"use client";
// src/components/education/MarkCompleteButton.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  articleId: string;
  initiallyCompleted: boolean;
  isLoggedIn: boolean;
}

export default function MarkCompleteButton({ articleId, initiallyCompleted, isLoggedIn }: Props) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [loading, setLoading] = useState(false);

  if (!isLoggedIn) {
    return (
      <div className="p-5 rounded-2xl text-center" style={{ background: "var(--color-paper-dim)", border: "1px solid #E5E7EB" }}>
        <p className="text-sm text-gray-600 mb-3">
          <Link href="/login" className="font-semibold sw-text-brand">Sign in</Link> to track your progress through this lesson.
        </p>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="flex items-center justify-center gap-2 py-4 text-base font-semibold sw-text-brand">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Lesson Completed
      </div>
    );
  }

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch(`/api/learn/${articleId}/complete`, { method: "POST" });
      if (res.ok) { setCompleted(true); router.refresh(); }
    } catch { /* silent */ }
    setLoading(false);
  }

  return (
    <button onClick={handleClick} disabled={loading}
      className="w-full py-4 rounded-2xl font-semibold text-white text-base transition-all disabled:opacity-60 flex items-center justify-center gap-2 sw-btn-primary">
      {loading ? (
        <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Marking...</>
      ) : (
        <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Mark as Complete</>
      )}
    </button>
  );
}
