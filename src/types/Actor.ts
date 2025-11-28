import type { Movie } from "./Movie";

export interface Actor {
    id: number;
    name: string;
    birthday?: string;
    biography?: string;
    profile_path?: string;
    place_of_birth?: string;
    movies?: Movie[];
}