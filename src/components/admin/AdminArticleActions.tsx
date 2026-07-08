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
    <div className="admin-action-row">
      <button onClick={toggle} disabled={loading} className={`admin-btn ${isPublished ? "admin-btn-red" : "admin-btn-green"}`}>
        {loading ? "..." : isPublished ? "Unpublish" : "Publish"}
      </button>
      <button onClick={deleteArticle} disabled={loading} className="admin-btn admin-btn-red">
        Delete
      </button>
    </div>
  );
}
