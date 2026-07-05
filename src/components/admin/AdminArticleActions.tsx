"use client";
// src/components/admin/AdminArticleActions.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminArticleActions({ articleId, isPublished }: { articleId: string; isPublished: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      await fetch(`/api/admin/articles/${articleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !isPublished, publishedAt: !isPublished ? new Date().toISOString() : null }),
      });
      router.refresh();
    } catch { /* silent */ }
    setLoading(false);
  }

  async function deleteArticle() {
    if (!confirm("Delete this article? This cannot be undone.")) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/articles/${articleId}`, { method: "DELETE" });
      router.refresh();
    } catch { /* silent */ }
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={toggle} disabled={loading}
        className="text-xs font-medium px-2.5 py-1.5 rounded-lg border disabled:opacity-50 transition-colors"
        style={isPublished
          ? { borderColor: "var(--color-danger-border)", color: "var(--color-danger)" }
          : { borderColor: "var(--color-success-tint)", color: "var(--color-success)" }}>
        {loading ? "..." : isPublished ? "Unpublish" : "Publish"}
      </button>
      <button onClick={deleteArticle} disabled={loading}
        className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 disabled:opacity-50">
        Delete
      </button>
    </div>
  );
}
