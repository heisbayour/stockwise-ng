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

function Stars({ rating }: { rating: number }) {
  return (
    <div className="review-stars">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="14" height="14" className={i < Math.round(rating) ? "review-star-filled" : "review-star-empty"} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.176 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ))}
    </div>
  );
}

export default function BrokerReviewSection({ brokerId, reviews, isLoggedIn }: Props) {
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
    <section className="reviews-section broker-section">
      <div className="reviews-header">
        <h2 className="broker-section-title">
          Reviews {reviews.length > 0 && <span>({reviews.length})</span>}
        </h2>
        {isLoggedIn && !showForm && !submitted && (
          <button onClick={() => setShowForm(true)} className="btn btn-outline-teal btn-sm">
            Write a Review
          </button>
        )}
      </div>

      {!isLoggedIn && (
        <div className="review-login-prompt">
          <a href="/login" className="form-link">Sign in</a> to leave a review for this broker.
        </div>
      )}

      {submitted && (
        <div className="alert alert-success">
          <svg className="alert-icon" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          Review submitted! It will appear after approval.
        </div>
      )}

      {showForm && !submitted && (
        <form onSubmit={handleSubmit} className="review-form">
          <p className="form-label">Your Rating</p>
          <div className="review-form-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="review-star-btn">
                <svg width="28" height="28" className={(hoverRating || rating) >= star ? "review-star-filled" : "review-star-empty"} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.176 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
            ))}
          </div>
          <div className="form-group">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Review title (optional)" className="form-input" />
          </div>
          <div className="form-group">
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4}
              placeholder="Share your experience with this broker..." className="form-textarea" />
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="review-form-actions">
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">
              Cancel
            </button>
          </div>
        </form>
      )}

      {reviews.length === 0 ? (
        <div className="review-empty">
          <p>No reviews yet. Be the first to share your experience.</p>
        </div>
      ) : (
        <div>
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-meta">
                <div>
                  <p className="review-author">
                    {review.user.firstName} {review.user.lastName?.[0]}.
                    {review.isVerified && <span className="badge badge-teal review-verified-badge">Verified</span>}
                  </p>
                  <Stars rating={review.rating} />
                </div>
                <span className="review-date">{formatDate(review.createdAt)}</span>
              </div>
              {review.title && <p className="review-title">{review.title}</p>}
              {review.body && <p className="review-body">{review.body}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
