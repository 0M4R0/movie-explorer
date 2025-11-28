import type { Movie, MovieDetails } from "../types/Movie";
import type { Actor } from "../types/Actor";

const apiKey = import.meta.env.VITE_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

interface MovieApiResponse {
  results: Movie[];
  total_pages: number;
}

interface ActorApiResponse {
  id: number;
  name: string;
  birthday?: string;
  biography?: string;
  profile_path?: string;
  place_of_birth?: string;
  movie_credits?: {
    cast: Movie[];
  };
}

// HELPER
const buildUrl = (
  endpoint: string,
  params: Record<string, string> = {},
): string => {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append("api_key", apiKey || "");

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  return url.toString();
};

// FETCH
export const fetchFromAPI = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

// SEARCH MOVIES
export const searchMovies = async (query: string): Promise<Movie[]> => {
  if (!query || !apiKey) return [];

  try {
    const firstPageUrl = buildUrl("/search/movie", {
      query: query,
      page: "1",
    });

    const firstPageData = await fetchFromAPI<MovieApiResponse>(firstPageUrl);
    const totalPages = firstPageData.total_pages;
    const allMovies: Movie[] = firstPageData.results || [];

    // 100 movies
    const pagesToFetch = Math.min(totalPages, 5); // Limit to first 5 pages
    if (pagesToFetch > 1) {
      const pagePromises = Array.from({ length: pagesToFetch - 1 }, (_, i) => {
        const page = i + 2;
        const pageUrl = buildUrl("/search/movie", {
          query: query,
          page: page.toString(),
        });
        return fetchFromAPI<MovieApiResponse>(pageUrl);
      });

      const results = await Promise.all(pagePromises);
      results.forEach((pageData) => {
        if (pageData.results) {
          allMovies.push(...pageData.results);
        }
      });
    }

    return allMovies;
  } catch (error) {
    console.error("Failed to search movies:", error);
    throw error;
  }
};

// GET RECENT MOVIES
export const getRecentMovies = async (page: number = 1): Promise<Movie[]> => {
  if (!apiKey) throw new Error("API key not found");

  try {
    const url = buildUrl("/movie/now_playing", {
      page: page.toString(),
    });

    const data = await fetchFromAPI<MovieApiResponse>(url);
    return data.results || [];
  } catch (error) {
    console.error("Failed to fetch popular movies:", error);
    throw error;
  }
};

// GET MOVIE DETAILS
export const getMovieDetails = async (
  movieId: number,
): Promise<MovieDetails> => {
  if (!apiKey) throw new Error("API key not found");

  try {
    const url = buildUrl(`/movie/${movieId}`, {
      append_to_response: "videos,credits",
    });

    const movieDetails = await fetchFromAPI<MovieDetails>(url);
    return movieDetails;
  } catch (error) {
    console.error(`Failed to fetch movie details for ID ${movieId}:`, error);
    throw error;
  }
};

// GET ACTOR DETAILS
export const getActorDetails = async (actorId: number): Promise<Actor> => {
  if (!apiKey) throw new Error("API key not found");

  try {
    const url = buildUrl(`/person/${actorId}`, {
      append_to_response: "movie_credits",
    });

    const actorData = await fetchFromAPI<ActorApiResponse>(url);

    const actor: Actor = {
      id: actorData.id,
      name: actorData.name,
      birthday: actorData.birthday,
      biography: actorData.biography,
      profile_path: actorData.profile_path,
      place_of_birth: actorData.place_of_birth,
      movies: actorData.movie_credits?.cast || [],
    };

    return actor;
  } catch (error) {
    console.error(`Failed to fetch actor details for ID ${actorId}:`, error);
    throw error;
  }
};

// FORMATTING

export const formatRuntime = (minutes?: number): string => {
  if (!minutes || minutes <= 0) return "N/A";

  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${hrs}h ${mins}m`;
};

export const getImageUrl = (
  path?: string | null,
  size: "w185" | "w500" | "w780" | "original" = "w500",
): string => {
  if (!path) return "";
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const findOfficialTrailer = (videos?: {
  results: Array<
    unknown & { site: string; type: string; official: boolean; key: string }
  >;
}): string | null => {
  if (!videos?.results || videos.results.length === 0) return null;

  // SEARCH OFFICIAL TRAILER
  const trailer = videos.results.find(
    (video) =>
      video.site === "YouTube" &&
      video.type === "Trailer" &&
      video.official === true,
  );

  // IF NO OFFICIAL, SEARCH ANY TRAILER
  const anyTrailer = videos.results.find(
    (video) => video.site === "YouTube" && video.type === "Trailer",
  );

  const selectedVideo = trailer || anyTrailer;
  return selectedVideo
    ? `https://www.youtube.com/embed/${selectedVideo.key}`
    : null;
};
