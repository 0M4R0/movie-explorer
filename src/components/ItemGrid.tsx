import type { Movie } from "../types/Movie";
import { getImageUrl } from "../services/api";
import { Item } from "./Item";
import "../styles/item-grid.css";

interface MovieProps {
  items: Movie[];
}

export function ItemGrid({ items }: MovieProps) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <i className="fas fa-search"></i>
        <p>No movies found. Try searching for something else!</p>
      </div>
    );
  }

  return (
    <ul className="item-grid">
      {items.map((movie) => (
        <li key={movie.id} className="item">
          <Item
            id={movie.id}
            title={movie.title}
            year={movie.release_date}
            posterUrl={getImageUrl(movie.poster_path, "w500")}
            voteAverage={movie.vote_average}
          />
        </li>
      ))}
    </ul>
  );
}
