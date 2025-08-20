import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../Contexts/AuthContext";
import {
  Pencil,
  ArrowLeft,
  House,
  Cake,
  SquarePlus,
  Trash,
} from "lucide-react";
import "./Profile.css";

const Profile = () => {
  const { user, token, getUser } = useAuth();
  const [userProfile, setUserProfile] = useState();
  const navigate = useNavigate();

  useEffect(() => {
    getUser();

    if (user) {
      setUserProfile(user);
    }
  }, [user]);

  ////////////////////////////////////////////////////////////////////////////////////////
  // CRUDs
  ////////////////////////////////////////////////////////////////////////////////////////

  const deleteCharacter = async (id) => {
    if (!user) return;

    if (confirm("You're about to delete this character. Are you sure?")) {
      try {
        const response = await fetch(
          `http://localhost:8000/api/characters/${id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/ld+json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Erreur serveur : ${response.status}`);
        }

        alert("Character successfully deleted.");

        setUserProfile({
          ...userProfile,
          characters: userProfile.characters.filter((c) => c.id !== id),
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="profile__container page__container">
      {/* HEADER */}
      <div className="profile__header page__header">
        <button
          className="btn"
          onClick={() => {
            navigate(-1);
          }}
        >
          <ArrowLeft className="btn__icon" />
          <span className="btn-txt-display">Back</span>
        </button>
        <Link className="btn" to="#">
          <Pencil className="btn__icon" />
          <span className="btn-txt-display">Edit profile</span>
        </Link>
      </div>
      {userProfile?.createdAt && (
        <main className="profile__main">
          {/* PROFILE CARD */}
          <div
            className="profile__card"
            style={{
              backgroundImage: `linear-gradient(rgba(35,35,35,0.8), rgba(35,35,35,0.8)), url(http://localhost:8000${user.avatarUrl})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <img
              src={`http://localhost:8000${user.avatarUrl}`}
              alt="User avatar"
              style={{
                width: "128px",
                maxHeight: "128px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
            <h1 className="title">{user.username}</h1>
            <div className="banner__chips">
              <span className="banner__chip">
                <House className="chip__icon" />
                <span className="chip__txt">
                  Joined on {user.createdAt.split("T")[0]}
                </span>
              </span>
              <span className="banner__chip">
                <Cake className="chip__icon" />
                <span className="chip__txt">
                  {user.birthdate?.split("T")[0]}
                </span>
              </span>
            </div>
            <div className="profile__description">
              {user.description ?? "No description"}
            </div>
          </div>

          <div className="profile__content">
            {/* STORIES */}
            <div className="stories__container">
              <div className="subtitle__header">
                <div className="header__left-content">
                  <h2 className="subtitle">Your stories</h2>
                  <span className="count-chip">
                    <span className="count-chip__count">
                      {
                        user.storyMemberships?.filter(
                          (membership) => membership.accepted == true
                        ).length
                      }
                    </span>
                    <span className="count-chip__count count-chip__maxCount">
                      / 10
                    </span>
                  </span>
                </div>

                <Link className="btn btn-outline" to="/stories/new">
                  <SquarePlus className="chip__icon" />
                  <span className="btn-txt-display">Create story</span>
                </Link>
              </div>
              <div className="stories-cards__container">
                {user.storyMemberships
                  ?.filter((membership) => membership.accepted == true)
                  .map((membership) => (
                    <Link
                      to={`/stories/${membership.story?.id}`}
                      className="card__container"
                      key={membership.id}
                      style={{
                        backgroundImage: `linear-gradient(rgba(35,35,35,0.8), rgba(35,35,35,0.8)), url(http://localhost:8000${membership.story?.bannerImageUrl})`,
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      <span className="card__chips">
                        <span className="card__chip">
                          <SquarePlus className="chip__icon" />
                          <span className="">
                            {membership.author === true ? "Author" : "Member"}
                          </span>
                        </span>
                      </span>
                      <h2 className="bodytitle">{membership.story?.title}</h2>
                    </Link>
                  ))}
              </div>
            </div>

            {/* CHARACTERS */}
            <div className="characters__container">
              <div className="subtitle__header">
                <div className="header__left-content">
                  <h2 className="subtitle">Characters</h2>
                  <span className="count-chip">
                    <span className="count-chip__count">
                      {userProfile.characters?.length}
                    </span>
                    <span className="count-chip__count count-chip__maxCount">
                      / 10
                    </span>
                  </span>
                </div>
                <Link className="btn btn-outline" to="/profile/characters/new">
                  <SquarePlus className="chip__icon" />
                  <span className="btn-txt-display">Create character</span>
                </Link>
              </div>
              <div className="chara-cards__container">
                {userProfile.characters?.map((character) => (
                  <div
                    className="chara-card__container"
                    key={character.id}
                    style={{
                      backgroundImage: `linear-gradient(rgba(35,35,35,0.8), rgba(35,35,35,0.8)), url(http://localhost:8000${character.portraitUrl})`,
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <img
                      src={`http://localhost:8000${character.avatarUrl}`}
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
                ))}
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default Profile;
