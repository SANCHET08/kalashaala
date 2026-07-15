import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";

const RATING_STORAGE_KEY = "kalaShaalaRatings";
const RATING_VALUES = [1, 2, 3, 4, 5];

function getStoredRatings() {
  try {
    return JSON.parse(localStorage.getItem(RATING_STORAGE_KEY) || "{}");
  } catch (err) {
    console.error("Unable to read saved ratings:", err);
    localStorage.removeItem(RATING_STORAGE_KEY);
    return {};
  }
}

function getBaseReviewCount(itemId) {
  const total = String(itemId)
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return 18 + (total % 37);
}

export default function RatingSystem({ itemId, initialRating, label }) {
  const [savedRating, setSavedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  useEffect(() => {
    const savedRatings = getStoredRatings();
    setSavedRating(Number(savedRatings[itemId]) || 0);
  }, [itemId]);

  const baseReviewCount = useMemo(() => getBaseReviewCount(itemId), [itemId]);
  const averageRating = useMemo(() => {
    if (!savedRating) return initialRating;

    return (
      (initialRating * baseReviewCount + savedRating) /
      (baseReviewCount + 1)
    );
  }, [baseReviewCount, initialRating, savedRating]);
  const reviewCount = baseReviewCount + (savedRating ? 1 : 0);
  const previewRating = hoveredRating || savedRating;

  const handleRating = (rating) => {
    const savedRatings = getStoredRatings();
    const nextRatings = {
      ...savedRatings,
      [itemId]: rating,
    };

    localStorage.setItem(RATING_STORAGE_KEY, JSON.stringify(nextRatings));
    setSavedRating(rating);
  };

  return (
    <div className="rating-system">
      <div
        className="rating-system__summary"
        aria-label={`${label} average rating ${averageRating.toFixed(1)} out of 5 from ${reviewCount} reviews`}
      >
        <span className="rating-system__display-stars" aria-hidden="true">
          {RATING_VALUES.map((rating) => (
            <Star
              key={rating}
              size={16}
              className={rating <= Math.round(averageRating) ? "is-filled" : ""}
            />
          ))}
        </span>
        <span className="rating-system__score">{averageRating.toFixed(1)}</span>
        <span className="rating-system__count">({reviewCount} reviews)</span>
      </div>

      <div className="rating-system__rate-row">
        <span>Your rating</span>
        <div
          className="rating-system__buttons"
          role="radiogroup"
          aria-label={`Rate ${label}`}
          onMouseLeave={() => setHoveredRating(0)}
        >
          {RATING_VALUES.map((rating) => {
            const isActive = rating <= previewRating;

            return (
              <button
                key={rating}
                type="button"
                className={isActive ? "is-active" : ""}
                role="radio"
                aria-checked={savedRating === rating}
                aria-label={`${rating} star${rating > 1 ? "s" : ""}`}
                title={`${rating} star${rating > 1 ? "s" : ""}`}
                onClick={() => handleRating(rating)}
                onFocus={() => setHoveredRating(rating)}
                onMouseEnter={() => setHoveredRating(rating)}
              >
                <Star size={18} />
              </button>
            );
          })}
        </div>
      </div>

      {savedRating > 0 && (
        <div className="rating-system__saved">
          Thanks, you rated this {savedRating} out of 5.
        </div>
      )}
    </div>
  );
}
