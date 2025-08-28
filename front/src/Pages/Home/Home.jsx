import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "../../Contexts/AuthContext";
import { SquarePlus, Search } from "lucide-react";
import "./Home.css";
import StoryCard from "../../Components/StoryCard/StoryCard";

const Home = () => {
  const { user } = useAuth();
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
        `${
          import.meta.env.VITE_API_URL
        }/api/stories?itemsPerPage=4&order[id]=desc`,
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
    <div className="page__container">
      {/* Section welcome */}
      <div className="page__title-header">
        <h1 className="title">Welcome home, {user?.username ?? "guest"}!</h1>
      </div>
      {/* Section create story */}
      <div className="create-banner__container">
        <h2 className="subtitle">Wanna create your own story?</h2>
        <p className="create__description">
          Create, publish and roleplay. Whenever you feel like it.
        </p>
        <Link
          className="btn invert-btn"
          to={user?.id ? "stories/new" : "login"}
        >
          <SquarePlus className="btn__icon invert-btn__icon" />
          <span className="">Create a story</span>
        </Link>
      </div>
      {/* Section latest stories */}
      <div className="latest-stories__container">
        <div className="subtitle__header">
          <div className="header__left-content">
            <h2 className="subtitle">Latest stories</h2>
          </div>

          <Link className="btn btn-outline" to="/stories/search">
            <Search className="chip__icon" />
            <span className="btn-txt-display">See all</span>
          </Link>
        </div>
        <div className="laststories-cards__container">
          {lastStories &&
            lastStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                formatEnumLabel={formatEnumLabel}
              />
            ))}
        </div>
      </div>
      {/* Section resume roleplay */}
      {user?.id && user?.storyMemberships?.some((m) => m.accepted) && (
        <div className="resume__container">
          <div className="subtitle__header">
            <div className="header__left-content">
              <h2 className="subtitle">Resume roleplay</h2>
            </div>

            <Link className="btn btn-outline" to="/profile">
              <Search className="chip__icon" />
              <span className="btn-txt-display">See all</span>
            </Link>
          </div>
          <div className="resume-cards__container">
            {user.id &&
              user.storyMemberships
                .filter((m) => m.accepted)
                .slice(-3) // prend les 3 derniers du tableau
                .reverse()
                .map((membership) => (
                  <StoryCard
                    key={membership.id}
                    story={membership.story}
                    author={membership.author}
                  />
                ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
