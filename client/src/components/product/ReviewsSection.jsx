import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Star, ThumbsUp, Trash2, Check, AlertCircle } from "lucide-react";
import { reviewsAPI } from "@/store/api/reviewsApi";
import { useAuth }    from "@/hooks/useAuth";
import Loader         from "@/components/common/Loader";
import Pagination     from "@/components/common/Pagination";
import toast          from "react-hot-toast";

const StarRating = ({ value, onChange, size = 24 }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange && onChange(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            size={size}
            className={
              star <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            }
          />
        </button>
      ))}
    </div>
  );
};

const ReviewForm = ({ productId, onSuccess }) => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ rating: 0, title: "", body: "" });
  const [errors, setErrors] = useState({});

  const { mutate: submitReview, isLoading } = useMutation({
    mutationFn: (data) => reviewsAPI.create(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["reviews", productId]);
      queryClient.invalidateQueries(["product", productId]);
      queryClient.invalidateQueries(["can-review", productId]);
      toast.success("Review submitted successfully");
      setForm({ rating: 0, title: "", body: "" });
      onSuccess?.();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to submit review");
    },
  });

  const validate = () => {
    const e = {};
    if (!form.rating)        e.rating = "Please select a rating";
    if (!form.title.trim())  e.title  = "Title is required";
    if (!form.body.trim())   e.body   = "Review is required";
    else if (form.body.trim().length < 20) e.body = "Review must be at least 20 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    submitReview(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
      <h3 className="font-semibold text-gray-900">Write a review</h3>

      {/* Star rating */}
      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-2">
          Your rating <span className="text-red-400">*</span>
        </label>
        <StarRating
          value={form.rating}
          onChange={(val) => {
            setForm((p) => ({ ...p, rating: val }));
            if (errors.rating) setErrors((p) => ({ ...p, rating: "" }));
          }}
          size={28}
        />
        {errors.rating && (
          <p className="text-xs text-red-500 mt-1">{errors.rating}</p>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1.5">
          Review title <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          placeholder="Summarize your experience"
          value={form.title}
          onChange={(e) => {
            setForm((p) => ({ ...p, title: e.target.value }));
            if (errors.title) setErrors((p) => ({ ...p, title: "" }));
          }}
          className={`input-field ${errors.title ? "border-red-400" : ""}`}
          maxLength={100}
        />
        {errors.title && (
          <p className="text-xs text-red-500 mt-1">{errors.title}</p>
        )}
      </div>

      {/* Body */}
      <div>
        <label className="text-xs font-semibold text-gray-600 block mb-1.5">
          Your review <span className="text-red-400">*</span>
        </label>
        <textarea
          placeholder="Share your experience with this product in detail..."
          value={form.body}
          onChange={(e) => {
            setForm((p) => ({ ...p, body: e.target.value }));
            if (errors.body) setErrors((p) => ({ ...p, body: "" }));
          }}
          rows={4}
          className={`input-field resize-none ${errors.body ? "border-red-400" : ""}`}
          maxLength={1000}
        />
        <div className="flex items-center justify-between mt-1">
          {errors.body ? (
            <p className="text-xs text-red-500">{errors.body}</p>
          ) : (
            <span />
          )}
          <p className="text-xs text-gray-400 ml-auto">
            {form.body.length}/1000
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Check size={15} />
            Submit review
          </>
        )}
      </button>
    </form>
  );
};

const ReviewCard = ({ review, currentUserId, productId }) => {
  const queryClient = useQueryClient();
  const [helpful,  setHelpful]  = useState(review.helpful || 0);
  const [voted,    setVoted]    = useState(false);

  const handleHelpful = async () => {
    try {
      const { data } = await reviewsAPI.markHelpful(review._id);
      setHelpful(data.helpful);
      setVoted(data.voted);
      queryClient.invalidateQueries(["reviews", productId]);
    } catch {
      toast.error("Failed to mark as helpful");
    }
  };

  const handleDelete = async () => {
    try {
      await reviewsAPI.delete(review._id);
      queryClient.invalidateQueries(["reviews", productId]);
      queryClient.invalidateQueries(["product", productId]);
      toast.success("Review deleted");
    } catch {
      toast.error("Failed to delete review");
    }
  };

  const isOwner = currentUserId === review.user?._id;

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700 shrink-0">
            {review.user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900">
                {review.user?.name || "Anonymous"}
              </p>
              {review.isVerified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  <Check size={9} />
                  Verified purchase
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {new Date(review.createdAt).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarRating value={review.rating} size={13} />
          {isOwner && (
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors ml-1"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      <h4 className="text-sm font-semibold text-gray-900 mb-1.5">
        {review.title}
      </h4>
      <p className="text-sm text-gray-600 leading-relaxed mb-3">
        {review.body}
      </p>

      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={handleHelpful}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            voted
              ? "text-primary-600 font-medium"
              : "text-gray-400 hover:text-primary-600"
          }`}
        >
          <ThumbsUp size={12} className={voted ? "fill-primary-600" : ""} />
          Helpful ({helpful})
        </button>
      </div>
    </div>
  );
};

const ReviewsSection = ({ productId, productRating, reviewCount }) => {
  const { user, isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["reviews", productId, page],
    queryFn:  () => reviewsAPI.getByProduct(productId, { page, limit: 5 }).then((r) => r.data),
  });

  const { data: canReviewData } = useQuery({
    queryKey: ["can-review", productId],
    queryFn:  () => reviewsAPI.canReview(productId).then((r) => r.data),
    enabled:  isAuthenticated,
  });

  const reviews    = reviewsData?.reviews    || [];
  const total      = reviewsData?.total      || 0;
  const totalPages = reviewsData?.totalPages || 1;
  const ratingDist = reviewsData?.ratingDist || [];
  const canReview  = canReviewData?.canReview;
  const alreadyReviewed = canReviewData?.alreadyReviewed;
  const hasPurchased    = canReviewData?.hasPurchased;

  const maxDist = Math.max(...ratingDist.map((d) => d.count), 1);

  return (
    <div className="mb-12">
      <div className="grid lg:grid-cols-3 gap-8">

        {/* Rating summary */}
        <div className="card p-6">
          <div className="text-center mb-5">
            <div className="text-5xl font-bold text-gray-900 mb-1">
              {(productRating || 0).toFixed(1)}
            </div>
            <StarRating value={Math.round(productRating || 0)} size={18} />
            <p className="text-sm text-gray-400 mt-2">
              {(reviewCount || 0).toLocaleString()} reviews
            </p>
          </div>

          {/* Rating distribution */}
          <div className="space-y-2">
            {ratingDist.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-4 text-right shrink-0">
                  {star}
                </span>
                <Star size={11} className="fill-amber-400 text-amber-400 shrink-0" />
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${(count / maxDist) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-6 shrink-0">{count}</span>
              </div>
            ))}
          </div>

          {/* Write review CTA */}
          <div className="mt-5 pt-5 border-t border-gray-100">
            {!isAuthenticated ? (
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">
                  Sign in to write a review
                </p>
                <a href="/login" className="btn-outline text-xs w-full block text-center">
                  Sign in
                </a>
              </div>
            ) : alreadyReviewed ? (
              <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 border border-green-100 px-3 py-2 rounded-lg">
                <Check size={13} />
                You have reviewed this product
              </div>
            ) : !hasPurchased ? (
              <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg">
                <AlertCircle size={13} className="shrink-0 mt-0.5 text-gray-400" />
                Purchase and receive this product to write a review
              </div>
            ) : canReview ? (
              <button
                onClick={() => setShowForm((p) => !p)}
                className="btn-primary w-full text-sm flex items-center justify-center gap-2"
              >
                <Star size={14} />
                {showForm ? "Cancel" : "Write a review"}
              </button>
            ) : null}
          </div>
        </div>

        {/* Reviews list */}
        <div className="lg:col-span-2 space-y-4">
          {/* Review form */}
          {showForm && canReview && (
            <ReviewForm
              productId={productId}
              onSuccess={() => setShowForm(false)}
            />
          )}

          {isLoading ? (
            <Loader text="Loading reviews..." />
          ) : reviews.length === 0 ? (
            <div className="card py-12 text-center">
              <Star size={36} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 font-medium text-sm">
                No reviews yet
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Be the first to review this product
              </p>
            </div>
          ) : (
            <>
              {reviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  currentUserId={user?._id}
                  productId={productId}
                />
              ))}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewsSection;