import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  getMovieDetails,
  formatRuntime,
  getImageUrl,
  findOfficialTrailer,
} from "../services/api";
import type { MovieDetails } from "../types/Movie";
import "../styles/item-details.css";

const ItemDetailsContent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!id) {
        setError("No movie ID provided");
        return;
      }

      setError(null);

      try {
        const data = await getMovieDetails(Number(id));
        setMovie(data as MovieDetails);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load movie details",
        );
      }
    };

    fetchMovieDetails();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  if (error || !movie) {
    return (
      <div className="movie-details-container">
        <button
          className="btn back-btn"
          onClick={handleBack}
          type="button">
          <i className="fas fa-arrow-left"></i>
          Back
        </button>
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>Error loading movie details. Please try again.</p>
          {error && <p className="error-details">{error}</p>}
        </div>
      </div>
    );
  }

  const trailerUrl = findOfficialTrailer(movie.videos);
  const releaseYear = movie.release_date?.replaceAll("-", " / ") || "N/A";
  const topCast = movie.credits?.cast.slice(0, 10) || [];

  return (
    <div className="movie-details-container">
      <button className="btn back-btn" onClick={handleBack} type="button">
        <i className="fas fa-arrow-left"></i>
        Back
      </button>

      <div className="movie-details">
        {/* Backdrop Image */}
        {movie.backdrop_path && (
          <img
            className="movie-backdrop"
            src={getImageUrl(movie.backdrop_path, "original")}
            alt=""
            aria-hidden="true"
            loading="lazy"
          />
        )}

        <div className="movie-content">
          {/* Poster Section */}
          <div className="movie-poster-container">
            <img
              className="movie-poster animate-fade-in"
              src={
                movie.poster_path
                  ? getImageUrl(movie.poster_path, "w780")
                  : "/placeholder-poster.png"
              }
              alt={`${movie.title} poster`}
              loading="lazy"
            />
          </div>

          {/* Info Section */}
          <div className="movie-info-container animate-slide-up">
            <h1 className="movie-title-detail">{movie.title}</h1>

            {/* Metadata */}
            <div className="movie-metadata">
              <div className="metadata-item">
                <i className="far fa-calendar-alt"></i>
                <span>{releaseYear}</span>
              </div>
              {movie.runtime && (
                <div className="metadata-item">
                  <i className="far fa-clock"></i>
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>
              )}
              <div
                className={`metadata-item ${movie.vote_average >= 7 ? "high-rating" : ""}`}
              >
                <i className="fas fa-star"></i>
                <span>{movie.vote_average.toFixed(1)} / 10</span>
              </div>
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="genres-list">
                {movie.genres.map((genre) => (
                  <span key={genre.id} className="genre-tag">
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Overview */}
            <p className="movie-description">{movie.overview}</p>

            {/* Trailer */}
            {trailerUrl && (
              <div className="trailer-container">
                <h3 className="section-title">
                  <i className="fas fa-play-circle"></i> Trailer
                </h3>
                <iframe
                  src={trailerUrl}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`${movie.title} trailer`}
                  loading="lazy"
                  className="trailer-iframe"
                ></iframe>
              </div>
            )}
          </div>
        </div>

        {/* Cast Section */}
        {topCast.length > 0 && (
          <section className="cast-section animate-fade-in">
            <h3 className="section-title">
              <i className="fas fa-users"></i> Cast
            </h3>
            <div className="cast-list">
              {topCast.map((actor, index) => (
                <Link key={actor.id} to={`/actor/${actor.id}`} className="my-link">
                  <div
                    className="cast-item"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <img
                      className="cast-photo"
                      src={
                        actor.profile_path
                          ? getImageUrl(actor.profile_path, "w185")
                          : "/placeholder-avatar.png"
                      }
                      alt={actor.name}
                      loading="lazy"
                    />
                    <div className="cast-info">
                      <div className="cast-name info">{actor.name}</div>
                      <div className="cast-character info">{actor.character}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export function ItemDetails() {
  return ItemDetailsContent();
}
