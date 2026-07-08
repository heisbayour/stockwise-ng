// src/app/admin/articles/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import ArticleEditor from "@/components/admin/ArticleEditor";

interface Props { params: Promise<{ id: string }> }

export default async function ArticleEditorPage({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  // "new" is a special ID for creating a new article
  const isNew = id === "new";

  const article = isNew ? null : await prisma.article.findUnique({ where: { id } });
  if (!isNew && !article) notFound();

  const authors = await prisma.user.findMany({
    where: { role: { in: ["AUTHOR", "ADMIN", "SUPERUSER"] } },
    select: { id: true, firstName: true, lastName: true, email: true },
    orderBy: { firstName: "asc" },
  });

  return (
    <div>
      <h1 className="admin-page-title">
        {isNew ? "New Article" : `Edit: ${article?.title}`}
      </h1>
      <ArticleEditor article={article} authors={authors} currentUserId={session!.user.id} />
    </div>
  );
}
