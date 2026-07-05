"use client";
// src/components/admin/ArticleEditor.tsx
// Full CMS editor using Quill 2.0 rich text editor
// Supports text formatting, code blocks, images, file uploads
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Author { id: string; firstName: string | null; lastName: string | null; email: string; }

interface ArticleData {
  id?: string;
  slug?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  lessonNumber?: number | null;
  readingTime?: number | null;
  isPublished?: boolean;
  authorId?: string | null;
  authorName?: string;
  tags?: string[];
  coverImage?: string | null;
}

interface Props {
  article: ArticleData | null;
  authors: Author[];
  currentUserId: string;
}

export default function ArticleEditor({ article, authors, currentUserId }: Props) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);

  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [category, setCategory] = useState(article?.category ?? "LESSON");
  const [lessonNumber, setLessonNumber] = useState(article?.lessonNumber?.toString() ?? "");
  const [readingTime, setReadingTime] = useState(article?.readingTime?.toString() ?? "");
  const [isPublished, setIsPublished] = useState(article?.isPublished ?? false);
  const [authorId, setAuthorId] = useState(article?.authorId ?? currentUserId);
  const [authorName, setAuthorName] = useState(article?.authorName ?? "Stockwise Team");
  const [tags, setTags] = useState(article?.tags?.join(", ") ?? "");
  const [coverImage, setCoverImage] = useState(article?.coverImage ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", ok: true });
  const [uploadingCover, setUploadingCover] = useState(false);

  // Auto-generate slug from title
  function generateSlug(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  useEffect(() => {
    if (!article?.slug) {
      setSlug(generateSlug(title));
    }
  }, [title]);

  // Initialize Quill 2.0
  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

    // Dynamically load Quill to avoid SSR issues
    import("quill").then(({ default: Quill }) => {
      if (!editorRef.current) return;

      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "Write your article content here...",
        modules: {
          toolbar: [
            [{ header: [2, 3, false] }],
            ["bold", "italic", "underline"],
            ["blockquote", "code-block"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link"],
            ["clean"],
          ],
        },
      });

      // Set initial content
      if (article?.content) {
        quillRef.current.root.innerHTML = article.content;
      }
    });

    return () => {
      quillRef.current = null;
    };
  }, []);

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "cover");

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) setCoverImage(data.url);
      else setMessage({ text: data.error || "Upload failed", ok: false });
    } catch { setMessage({ text: "Upload failed. Check your connection.", ok: false }); }
    setUploadingCover(false);
  }

  async function handleSave(publish?: boolean) {
    setSaving(true);
    setMessage({ text: "", ok: true });

    const content = quillRef.current?.root.innerHTML ?? article?.content ?? "";

    const payload = {
      title, slug, excerpt, content, category,
      lessonNumber: lessonNumber ? parseInt(lessonNumber) : null,
      readingTime: readingTime ? parseInt(readingTime) : null,
      isPublished: publish !== undefined ? publish : isPublished,
      authorId, authorName,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      coverImage: coverImage || null,
    };

    try {
      const isNew = !article?.id;
      const res = await fetch(`/api/admin/articles${isNew ? "" : `/${article!.id}`}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setMessage({ text: data.error || "Save failed", ok: false }); setSaving(false); return; }

      setMessage({ text: publish ? "Published!" : "Saved as draft", ok: true });
      if (publish !== undefined) setIsPublished(publish);
      if (isNew && data.id) {
        router.push(`/admin/articles/${data.id}`);
      }
      router.refresh();
    } catch { setMessage({ text: "Network error. Please try again.", ok: false }); }
    setSaving(false);
  }

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2";

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-6">
      {/* Main editor */}
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Article title" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug (URL)</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">/learn/</span>
                <input value={slug} onChange={(e) => setSlug(generateSlug(e.target.value))}
                  className={`${inputClass} flex-1`} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Excerpt</label>
              <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
                rows={2} placeholder="Short summary shown in listings..."
                className={`${inputClass} resize-none`} />
            </div>
          </div>
        </div>

        {/* Quill Editor */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-700">Content</p>
          </div>
          {/* Quill toolbar and editor mount here */}
          <div ref={editorRef} style={{ minHeight: "400px" }} />
        </div>
      </div>

      {/* Sidebar settings */}
      <div className="space-y-4">
        {/* Publish controls */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Publish</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                background: isPublished ? "var(--color-teal-tint)" : "var(--color-warning-tint)",
                color: isPublished ? "var(--color-teal-deep)" : "var(--color-warning)",
              }}>
                {isPublished ? "Published" : "Draft"}
              </span>
            </div>
            {message.text && (
              <p className={`text-xs ${message.ok ? "text-green-600" : "text-red-600"}`}>{message.text}</p>
            )}
            <button onClick={() => handleSave(false)} disabled={saving}
              className="w-full py-2.5 rounded-xl text-sm font-semibold border-2 border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-60">
              Save Draft
            </button>
            <button onClick={() => handleSave(!isPublished)} disabled={saving}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 sw-btn-primary">
              {saving ? "Saving..." : isPublished ? "Unpublish" : "Publish"}
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Metadata</h3>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className={inputClass}>
              <option value="LESSON">Lesson</option>
              <option value="GUIDE">Guide</option>
              <option value="NEWS">News</option>
              <option value="FAQ">FAQ</option>
            </select>
          </div>

          {category === "LESSON" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Lesson Number</label>
              <input type="number" min="1" max="10" value={lessonNumber}
                onChange={(e) => setLessonNumber(e.target.value)}
                className={inputClass} placeholder="1-10" />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Reading Time (minutes)</label>
            <input type="number" min="1" value={readingTime}
              onChange={(e) => setReadingTime(e.target.value)}
              className={inputClass} placeholder="5" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Author</label>
            <select value={authorId} onChange={(e) => setAuthorId(e.target.value)}
              className={inputClass}>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.firstName ? `${a.firstName} ${a.lastName}` : a.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Tags (comma separated)</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)}
              className={inputClass} placeholder="beginner, investing, NGX" />
          </div>
        </div>

        {/* Cover image */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Cover Image</h3>
          {coverImage && (
            <img src={coverImage} alt="Cover" className="w-full h-32 object-cover rounded-xl mb-3" />
          )}
          <label className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-500 cursor-pointer hover:border-[color:var(--color-teal)] hover:text-[color:var(--color-teal)] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {uploadingCover ? "Uploading..." : "Upload Cover Image"}
            <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
          </label>
          {coverImage && (
            <button onClick={() => setCoverImage("")}
              className="mt-2 text-xs text-red-500 hover:text-red-700 w-full text-center">
              Remove image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
