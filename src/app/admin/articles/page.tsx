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
      <div className="admin-header-row">
        <div>
          <h1 className="admin-page-title">Articles &amp; Lessons</h1>
          <p className="admin-page-sub">{articles.length} total articles</p>
        </div>
        <Link href="/admin/articles/new" className="btn btn-primary btn-sm">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Article
        </Link>
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead className="admin-table-head">
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Author</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => (
              <tr key={article.id} className="admin-table-row">
                <td>
                  <p className="admin-user-name truncate">{article.title}</p>
                  <p className="admin-user-email">/learn/{article.slug}</p>
                </td>
                <td>
                  <span className={`badge ${article.category === "LESSON" ? "badge-teal" : "badge-slate"}`}>
                    {article.category === "LESSON" ? `Lesson ${article.lessonNumber}` : article.category}
                  </span>
                </td>
                <td className="admin-user-email">
                  {article.author ? `${article.author.firstName} ${article.author.lastName}` : article.authorName}
                </td>
                <td>
                  <span className={`badge ${article.isPublished ? "badge-teal" : "badge-warning"}`}>
                    {article.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="admin-user-email">{formatDate(article.createdAt)}</td>
                <td>
                  <div className="admin-action-row">
                    <Link href={`/admin/articles/${article.id}`} className="admin-btn admin-btn-slate">
                      Edit
                    </Link>
                    <AdminArticleActions articleId={article.id} isPublished={article.isPublished} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {articles.length === 0 && <div className="admin-empty">No articles yet. Create one above.</div>}
      </div>
    </div>
  );
}
