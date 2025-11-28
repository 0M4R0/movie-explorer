import type { Video } from "./Video";

export interface Movie {
    id: number;
    title: string;
    release_date: string;
    poster_path?: string | null;
    overview: string;
    vote_average: number;
    genre_ids?: number[];
    backdrop_path?: string | null;
}

export interface MovieDetails extends Movie {
    runtime?: number;
    genres: Array<{ id: number; name: string }>;
    videos?: {
        results: Video[];
    };
    credits?: {
        cast: Cast[];
    };
}

export interface Cast {
    id: number;
    name: string;
    character: string;
    profile_path?: string;
    order: number;
}
