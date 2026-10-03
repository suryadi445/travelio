export default function StarRating({ rating }) {
  if (rating == null) return <span className="no-rating">No rating</span>;
  const rounded = Math.round(rating * 2) / 2;
  return <span className="rating" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
    <span className="stars" aria-hidden="true">{[1, 2, 3, 4, 5].map((star) => <span key={star} className={rounded >= star ? 'star-full' : rounded >= star - 0.5 ? 'star-half' : ''}>★</span>)}</span>
    <span className="rating-number">{rating.toFixed(1)}</span>
  </span>;
}
