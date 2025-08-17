import { useState, useEffect } from "react";
import { Link } from "react-router";
import "./Home.css";

const Home = () => {
  const [lastStories, setLastStories] = useState();

  useEffect(() => {
    fetchStories();
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
      <h1 className="">Page Home</h1>
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
    </div>
  );
};

export default Home;
