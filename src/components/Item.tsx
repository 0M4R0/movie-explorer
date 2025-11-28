import { Link } from "react-router-dom";
import { z } from "zod";
import "../styles/item.css";

const CardPropsSchema = z
  .object({
    id: z.number().optional(),
    title: z.string(),
    year: z.string().optional(),
    posterUrl: z.string().optional(),
    voteAverage: z.number().optional(),
  })
  .strict();

type CardProps = z.infer<typeof CardPropsSchema>;

export function Item({ id, title, year, posterUrl, voteAverage }: CardProps) {
  if (import.meta.env.MODE !== "production") {
    CardPropsSchema.parse({ id, title, year, posterUrl, voteAverage });
  }

  const rating = voteAverage || 0;
  const getRatingClass = () => {
    if (rating >= 7) return "item-high-rating";
    if (rating >= 5) return "item-medium-rating";
    return "item-low-rating";
  };

  return (
    <div className="item-card-item">
      <Link to={`/movie/${id ?? ""}`} className="item-card-link">
        <div className="item-card">
          {/* Rating Badge */}
          <div className={`item-card-rating ${getRatingClass()}`}>
            {rating.toFixed(1)}
          </div>

          {/* Poster Container */}
          <div className="item-card-poster-container">
            {posterUrl ? (
              <img
                className="item-card-poster"
                src={posterUrl}
                alt={title}
                loading="lazy"
              />
            ) : (
              <div className="item-card-poster-placeholder">
                <i className="fas fa-film"></i>
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="item-poster-overlay"></div>
          </div>

          {/* Movie Info */}
          <div className="item-card-info">
            <h2 className="item-card-title">{title}</h2>

            <div className="item-card-metadata">
              {year && (
                <span className="item-card-year">
                  <i className="far fa-calendar-alt"></i>
                  {year.replaceAll("-", "/")}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

Item.defaultProps = {
  year: undefined,
  posterUrl: undefined,
  voteAverage: undefined,
  runtime: undefined,
};
