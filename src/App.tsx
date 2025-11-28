import { useState, useEffect, useRef } from "react";
import { Routes, Route, BrowserRouter as Router, useNavigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { ItemGrid } from "./components/ItemGrid";
import { ItemDetails } from "./components/ItemDetails";
import { BackToTopButton } from "./components/BackToTopButton";
import type { Movie } from "./types/Movie";
import { getRecentMovies } from "./services/api";
import "./App.css";
import { ActorDetails } from "./components/ActorDetails";

const MAX_PAGES = 10;
const MOVIES_PER_PAGE = 10;

const AppContent = () => {
  const [results, setResults] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [reload, setReload] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();


  // Infinite scroll: load more movies when loader is visible
  useEffect(() => {
    if (!hasMore) return;
    const observer = new window.IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 },
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore]);

  // Load movies when page changes
  useEffect(() => {
    const loadRecentMovies = async () => {
      if (!hasMore || loading) return;
      setLoading(true);
      try {
        const newMovies = await getRecentMovies(page);
        setResults((prev) => {
          // Avoid duplicates
          const ids = new Set(prev.map((m) => m.id));
          const filtered = newMovies.filter((m) => !ids.has(m.id));
          return [...prev, ...filtered];
        });
        if (newMovies.length < MOVIES_PER_PAGE || page >= MAX_PAGES) {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error loading recent movies:", error);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };
    loadRecentMovies();
    // eslint-disable-next-line
  }, [page, reload]);

  // Reset results and reload first page
  const resetResults = (): void => {
    const searchInput = document.getElementById(
      "search-input",
    ) as HTMLInputElement;
    searchInput.value = "";

    setResults([]);
    setPage(1);
    setHasMore(true);
    setReload((prev) => !prev);
  };

  // Handle search results
  const handleSearchResults = (results: Movie[]): void => {
    setResults(results);
    setHasMore(false);
    navigate("/");
  };

  return (
    <div className="App">
      <header className="App-header">
        <Navbar onSearchResults={handleSearchResults} onReset={resetResults} />
      </header>
      <main className="App-main">
        <Routes>
          <Route
            path="/"
            element={
              <>
                {results.length > 0 && <ItemGrid items={results} />}
                {hasMore && (
                  <div
                    ref={loaderRef}
                    style={{ textAlign: "center", margin: "2rem" }}
                  >
                    {loading ? (
                      <span  style={{color: "#888"}}>Loading more movies...</span>
                    ) : (
                      <span style={{color: "#888"}}>Slide to load more.</span>
                    )}
                  </div>
                )}
              </>
            }
          />
          <Route path="/movie/:id" element={<ItemDetails />} /> {/* Movie details route */}
          <Route path="/actor/:id" element={<ActorDetails />} /> {/* Actor details route */}
        </Routes>
      </main>
    </div>
  );
};



function App() {
  return (
    <Router>
      <AppContent />
      <BackToTopButton />
    </Router>
  );
}

export default App
