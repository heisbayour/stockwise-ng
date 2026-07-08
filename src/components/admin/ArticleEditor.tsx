"use client";
// src/components/admin/ArticleEditor.tsx
// Full CMS editor using Quill 2.0 rich text editor
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

  function generateSlug(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  useEffect(() => {
    if (!article?.slug) {
      setSlug(generateSlug(title));
    }
  }, [title]);

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return;

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

  return (
    <div className="editor-layout">
      <div className="editor-main">
        <div className="editor-card">
          <div className="editor-field">
            <label className="form-label">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title" className="form-input" />
          </div>
          <div className="editor-field">
            <label className="form-label">Slug (URL)</label>
            <div className="editor-slug-row">
              <span className="editor-slug-prefix">/learn/</span>
              <input value={slug} onChange={(e) => setSlug(generateSlug(e.target.value))} className="form-input" />
            </div>
          </div>
          <div className="editor-field">
            <label className="form-label">Excerpt</label>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)}
              rows={2} placeholder="Short summary shown in listings..." className="form-textarea" />
          </div>
        </div>

        <div className="editor-quill-wrap">
          <div className="editor-quill-header">Content</div>
          <div ref={editorRef} className="editor-quill-mount" />
        </div>
      </div>

      <div className="editor-sidebar">
        <div className="editor-card">
          <h3 className="editor-card-title">Publish</h3>
          <div className="editor-status-badge">
            <span className="form-label">Status</span>
            <span className={`badge ${isPublished ? "badge-teal" : "badge-warning"}`}>
              {isPublished ? "Published" : "Draft"}
            </span>
          </div>
          {message.text && (
            <p className={message.ok ? "editor-msg-ok" : "editor-msg-err"}>{message.text}</p>
          )}
          <div className="editor-actions">
            <button onClick={() => handleSave(false)} disabled={saving} className="btn btn-outline btn-full">
              Save Draft
            </button>
            <button onClick={() => handleSave(!isPublished)} disabled={saving} className="btn btn-primary btn-full">
              {saving ? "Saving..." : isPublished ? "Unpublish" : "Publish"}
            </button>
          </div>
        </div>

        <div className="editor-card">
          <h3 className="editor-card-title">Metadata</h3>

          <div className="editor-field">
            <label className="form-label">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-select">
              <option value="LESSON">Lesson</option>
              <option value="GUIDE">Guide</option>
              <option value="NEWS">News</option>
              <option value="FAQ">FAQ</option>
            </select>
          </div>

          {category === "LESSON" && (
            <div className="editor-field">
              <label className="form-label">Lesson Number</label>
              <input type="number" min="1" max="10" value={lessonNumber}
                onChange={(e) => setLessonNumber(e.target.value)} className="form-input" placeholder="1-10" />
            </div>
          )}

          <div className="editor-field">
            <label className="form-label">Reading Time (minutes)</label>
            <input type="number" min="1" value={readingTime}
              onChange={(e) => setReadingTime(e.target.value)} className="form-input" placeholder="5" />
          </div>

          <div className="editor-field">
            <label className="form-label">Author</label>
            <select value={authorId} onChange={(e) => setAuthorId(e.target.value)} className="form-select">
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.firstName ? `${a.firstName} ${a.lastName}` : a.email}
                </option>
              ))}
            </select>
          </div>

          <div className="editor-field">
            <label className="form-label">Tags (comma separated)</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} className="form-input" placeholder="beginner, investing, NGX" />
          </div>
        </div>

        <div className="editor-card">
          <h3 className="editor-card-title">Cover Image</h3>
          {coverImage && <img src={coverImage} alt="Cover" className="editor-cover-preview" />}
          <label className="editor-upload-label">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {uploadingCover ? "Uploading..." : "Upload Cover Image"}
            <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
          </label>
          {coverImage && (
            <button onClick={() => setCoverImage("")} className="editor-remove-cover">
              Remove image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
