import { useEffect, useMemo, useRef, useState } from 'react';
import BookCard from './components/BookCard.jsx';
import Icon from './components/Icon.jsx';
import Toast from './components/Toast.jsx';
import { useDebouncedValue } from './hooks/useDebouncedValue.js';
import { addWishlist, getWishlist, removeWishlist, searchBooks } from './services/api.js';

const suggestions = ['The creative act', 'The art of noticing', 'Tomorrow, and tomorrow, and tomorrow'];

export default function App() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [activeTab, setActiveTab] = useState('discover');
  const [loading, setLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [error, setError] = useState('');
  const [pending, setPending] = useState({});
  const [toast, setToast] = useState(null);
  const [retry, setRetry] = useState(0);
  const debouncedQuery = useDebouncedValue(query.trim(), 400);
  const requestId = useRef(0);
  const savedIds = useMemo(() => new Set(wishlist.map((book) => book.googleBookId)), [wishlist]);

  useEffect(() => {
    let mounted = true;
    getWishlist().then(({ items }) => { if (mounted) setWishlist(items); })
      .catch((loadError) => { if (mounted) setToast({ type: 'error', message: loadError.message }); })
      .finally(() => { if (mounted) setWishlistLoading(false); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const id = ++requestId.current;
    if (!debouncedQuery) { setBooks([]); setError(''); setLoading(false); return undefined; }
    const controller = new AbortController();
    setLoading(true);
    setError('');
    searchBooks(debouncedQuery, controller.signal)
      .then(({ items }) => { if (requestId.current === id) setBooks(items); })
      .catch((searchError) => { if (searchError.name !== 'AbortError' && requestId.current === id) setError(searchError.message); })
      .finally(() => { if (requestId.current === id) setLoading(false); });
    return () => controller.abort();
  }, [debouncedQuery, retry]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function toggleWishlist(book) {
    setPending((state) => ({ ...state, [book.googleBookId]: true }));
    try {
      if (savedIds.has(book.googleBookId)) {
        await removeWishlist(book.googleBookId);
        setWishlist((items) => items.filter((item) => item.googleBookId !== book.googleBookId));
        setToast({ type: 'success', message: 'Removed from your reading list.' });
      } else {
        const { item } = await addWishlist(book);
        setWishlist((items) => items.some((saved) => saved.googleBookId === item.googleBookId) ? items : [item, ...items]);
        setToast({ type: 'success', message: 'Saved to your reading list.' });
      }
    } catch (actionError) { setToast({ type: 'error', message: actionError.message }); }
    finally { setPending((state) => ({ ...state, [book.googleBookId]: false })); }
  }

  const visibleBooks = activeTab === 'wishlist' ? wishlist : books;
  const hasSearched = Boolean(debouncedQuery);

  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="#top" aria-label="Bookhaven home"><span className="brand-mark"><Icon name="book" size={21} /></span><span>bookhaven<span className="brand-period">.</span></span></a>
      <nav className="main-nav" aria-label="Main navigation">
        <button className={activeTab === 'discover' ? 'nav-link active' : 'nav-link'} onClick={() => setActiveTab('discover')}>Discover</button>
        <button className={activeTab === 'wishlist' ? 'nav-link active' : 'nav-link'} onClick={() => setActiveTab('wishlist')}>My reading list <span className="nav-count">{wishlist.length}</span></button>
      </nav>
      <div className="header-note"><span className="online-dot" /> YOUR NEXT CHAPTER STARTS HERE</div>
    </header>

    <main id="top">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><Icon name="spark" size={15} /> A LITTLE SPACE FOR BIG IDEAS</span>
          <h1>Find the book<br />that <em>finds you.</em></h1>
          <p>Somewhere between the pages, there’s a new favorite waiting. Let’s find it together.</p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
          <div className="art-sun" /><div className="art-book book-back"><span /><span /><span /></div>
          <div className="art-book book-front"><span /><span /><span /><i>the<br />quiet<br />pages</i></div>
          <span className="art-star star-a">✳</span><span className="art-star star-b">✦</span><span className="art-leaf">〰</span>
        </div>
        <span className="hero-index">01 <span /> FIND YOUR NEXT READ</span>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div><span className="eyebrow muted-eyebrow">A WORLD OF STORIES, ONE SEARCH AWAY</span><h2>{activeTab === 'wishlist' ? 'Your reading list' : 'What are we reading?'}</h2></div>
          {activeTab === 'discover' && hasSearched && !loading && !error && books.length > 0 && <span className="result-count">{books.length} BOOKS FOUND</span>}
        </div>

        {activeTab === 'discover' ? <>
          <form className="search-form" onSubmit={(event) => event.preventDefault()} role="search">
            <Icon name="search" size={21} className="search-icon" />
            <label className="sr-only" htmlFor="book-search">Search books or authors</label>
            <input id="book-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try a title, an author, a feeling..." maxLength={120} autoComplete="off" />
            {query && <button type="button" className="clear-search" onClick={() => setQuery('')} aria-label="Clear search"><Icon name="close" size={18} /></button>}
            <span className="search-shortcut">↵</span>
          </form>
          {!query && <div className="suggestions"><span>IN THE MOOD FOR</span>{suggestions.map((item) => <button key={item} onClick={() => setQuery(item)}>{item}<Icon name="arrow" size={13} /></button>)}</div>}
        </> : <p className="list-intro">A thoughtful little collection, just for you.</p>}

        <div className="results-toolbar"><span>{activeTab === 'wishlist' ? 'YOUR COLLECTION' : hasSearched ? `RESULTS FOR “${debouncedQuery}”` : 'A FEW BOOKS TO GET YOU STARTED'}</span><span className="toolbar-line" /></div>
        {error && activeTab === 'discover' ? <div className="state-panel error-panel"><span className="state-symbol">!</span><h3>We hit a little snag</h3><p>{error}</p><button onClick={() => setRetry((value) => value + 1)}>Try your search again <Icon name="arrow" size={15} /></button></div>
          : loading && activeTab === 'discover' ? <div className="book-grid" aria-label="Searching books">{Array.from({ length: 6 }, (_, index) => <div className="skeleton-card" key={index}><div className="skeleton-cover" /><div className="skeleton-line" /><div className="skeleton-line short" /></div>)}</div>
          : activeTab === 'wishlist' && wishlistLoading ? <div className="state-panel"><span className="state-symbol">···</span><h3>Gathering your books</h3><p>Your reading list will be right here in a moment.</p></div>
          : visibleBooks.length ? <div className="book-grid">{visibleBooks.map((book) => <BookCard key={book.googleBookId} book={book} saved={savedIds.has(book.googleBookId)} busy={Boolean(pending[book.googleBookId])} onToggle={() => toggleWishlist(book)} />)}</div>
          : <div className="state-panel empty-panel"><span className="state-symbol"><Icon name={activeTab === 'wishlist' ? 'heart' : 'book'} size={25} /></span>
            <h3>{activeTab === 'wishlist' ? 'Your story starts here' : hasSearched ? 'No books found this time' : 'A good book changes everything'}</h3>
            <p>{activeTab === 'wishlist' ? 'Save the books you love and they’ll be waiting for you here.' : hasSearched ? 'Try another title, author, or a simpler keyword.' : 'Search for a title, author, or topic you can’t stop thinking about.'}</p>
            {activeTab === 'wishlist' && <button className="text-action" onClick={() => setActiveTab('discover')}>Discover a book <Icon name="arrow" size={15} /></button>}
          </div>}
      </section>

      <section className="quote-band"><span className="quote-mark">“</span><p>Reading gives us someplace to go<br />when we have to stay where we are.</p><span className="quote-credit">— MASON COOLEY</span><span className="quote-bookmark"><Icon name="bookmark" size={26} /></span></section>
    </main>

    <footer><a className="brand footer-brand" href="#top"><span className="brand-mark"><Icon name="book" size={18} /></span><span>bookhaven<span className="brand-period">.</span></span></a><span>MADE FOR THE LOVE OF A GOOD STORY</span><span>BOOKS OPEN WORLDS <span className="footer-star">✳</span></span></footer>
    <Toast toast={toast} onClose={() => setToast(null)} />
  </div>;
}
