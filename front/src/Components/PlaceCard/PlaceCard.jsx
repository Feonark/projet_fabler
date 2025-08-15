import React from "react";
import { Link } from "react-router";

const PlaceCard = ({ storyId, placeId, place, isAuthor, onDelete }) => {
  return (
    <div className="" key={place.id}>
      <div className="">
        <h3 className="">{place.title}</h3>
        <p className="">{place.description}</p>
        <img
          src={
            `http://localhost:8000/${place.placeImageUrl}` ??
            `http://localhost:8000/uploads/banners/defaultBanner.jpg`
          }
          alt="Test"
          style={{
            width: "100%",
            maxHeight: "50px",
            objectFit: "cover",
            borderRadius: "8px",
          }}
        />
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
