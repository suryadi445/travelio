import Icon from './Icon.jsx';
import StarRating from './StarRating.jsx';

function Cover({ book }) {
  return book.thumbnail ? <img className="book-cover" src={book.thumbnail} alt={`Cover of ${book.title}`} loading="lazy" onError={(event) => { event.currentTarget.hidden = true; event.currentTarget.nextElementSibling.hidden = false; }} /> : null;
}

export default function BookCard({ book, saved, busy, onToggle }) {
  return <article className="book-card">
    <div className="cover-wrap">
      <Cover book={book} />
      <div className="cover-placeholder" hidden={Boolean(book.thumbnail)}><Icon name="book" size={34} /><span>Cover unavailable</span></div>
      <span className="cover-shine" />
    </div>
    <div className="book-info">
      <div className="book-meta"><span>BOOK</span><span className="meta-dot" /> <span>{book.authors?.length ? 'FEATURED READ' : 'DISCOVERY'}</span></div>
      <h3 title={book.title}>{book.title}</h3>
      <p className="book-author">{book.authors?.length ? book.authors.join(', ') : 'Unknown Author'}</p>
      <div className="card-bottom">
        <StarRating rating={book.rating} />
        <button className={`save-button ${saved ? 'is-saved' : ''}`} type="button" onClick={onToggle} disabled={busy} aria-label={saved ? `Remove ${book.title} from wishlist` : `Add ${book.title} to wishlist`} title={saved ? 'Remove from wishlist' : 'Add to wishlist'}>
          {busy ? <span className="button-spinner" /> : <Icon name={saved ? 'heart' : 'bookmark'} size={18} />}
        </button>
      </div>
    </div>
  </article>;
}
