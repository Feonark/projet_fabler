import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../../Contexts/AuthContext";
import { Pencil, ArrowLeft, House, Cake, SquarePlus } from "lucide-react";
import StoryCard from "../../Components/StoryCard/StoryCard";
import CharacterCard from "../../Components/CharacterCard/CharacterCard";
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
  }, [user?.id]);

  ////////////////////////////////////////////////////////////////////////////////////////
  // CHECKERSs
  ////////////////////////////////////////////////////////////////////////////////////////

  const checkIsCharactersFull = () => {
    return (userProfile?.characters?.length ?? 0) >= 10;
  };

  ////////////////////////////////////////////////////////////////////////////////////////
  // CRUDs
  ////////////////////////////////////////////////////////////////////////////////////////

  const deleteCharacter = async (id) => {
    if (!user) return;

    if (confirm("You're about to delete this character. Are you sure?")) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/characters/${id}`,
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
              backgroundImage: `linear-gradient(rgba(35,35,35,0.8), rgba(35,35,35,0.8)), url(${
                import.meta.env.VITE_API_URL
              }${user.avatarUrl})`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <img
              src={`${import.meta.env.VITE_API_URL}${user.avatarUrl}`}
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
              {user.birthdate && (
                <span className="banner__chip">
                  <Cake className="chip__icon" />
                  <span className="chip__txt">
                    {user.birthdate?.split("T")[0]}
                  </span>
                </span>
              )}
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
                      }{" "}
                      stories
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
                    <StoryCard
                      key={membership.id}
                      story={membership.story}
                      author={membership.author}
                    />
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
                {checkIsCharactersFull() ? (
                  <button className="btn btn-outline" disabled>
                    <SquarePlus className="chip__icon" />
                    <span className="btn-txt-display">Create character</span>
                  </button>
                ) : (
                  <Link
                    className="btn btn-outline"
                    to="/profile/characters/new"
                  >
                    <SquarePlus className="chip__icon" />
                    <span className="btn-txt-display">Create character</span>
                  </Link>
                )}
              </div>
              <div className="chara-cards__container">
                {userProfile.characters?.map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    deleteCharacter={deleteCharacter}
                  />
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
