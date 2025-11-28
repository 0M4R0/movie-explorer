export interface Video {
    id: string;
    key: string; // YouTube key → https://youtube.com/watch?v={key}
    name: string;
    site: "YouTube" | "Vimeo";
    type:
        | "Trailer"
        | "Teaser"
        | "Clip"
        | "Featurette"
        | "Behind the Scenes"
        | "Bloopers";
    official: boolean;
    published_at: string;
}
