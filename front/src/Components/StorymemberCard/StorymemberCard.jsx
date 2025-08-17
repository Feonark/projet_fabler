import React from "react";
import { useAuth } from "../../Contexts/AuthContext";

const StorymemberCard = ({ member, isAuthor, onDelete }) => {
  const { user } = useAuth();

  return (
    <div className="" key={member.id}>
      <p className="">
        {member.memberUser.username}{" "}
        <span className="">{member.memberUser.id === user?.id && "(You)"}</span>
      </p>
      <p className="">{member.author === true ? "Author" : "Member"}</p>
      {isAuthor && member.author === false ? (
        <button className="" onClick={onDelete}>
          Delete
        </button>
      ) : (
        ""
      )}
    </div>
  );
};

export default StorymemberCard;
