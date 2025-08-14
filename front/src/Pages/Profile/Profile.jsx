import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useAuth } from "../../Contexts/AuthContext";

const Profile = () => {
  const { user, token } = useAuth();
  const [userProfile, setUserProfile] = useState();

  useEffect(() => {
    if (user) setUserProfile(user);
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
    <div>
      <h1>Page Profile</h1>
      <div className=""></div>
      {userProfile?.createdAt && (
        <div className="">
          {/* PROFILE CARD */}
          <div className="">
            <h1 className="">{user.username}</h1>
            <div className="">
              <span className="">{user.isOnline ? "Online" : "Offline"}</span>
              <span className="">Joined on {user.createdAt.split("T")[0]}</span>
              <span className="">{user.birthdate?.split("T")[0]}</span>
            </div>
            <div className="">{user.description ?? "No description"}</div>
          </div>

          <div className="">
            {/* STORIES */}
            <div className="">
              <div className="">
                <h2 className="">Stories</h2>
                <span className="">{user.storyMemberships?.length}/ 10</span>
                <Link to="/stories/new">Create story</Link>
              </div>
              <div className="">
                {user.storyMemberships?.map((membership) => (
                  <div className="" key={membership.id}>
                    <span className="">
                      {membership.author === true ? "Author" : "Member"}
                    </span>
                    <h2 className="">{membership.story?.title}</h2>
                    <Link to={`/stories/${membership.story?.id}`}>Go to</Link>
                  </div>
                ))}
              </div>
            </div>

            {/* CHARACTERS */}
            <div className="">
              <div className="">
                <h2 className="">Characters</h2>
                <span className="">{userProfile.characters?.length}/ 10</span>
                <Link to="/profile/characters/new">Create character</Link>
              </div>
              <div className="">
                {userProfile.characters?.map((character) => (
                  <div className="" key={character.id}>
                    <p className="">{character.title}</p>
                    <h2 className="">{character.name}</h2>
                    <Link to={`/profile/characters/${character.id}/edit`}>
                      Edit
                    </Link>
                    <button onClick={() => deleteCharacter(character.id)}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className=""></div>
        </div>
      )}
    </div>
  );
};

export default Profile;
