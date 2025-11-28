import { useState, useEffect, useRef } from "react";
import { searchMovies } from "../../services/api";
import type { Movie } from "../../types/Movie";
import "./search-bar.css";

interface SearchBarProps {
  onResults: (results: Movie[]) => void;
  resetKey?: number;
}

export function SearchBar({ onResults, resetKey }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // If parent triggers resetKey, clear the query
  useEffect(() => {
    if (typeof resetKey !== "undefined") {
      // Defer state updates to avoid synchronous setState inside an effect
      const t = setTimeout(() => {
        setQuery("");
        setError(null);
        setIsLoading(false);
      }, 0);
      return () => clearTimeout(t);
    }
  }, [resetKey]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!query.trim()) {
      setError("Please enter a search term");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const results = await searchMovies(query.trim());
      onResults(results);
      inputRef.current?.blur();

      if (results.length === 0) {
        setError("No movies found. Try another search.");
      }
    } catch (err) {
      setError("Failed to search movies. Please try again.");
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <input
            id="search-input"
            ref={inputRef}
            type="text"
            value={query}
            autoComplete="off"
            onChange={(e) => {
              setQuery(e.target.value);
              setError(null);
            }}
            placeholder="Search for movies..."
            className="search-input"
            disabled={isLoading}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setError(null);
              }}
              className="clear-button"
              aria-label="Clear search"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
        <button type="submit" className="search-button" aria-label="Search" disabled={isLoading}>
          {isLoading ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className="fas fa-search"></i>
          )}
        </button>
      </form>
      {error && (
        <div className="search-error">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
