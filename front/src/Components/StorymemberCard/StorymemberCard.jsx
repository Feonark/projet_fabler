import React from "react";
import { useAuth } from "../../Contexts/AuthContext";
import { Trash } from "lucide-react";
import "./StorymemberCard.css";

const StorymemberCard = ({ member, isAuthor, onDelete }) => {
  const { user } = useAuth();

  return (
    <div className="member__card" key={member.id}>
      <div className="member__content">
        <img
          src={`http://localhost:8000${member.memberUser?.avatarUrl}`}
          className="member__avatar"
          alt="User avatar"
        />
        <div className="member__infos">
          <span className="member__username">
            {member.memberUser.username}
            <span className="member__indication">
              {member.memberUser.id === user?.id && "(You)"}
            </span>
          </span>
          <span className="member__role">
            {member.author === true ? "Author" : "Member"}
          </span>
        </div>
      </div>

      <div className="member__actions">
        {isAuthor && member.author === false ? (
          <button className="btn btn-sm btn-negative" onClick={onDelete}>
            <Trash className="btn__icon btn-sm__icon btn__icon-negative" />
          </button>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default StorymemberCard;
