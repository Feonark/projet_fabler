import React from "react";

const PlaceCard = ({ place, isAuthor }) => {
  return (
    <div className="" key={place.id}>
      <div className="">
        <h3 className="">{place.title}</h3>
        <p className="">{place.description}</p>
      </div>
      {isAuthor ? (
        <div className="">
          <button className="">Edit</button>
          <button className="">Delete</button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default PlaceCard;
