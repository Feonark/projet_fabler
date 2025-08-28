import { Link } from "react-router";
import { BookMarked, Target, Globe, DoorClosed } from "lucide-react";
import "./StoryCard.css";

const StoryCard = ({ story, author, formatEnumLabel }) => {
  return (
    <Link
      className="card__container"
      to={`/stories/${story.id}`}
      style={{
        backgroundImage: `linear-gradient(rgba(35,35,35,0.8), rgba(35,35,35,0.8)), url(${
          import.meta.env.VITE_API_URL
        }${story.bannerImageUrl})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="card__chips">
        {author !== undefined && author !== null && (
          <span className="card__chip">
            <BookMarked className="card-chip__icon" />
            <span>{author === true ? "Author" : "Member"}</span>
          </span>
        )}
        {story.genreType && (
          <span className="card__chip">
            <BookMarked className="card-chip__icon" />
            {formatEnumLabel(`${story.genreType}`)}
          </span>
        )}
        {story.audienceType && (
          <span className="card__chip">
            <Target className="card-chip__icon" />
            {formatEnumLabel(`${story.audienceType}`)}
          </span>
        )}
        {story.languageType && (
          <span className="card__chip">
            <Globe className="card-chip__icon" />
            {formatEnumLabel(`${story.languageType}`)}
          </span>
        )}
        {story.accessType && (
          <span className="card__chip">
            <DoorClosed className="card-chip__icon" />
            {formatEnumLabel(`${story.accessType}`)}
          </span>
        )}
      </div>
      <div className="card__infos">
        <h2 className="bodytitle">{story.title}</h2>
        {story.description && (
          <p className="card__text">
            {story.description.length > 150
              ? `${story.description.substring(0, 150)}...`
              : story.description}
          </p>
        )}
      </div>
    </Link>
  );
};

export default StoryCard;
