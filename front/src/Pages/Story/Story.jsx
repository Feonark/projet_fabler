import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { useAuth } from "../../Contexts/AuthContext";
import StorymemberCard from "../../Components/StorymemberCard/StorymemberCard";
import PlaceCard from "../../Components/PlaceCard/PlaceCard";

const Story = () => {
  const { storyId } = useParams();
  const { user, token } = useAuth();
  const [story, setStory] = useState();
  const memberCount =
    story?.members?.filter((m) => m.accepted === true).length ?? 0;
  const placeCount = story?.places.length ?? 0;

  useEffect(() => {
    getStory();
  }, []);

  ////////////////////////////////////////////////////////////////////////////////////////
  // FETCH STORY
  ////////////////////////////////////////////////////////////////////////////////////////

  const getStory = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/stories/${storyId}`,
        {
          headers: {
            Accept: "application/ld+json",
          },
        }
      );

      if (!response.ok) {
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

      const data = await response.json();
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

  const deleteStoryMember = async (id) => {
    if (!user || !story) return;

    if (confirm("You're about to delete the selected entity. Are you sure?")) {
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

  // const addPlace = await () => {
  //   if (!user || !story) return;

  //   if (checkIsPlacesFull()) {
  //     alert("Sorry, you cannot add any more places.");
  //     return;
  //   }

  //   try {
  //     const response = await fetch(`http://localhost:8000/api/places`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/ld+json",
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify({
  //         title:
  //         story: `/api/stories/${storyId}`,
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`Erreur serveur : ${response.status}`);
  //     }

  //     const data = await response.json();
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  // const editPlace = await () => {
  //   //
  // };

  // const deletePlace = await () => {
  //   //
  // };

  return (
    <div>
      <h1>Page Story {storyId}</h1>

      {/* BANDEAU */}
      {story && (
        <div className="">
          <h1 className="">{story.title}</h1>
          <div className="">
            <span className="">
              {story.isPublic === true ? "Private" : "Public"}
            </span>
            <span className="">
              {checkIfAcceptedMember()
                ? "You're a member"
                : "You're not a member"}
            </span>
            <span className="">{story.genreType}</span>
            <span className="">{story.audienceType}</span>
            <span className="">{story.languageType}</span>
            <span className="">{story.accessType}</span>
          </div>
          <div className="">{story.description}</div>
          {checkIfAcceptedMember() ? (
            <Link to={`/stories/${storyId}/chat`}>Enter RP Chat</Link>
          ) : (
            <button
              className=""
              onClick={joinStory}
              disabled={checkIsMembersFull() || checkIfJoined()}
            >
              Join this story
            </button>
          )}
        </div>
      )}

      <div className="">
        {/* MEMBER SECTION */}
        {story && (
          <div className="">
            <div className="">
              <div className="">
                <h2 className="">Members</h2>
                <span className="">{memberCount} / 5</span>
              </div>
              <div className="">
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
                <div className="">
                  <h2 className="">Requests to join</h2>
                  <div className="">
                    {story &&
                      story.members
                        .filter((member) => member.accepted === false)
                        .map((member) => (
                          <div className="" key={member.id}>
                            <p className="">{member.memberUser.username}</p>
                            <p className="">wants to join</p>
                            <button
                              className=""
                              onClick={() => addStoryMember(member.id)}
                            >
                              Accept
                            </button>
                            <button
                              className=""
                              onClick={() => deleteStoryMember(member.id)}
                            >
                              Deny
                            </button>
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
          <div className="">
            <div className="">
              <h2 className="">Places</h2>
              <span className="">{placeCount} / 10</span>
            </div>

            <div className="">
              {story.places?.map((place) => (
                <PlaceCard key={place.id} place={place} isAuthor={checkIfAuthor()}/>
              ))}
              {checkIfAuthor() ? <div className="">Add place</div> : ""}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Story;
