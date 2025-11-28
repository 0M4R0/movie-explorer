import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getActorDetails } from "../services/api";
import { z } from "zod";
import { ItemGrid } from "./ItemGrid";
import "../styles/actor-details.css";

const MovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  poster_path: z.string().nullable().optional(),
  release_date: z.string(),
  overview: z.string(),
  vote_average: z.number(),
  genre_ids: z.array(z.number()).optional(),
  backdrop_path: z.string().nullable().optional(),
});

const ActorDetailsSchema = z.object({
  id: z.number(),
  name: z.string(),
  birthday: z.string().nullable().optional(),
  biography: z.string().nullable().optional(),
  profile_path: z.string().nullable().optional(),
  place_of_birth: z.string().nullable().optional(),
  movies: z.array(MovieSchema).optional(),
});

type ActorDetails = z.infer<typeof ActorDetailsSchema>;

export function ActorDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [actor, setActor] = useState<ActorDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActor = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const response = await getActorDetails(Number(id));

        const parsedActor = ActorDetailsSchema.parse(response);

        setActor(parsedActor);
      } catch (error) {
        console.error("Error loading actor details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActor();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) return <p>loading...</p>;
  if (!actor) return <p>No actor found</p>;

  return <ActorDetailsContent actor={actor} onBack={handleBack} />;
}

const ActorDetailsContent = ({
  actor,
  onBack,
}: {
  actor: ActorDetails;
  onBack: () => void;
}) => {
  return (
    <div className="actor-details-container">
      <button className="btn back-btn" onClick={onBack} type="button">
        <i className="fas fa-arrow-left"></i>
        Back
      </button>
      <div className="actor-info">
        <div className="actor-info-poster">
          <img
            className="actor-poster"
            src={
              actor.profile_path
                ? `https://image.tmdb.org/t/p/w300${actor.profile_path}`
                : "/no-image.png"
            }
            alt={actor.name}
          />
        </div>
        <div className="actor-info-details">
          <h1>{actor.name}</h1>

          <p>
            <strong>Birthday:</strong> {actor.birthday ?? "N/A"}
          </p>
          <p>
            <strong>Place:</strong> {actor.place_of_birth ?? "N/A"}
          </p>
          <p>
            <strong>Biography:</strong> {actor.biography ?? "Not available"}
          </p>
        </div>
      </div>

      <h2 className="actor-related">Related</h2>
      <ItemGrid items={actor.movies ?? []} />
    </div>
  );
};
