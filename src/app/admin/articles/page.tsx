// src/app/admin/articles/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/formatters";
import AdminArticleActions from "@/components/admin/AdminArticleActions";

export default async function AdminArticlesPage() {
  const articles = await prisma.article.findMany({
    orderBy: [{ category: "asc" }, { lessonNumber: "asc" }, { createdAt: "desc" }],
    include: { author: { select: { firstName: true, lastName: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold sw-text-ink">Articles & Lessons</h1>
          <p className="text-gray-500 text-sm mt-1">{articles.length} total articles</p>
        </div>
        <Link href="/admin/articles/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white text-sm sw-btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Article
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Author</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 max-w-xs truncate">{article.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">/learn/{article.slug}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                      background: article.category === "LESSON" ? "var(--color-teal-tint)" : "var(--color-paper-dim)",
                      color: article.category === "LESSON" ? "var(--color-teal-deep)" : "var(--color-ink-soft)",
                    }}>
                      {article.category === "LESSON" ? `Lesson ${article.lessonNumber}` : article.category}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-gray-600">
                      {article.author ? `${article.author.firstName} ${article.author.lastName}` : article.authorName}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                      background: article.isPublished ? "var(--color-teal-tint)" : "var(--color-warning-tint)",
                      color: article.isPublished ? "var(--color-teal-deep)" : "var(--color-warning)",
                    }}>
                      {article.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-gray-500">{formatDate(article.createdAt)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/articles/${article.id}`}
                        className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
                        Edit
                      </Link>
                      <AdminArticleActions articleId={article.id} isPublished={article.isPublished} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {articles.length === 0 && (
            <div className="py-16 text-center text-gray-400 text-sm">No articles yet. Create one above.</div>
          )}
        </div>
      </div>
    </div>
  );
}
