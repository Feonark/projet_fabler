import React from "react";
import { Link } from "react-router";

const PlaceCard = ({ storyId, placeId, place, isAuthor, onDelete }) => {
  return (
    <div className="" key={place.id}>
      <div className="">
        <h3 className="">{place.title}</h3>
        <p className="">{place.description}</p>
      </div>
      {isAuthor ? (
        <div className="">
          <Link to={`/stories/${storyId}/places/${placeId}/edit`}>Edit</Link>
          <button className="" onClick={onDelete}>
            Delete
          </button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default PlaceCard;
