import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useAuth } from "../../Contexts/AuthContext";
import StorymemberCard from "../../Components/StorymemberCard/StorymemberCard";
import PlaceCard from "../../Components/PlaceCard/PlaceCard";
import {
  Pencil,
  Trash,
  ArrowLeft,
  LogOut,
  Eye,
  BadgeCheck,
  BadgeX,
  BookMarked,
  Target,
  Globe,
  DoorClosed,
  Check,
  X,
  SquarePlus,
} from "lucide-react";
import "./Story.css";

const Story = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [story, setStory] = useState();
  const memberCount =
    story?.members?.filter((m) => m.accepted === true).length ?? 0;
  const placeCount = story?.places.length ?? 0;

  useEffect(() => {
    getStory();
  }, [user?.id]);

  ////////////////////////////////////////////////////////////////////////////////////////
  // FETCH STORY
  ////////////////////////////////////////////////////////////////////////////////////////

  const getStory = async () => {
    try {
      const headers = {
        Accept: "application/ld+json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `http://localhost:8000/api/stories/${storyId}`,
        { headers }
      );

      if (!response.ok) {
        navigate("/notfound");
        throw new Error(`Erreur serveur : ${response.status}`);
      }

      const data = await response.json();
      setStory(data);
    } catch (err) {
      console.error(err);
    }
  };

  ////////////////////////////////////////////////////////////////////////////////////////
  // CHECKERS
  ////////////////////////////////////////////////////////////////////////////////////////

  const checkIfAcceptedMember = () => {
    if (!user || !story) return;

    return story.members?.some(
      (member) => member.accepted === true && member.memberUser.id === user.id
    );
  };

  const checkIfJoined = () => {
    if (!user || !story) return;

    return story.members?.some((member) => member.memberUser.id === user.id);
  };

  const checkIfAuthor = () => {
    if (!user || !story) return;

    if (user.id === story.author.id) return true;

    return false;
  };

  const checkIfRequests = () => {
    if (!user || !story) return;

    return story.members?.some((member) => member.accepted === false);
  };

  const checkIsMembersFull = () => {
    return memberCount >= 5;
  };

  const checkIsPlacesFull = () => {
    return placeCount >= 10;
  };

  ////////////////////////////////////////////////////////////////////////////////////////
  // CRUDs
  ////////////////////////////////////////////////////////////////////////////////////////

  const joinStory = async () => {
    if (!user || !story) return;

    if (checkIsMembersFull()) {
      alert("Sorry, this story is full.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/story_members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/ld+json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          story: `/api/stories/${storyId}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur : ${response.status}`);
      }

      await getStory();
    } catch (err) {
      console.error(err);
    }
  };

  const addStoryMember = async (id) => {
    if (!user || !story) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/story_members/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/merge-patch+json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            isAccepted: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur serveur : ${response.status}`);
      }

      setStory((prev) => ({
        ...prev,
        members: prev.members.map((m) =>
          m.id === id ? { ...m, accepted: true } : m
        ),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const quitStory = () => {
    if (!user || !story) return;

    const id = getCurrentStoryMemberId();
    if (id) {
      deleteStoryMember(id);
    }
  };

  const deleteStoryMember = async (id) => {
    if (!user || !story) return;

    if (confirm("Are you sure?")) {
      try {
        const response = await fetch(
          `http://localhost:8000/api/story_members/${id}`,
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

        setStory((prev) => ({
          ...prev,
          members: prev.members.filter((member) => member.id !== id),
        }));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const deleteStory = async (id) => {
    if (!user || !story) return;

    if (confirm("You're about to delete this story. Are you sure?")) {
      try {
        const response = await fetch(
          `http://localhost:8000/api/stories/${id}`,
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

        alert("Story successfully deleted.");
        getUser();
        navigate("/");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const deletePlace = async (id) => {
    if (!user || !story) return;

    if (confirm("You're about to delete this place. Are you sure?")) {
      try {
        const response = await fetch(`http://localhost:8000/api/places/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/ld+json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Erreur serveur : ${response.status}`);
        }

        setStory((prev) => ({
          ...prev,
          places: prev.places.filter((place) => place.id !== id),
        }));

        alert("Place successfully deleted.");
      } catch (err) {
        console.error(err);
      }
    }
  };

  ////////////////////////////////////////////////////////////////////////////////////////
  // OTHER
  ////////////////////////////////////////////////////////////////////////////////////////

  const formatEnumLabel = (value) => {
    return value
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getCurrentStoryMemberId = () => {
    if (!user || !story) return null;
    const currentMember = story.members?.find(
      (member) => member.memberUser.id === user.id
    );
    return currentMember?.id ?? null;
  };

  ////////////////////////////////////////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////////////////////////////////////////

  return (
    <div className="story__container page__container">
      <div className="story__header page__header">
        <Link
          to="/stories/search"
          className="btn"
          onClick={() => {
            navigate(-1);
          }}
        >
          <ArrowLeft className="btn__icon" />
          <span className="btn-txt-display">To stories</span>
        </Link>
        {checkIfAuthor() ? (
          <div className="header__author">
            <Link className="btn" to={`/stories/${storyId}/edit`}>
              <Pencil className="btn__icon" />
              <span className="btn-txt-display">Edit story</span>
            </Link>
            <button
              className="btn btn-negative"
              onClick={() => deleteStory(storyId)}
            >
              <Trash className="btn__icon btn__icon-negative" />
              <span className="btn-txt-display">Delete story</span>
            </button>
          </div>
        ) : (
          checkIfAcceptedMember() && (
            <button className="btn btn-negative" onClick={() => quitStory()}>
              <LogOut className="btn__icon btn__icon-negative" />
              <span className="btn-txt-display">Quit story</span>
            </button>
          )
        )}
      </div>

      {/* BANDEAU */}
      {story && (
        <div
          className="banner__container"
          style={{
            backgroundImage: `linear-gradient(rgba(35,35,35,0.6), rgba(35,35,35,0.6)), url(http://localhost:8000/${story.bannerImageUrl})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <h1 className="title">{story.title}</h1>
          <div className="banner__chips">
            <span className="banner__chip">
              <Eye className="chip__icon" />
              <span className="chip__txt">
                {story.public === true ? "Public" : "Private"}
              </span>
            </span>
            <span className="banner__chip">
              {checkIfAcceptedMember() ? (
                <BadgeCheck className="chip__icon author__icon" />
              ) : (
                <BadgeX className="chip__icon"></BadgeX>
              )}
              <span className="chip__txt">
                {checkIfAcceptedMember()
                  ? "You're a member"
                  : "You're not a member"}
              </span>
            </span>
            <span className="banner__chip">
              <BookMarked className="chip__icon" />
              <span className="chip__txt">
                {formatEnumLabel(`${story.genreType}`)}
              </span>
            </span>
            <span className="banner__chip">
              <Target className="chip__icon" />
              <span className="chip__txt">
                {formatEnumLabel(`${story.audienceType}`)}
              </span>
            </span>
            <span className="banner__chip">
              <Globe className="chip__icon" />
              <span className="chip__txt">
                {formatEnumLabel(`${story.languageType}`)}
              </span>
            </span>
            <span className="banner__chip">
              <DoorClosed className="chip__icon" />
              <span className="chip__txt">
                {formatEnumLabel(`${story.accessType}`)}
              </span>
            </span>
          </div>
          <div className="banner__description">{story.description}</div>
          {user?.id ? (
            checkIfAcceptedMember() ? (
              <Link className="btn invert-btn" to={`/stories/${storyId}/chat`}>
                Enter RP Chat
              </Link>
            ) : (
              <button
                className="btn invert-btn"
                onClick={joinStory}
                disabled={checkIsMembersFull() || checkIfJoined()}
              >
                {checkIfJoined()
                  ? "You asked to join this story"
                  : "Join this story"}
              </button>
            )
          ) : (
            <Link to="/login" className="btn invert-btn">
              Log in to join
            </Link>
          )}
        </div>
      )}

      <div className="content__container">
        {/* MEMBER SECTION */}
        {story && (
          <div className="members__container">
            <div className="members-accepted">
              <div className="subtitle__header">
                <h2 className="subtitle">Members</h2>
                <span className="count-chip">
                  <span className="count-chip__count">{memberCount}</span>
                  <span className="count-chip__count count-chip__maxCount">
                    / 5
                  </span>
                </span>
              </div>
              <div className="members__cards">
                {story.members
                  .filter((member) => member.accepted === true)
                  .map((member) => (
                    <StorymemberCard
                      key={member.id}
                      member={member}
                      isAuthor={checkIfAuthor()}
                      onDelete={() => deleteStoryMember(member.id)}
                    />
                  ))}
              </div>
            </div>

            {checkIfAuthor() ? (
              checkIfRequests() ? (
                <div className="pending__container">
                  <div className="subtitle__header">
                    <h2 className="subtitle">Requests to join</h2>
                  </div>
                  <div className="join__cards">
                    {story &&
                      story.members
                        .filter((member) => member.accepted === false)
                        .map((member) => (
                          <div className="member__card" key={member.id}>
                            <div className="member__content">
                              <img
                                src={`http://localhost:8000${member.memberUser?.avatarUrl}`}
                                className="member__avatar"
                                alt="User avatar"
                              />
                              <span className="member__infos">
                                <span className="member__username">
                                  {member.memberUser.username}
                                </span>
                                <span className="member__role">
                                  wants to join
                                </span>
                              </span>
                            </div>

                            <div className="member__actions">
                              <button
                                className="btn btn-sm"
                                onClick={() => addStoryMember(member.id)}
                                disabled={checkIsMembersFull()}
                              >
                                <Check className="btn__icon btn-sm__icon btn__icon-positive" />
                              </button>
                              <button
                                className="btn btn-sm btn-negative"
                                onClick={() => deleteStoryMember(member.id)}
                              >
                                <X className="btn__icon btn-sm__icon btn__icon-negative" />
                              </button>
                            </div>
                          </div>
                        ))}
                  </div>
                </div>
              ) : (
                ""
              )
            ) : (
              ""
            )}
          </div>
        )}

        {/* PLACE SECTION */}
        {story && (
          <div className="place__container">
            <div className="subtitle__header">
              <h2 className="subtitle">Places</h2>
              <span className="count-chip">
                <span className="count-chip__count">{placeCount}</span>
                <span className="count-chip__count count-chip__maxCount">
                  / 10
                </span>
              </span>
            </div>

            <div className="place-cards__container">
              {story.places?.map((place) => (
                <PlaceCard
                  key={place.id}
                  placeId={place.id}
                  place={place}
                  storyId={storyId}
                  isAuthor={checkIfAuthor()}
                  onDelete={() => deletePlace(place.id)}
                />
              ))}
              {checkIfAuthor() &&
                (checkIsPlacesFull() ? (
                  <button className="btn btn-outline place-btn" disabled>
                    <SquarePlus className="btn__icon" />
                    <span className="">Add place</span>
                  </button>
                ) : (
                  <Link
                    className="btn btn-outline place-btn"
                    to={`/stories/${storyId}/places/new`}
                  >
                    <SquarePlus className="btn__icon" />
                    <span className="">Add place</span>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Story;
