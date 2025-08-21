import React from "react";
import { Link } from "react-router";
import { Pencil, Trash } from "lucide-react";
import "./PlaceCard.css";

const PlaceCard = ({ storyId, placeId, place, isAuthor, onDelete }) => {
  return (
    <div
      className="place-card__container"
      key={place.id}
      style={{
        backgroundImage: `linear-gradient(rgba(35,35,35,0.6), rgba(35,35,35,0.6)), url(http://localhost:8000/${place.placeImageUrl})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="place-card__infos">
        <h3 className="place-card__title bodytitle">{place.title}</h3>
        <p className="card__text">{place.description}</p>
      </div>
      {isAuthor ? (
        <div className="place-card__actions">
          <Link
            className="btn btn-on-background place-btn"
            to={`/stories/${storyId}/places/${placeId}/edit`}
          >
            <Trash className="btn__icon" />
            <span className="">Edit</span>
          </Link>
          <button
            className="btn btn-negative btn-on-background place-btn"
            onClick={onDelete}
          >
            <Pencil className="btn__icon btn__icon-negative" />
            <span className="">Delete</span>
          </button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default PlaceCard;
