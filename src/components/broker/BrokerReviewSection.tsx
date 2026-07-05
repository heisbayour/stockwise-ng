"use client";
// src/components/broker/BrokerReviewSection.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/formatters";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  isVerified: boolean;
  createdAt: Date;
  user: { firstName: string | null; lastName: string | null };
}

interface Props {
  brokerId: string;
  reviews: Review[];
  isLoggedIn: boolean;
  avgRating: number;
}

function Stars({ rating, size = 4 }: { rating: number; size?: number }) {
  return (
    <div className="flex">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} className={`w-${size} h-${size}`} fill={i < Math.round(rating) ? "var(--color-warning)" : "var(--color-line)"} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.176 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ))}
    </div>
  );
}

export default function BrokerReviewSection({ brokerId, reviews, isLoggedIn, avgRating }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setError("Please select a star rating"); return; }
    setError(""); setSubmitting(true);
    try {
      const res = await fetch(`/api/brokers/${brokerId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, title, body }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to submit"); setSubmitting(false); return; }
      setSubmitted(true);
      router.refresh();
    } catch { setError("Network error."); setSubmitting(false); }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold sw-text-ink">
          Reviews {reviews.length > 0 && <span className="text-gray-400 font-normal text-base">({reviews.length})</span>}
        </h2>
        {isLoggedIn && !showForm && !submitted && (
          <button onClick={() => setShowForm(true)}
            className="text-sm font-semibold px-4 py-2 rounded-xl border-2 transition-colors border-[color:var(--color-teal)] sw-text-brand">
            Write a Review
          </button>
        )}
      </div>

      {/* Review form */}
      {!isLoggedIn && (
        <div className="p-4 rounded-xl mb-5 text-sm text-gray-600" style={{ background: "var(--color-paper-dim)", border: "1px solid #E5E7EB" }}>
          <a href="/login" className="font-semibold sw-text-brand">Sign in</a> to leave a review for this broker.
        </div>
      )}

      {submitted && (
        <div className="p-4 rounded-xl mb-5 text-sm flex items-center gap-2 sw-badge-teal">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          Review submitted! It will appear after approval.
        </div>
      )}

      {showForm && !submitted && (
        <form onSubmit={handleSubmit} className="p-5 rounded-2xl border border-gray-100 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Your Rating</p>
          <div className="flex gap-1 mb-4">
            {[1,2,3,4,5].map((star) => (
              <button key={star} type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110">
                <svg className="w-8 h-8" fill={(hoverRating || rating) >= star ? "var(--color-warning)" : "var(--color-line)"} viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.176 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            ))}
          </div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Review title (optional)"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm mb-3 focus:outline-none focus:ring-2" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4}
            placeholder="Share your experience with this broker..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm mb-3 focus:outline-none focus:ring-2 resize-none" />
          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={submitting}
              className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm disabled:opacity-60 sw-btn-primary">
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-xl font-semibold text-gray-600 text-sm border border-gray-200">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="py-10 text-center rounded-2xl bg-[color:var(--color-paper)]">
          <p className="text-gray-500 text-sm">No reviews yet. Be the first to share your experience.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div key={review.id} className="p-5 rounded-2xl border border-gray-100">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {review.user.firstName} {review.user.lastName?.[0]}.
                    {review.isVerified && (
                      <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-medium sw-badge-teal">Verified</span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Stars rating={review.rating} size={3} />
                    <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                  </div>
                </div>
              </div>
              {review.title && <p className="font-medium text-sm text-gray-900 mb-1">{review.title}</p>}
              {review.body && <p className="text-sm text-gray-600 leading-relaxed">{review.body}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
