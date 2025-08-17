import { useEffect, useState, useRef } from "react";
import { Link } from "react-router";

const GENRE_OPTIONS = [
  "FANTASY",
  "SCI_FICTION",
  "HORROR",
  "ROMANCE",
  "MEDIEVAL",
  "POST_APOCALYPTIC",
  "CYBERPUNK",
  "SUPERNATURAL",
  "MYSTERY",
  "ADVENTURE",
  "STEAMPUNK",
  "HISTORICAL",
  "COMEDY",
  "DRAMA",
  "THRILLER",
];
const AUDIENCE_OPTIONS = ["GENERAL", "TEEN", "MATURE", "ADULT"];
const ACCESS_OPTIONS = ["ON_APPROVAL", "OPEN", "CLOSED"];
const LANGUAGE_OPTIONS = [
  "ENGLISH",
  "FRANCAIS",
  "ITALIANO",
  "ESPANOL",
  "DEUTSCH",
];

export default function StorySearch() {
  const [filters, setFilters] = useState({
    title: "",
    genreType: "",
    audienceType: "",
    languageType: "",
    accessType: "",
  });
  const [stories, setStories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);
  const DEBOUNCE_MS = 300;

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchStories(page);
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [filters, page]);

  ////////////////////////////////////////////////////////////////////////////////////////
  // FETCH STORY
  ////////////////////////////////////////////////////////////////////////////////////////

  const fetchStories = async (page) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    params.append("page", page);
    params.append("order[id]", "desc");

    try {
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch(
        `http://localhost:8000/api/stories?${params.toString()}`,
        { signal: controller.signal }
      );

      if (!res.ok) throw new Error("Erreur serveur");

      const data = await res.json();
      setStories(data.member || []);
      setPagination(data.view || {});
      setTotalPages(Math.ceil(data.totalItems / 12));
    } catch (e) {
      if (e.name !== "AbortError") {
        console.error(e);
      }
    }
  };

  return (
    <div>
      <h1>Search Stories</h1>

      {/* FORMULAIRE DE FILTRES */}
      <div>
        <h1>Filters</h1>
        <input
          type="text"
          placeholder="Title..."
          value={filters.title}
          onChange={(e) => setFilters({ ...filters, title: e.target.value })}
        />

        <select
          value={filters.genreType}
          onChange={(e) =>
            setFilters({ ...filters, genreType: e.target.value })
          }
        >
          <option value="">All genres</option>
          {GENRE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        <select
          value={filters.audienceType}
          onChange={(e) =>
            setFilters({ ...filters, audienceType: e.target.value })
          }
        >
          <option value="">All audiences</option>
          {AUDIENCE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        <select
          value={filters.languageType}
          onChange={(e) =>
            setFilters({ ...filters, languageType: e.target.value })
          }
        >
          <option value="">All languages</option>
          {LANGUAGE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>

        <select
          value={filters.accessType}
          onChange={(e) =>
            setFilters({ ...filters, accessType: e.target.value })
          }
        >
          <option value="">All accesses</option>
          {ACCESS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      {/* LISTE DES RÉSULTATS */}
      {stories && (
        <div className="">
          <h1>Stories</h1>
          {stories.map((story) => (
            <div className="">
              <div className="">
                {story.public === true && (
                  <h1 className="">PUBLIC {story.id}</h1>
                )}
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
      )}
      {page && (
        <div>
          {/* Bouton début */}
          {page > 1 && <button onClick={() => setPage(1)}>{"<<"}</button>}

          {/* Bouton précédent */}
          {pagination.previous && (
            <button onClick={() => setPage(page - 1)}>Previous</button>
          )}

          {/* Num de page */}
          <span>
            Page {page} / {totalPages}
          </span>

          {/* Bouton suivant */}
          {pagination.next && (
            <button onClick={() => setPage(page + 1)}>Next</button>
          )}

          {/* Bouton fin */}
          {page < totalPages && (
            <button onClick={() => setPage(totalPages)}>{">>"}</button>
          )}
        </div>
      )}
    </div>
  );
}
