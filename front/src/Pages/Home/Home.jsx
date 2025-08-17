import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "../../Contexts/AuthContext";
import "./Home.css";

const Home = () => {
  const { user } = useAuth();
  const [lastStories, setLastStories] = useState();

  useEffect(() => {
    fetchStories();
    console.log(user);
  }, []);

  ////////////////////////////////////////////////////////////////////////////////////////
  // FETCH STORY
  ////////////////////////////////////////////////////////////////////////////////////////

  const fetchStories = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/stories?itemsPerPage=4&order[id]=desc`,
        {}
      );

      if (!res.ok) throw new Error("Erreur serveur");

      const data = await res.json();
      setLastStories(data.member || []);
    } catch (e) {
      if (e.name !== "AbortError") {
        console.error(e);
      }
    }
  };

  return (
    <div className="home-container">
      {/* Section welcome */}
      {user && (
        <div className="">
          <h1 className="">Welcome, {user.username ?? "guest"}!</h1>
        </div>
      )}
      {/* Section create story */}
      <div className="">
        <h1 className="">Wanna create your own story?</h1>
        <p className="">
          Create, publish and roleplay. Whenever you feel like it.
        </p>
        <Link to={user?.id ? "stories/new" : "login"}>Create a story</Link>
      </div>
      {/* Section latest stories */}
      {lastStories &&
        lastStories.map((story) => (
          <div className="" key={story.id}>
            <div className="">
              {story.public === true && <h1 className="">PUBLIC {story.id}</h1>}
              <span className="">{story.genreType}</span>
              <span className="">{story.audienceType}</span>
              <span className="">{story.languageType}</span>
              <span className="">{story.accessType}</span>
            </div>
            <div className="">
              <h2 className="">{story.title}</h2>
              <p className="">{story.description}</p>
            </div>
            <Link to={`/stories/${story.id}`}>Go to</Link>
          </div>
        ))}
      {/* Section resume roleplay */}
      {user &&
        user.storyMemberships
          ?.sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map((membership) => (
            <div className="">
              <h3 className="">{membership.story.title}</h3>
              <span className="">
                {membership.author === true ? "Author" : "Member"}
              </span>
            </div>
          ))}
    </div>
  );
};

export default Home;
