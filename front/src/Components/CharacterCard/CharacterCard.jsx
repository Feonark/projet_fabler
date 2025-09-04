import { Link } from "react-router";
import { Pencil, Trash } from "lucide-react";
import "./CharacterCard.css";

const CharacterCard = ({ character, deleteCharacter }) => {
  return (
    <div
      className="chara-card__container"
      key={character.id}
      style={{
        backgroundImage: `linear-gradient(rgba(35,35,35,0.8), rgba(35,35,35,0.8)), url(${
          import.meta.env.VITE_API_URL
        }${character.portraitUrl})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <img
        src={`${import.meta.env.VITE_API_URL}${character.avatarUrl}`}
        className="chara-card__avatar"
        alt="Character avatar"
      />
      <div className="chara-card__infos">
        <div className="chara-card__titles">
          <span className="bodysubtitle">{character.title}</span>
          <span className="bodytitle">{character.name}</span>
        </div>
        <div className="chara-card__buttons">
          <Link
            className="btn btn-on-background btn__character"
            to={`/profile/characters/${character.id}/edit`}
          >
            <Pencil className="btn__icon" />
          </Link>
          <button
            className="btn btn-on-background btn__character"
            onClick={() => deleteCharacter(character.id)}
          >
            <Trash className="btn__icon btn__icon-negative" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterCard;
