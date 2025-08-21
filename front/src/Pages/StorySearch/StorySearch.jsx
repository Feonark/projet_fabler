import { useEffect, useState, useRef } from "react";
import { Link } from "react-router";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronLast,
  ChevronFirst,
  Search,
} from "lucide-react";
import StoryCard from "../../Components/StoryCard/StoryCard";
import "./StorySearch.css";

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

  ////////////////////////////////////////////////////////////////////////////////////////
  // OTHER
  ////////////////////////////////////////////////////////////////////////////////////////

  const formatEnumLabel = (value) => {
    return value
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  ////////////////////////////////////////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////////////////////////////////////////

  return (
    <div className="page__container">
      <div className="page__title-header">
        <h1 className="title">Search a story</h1>
      </div>

      <main className="search__main">
        {/* FORMULAIRE DE FILTRES */}
        <div className="search__container">
          <input
            className="search__input"
            type="text"
            placeholder="Type to search a story"
            value={filters.title}
            onChange={(e) => setFilters({ ...filters, title: e.target.value })}
          />
          <Search className="search__icon" />
        </div>

        <div className="search__content">
          <div className="search__filters">
            <h2 className="subtitle page__header">Filters</h2>

            <div className="select__container">
              <label className="input__label" htmlFor="genre">
                Genre
              </label>
              <select
                id="genre"
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
              <ChevronDown className="select__icon" />
            </div>

            <div className="select__container">
              <label className="input__label" htmlFor="audience">
                Audience
              </label>
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
              <ChevronDown className="select__icon" />
            </div>

            <div className="select__container">
              <label className="input__label" htmlFor="language">
                Language
              </label>
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
              <ChevronDown className="select__icon" />
            </div>

            <div className="select__container">
              <label className="input__label" htmlFor="access">
                Access
              </label>
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
              <ChevronDown className="select__icon" />
            </div>
          </div>

          {/* LISTE DES RÉSULTATS */}
          {stories && (
            <div className="search__results">
              <div className="page__header">
                <h1 className="subtitle">Stories</h1>
                <span className="count-chip">
                  <span className="count-chip__count">
                    {stories.length} results
                  </span>
                </span>
              </div>

              <div className="search-cards__container">
                {stories.map((story) => (
                  <StoryCard story={story} formatEnumLabel={formatEnumLabel} />
                ))}
              </div>
            </div>
          )}
        </div>

        {page && (
          <div className="pagination__container">
            {/* Bouton début */}
            <button
              className="btn btn-sm"
              onClick={() => setPage(1)}
              disabled={page === 1}
            >
              <ChevronFirst className="btn__icon btn-sm__icon" />
            </button>

            {/* Bouton précédent */}
            <button
              className="btn btn-sm"
              onClick={() => setPage(page - 1)}
              disabled={!pagination.previous}
            >
              <ChevronLeft className="btn__icon btn-sm__icon" />
            </button>

            {/* Num de page */}
            <span className="count-chip">
              <span className="count-chip__count">Page {page}</span>
              <span className="count-chip__count count-chip__maxCount">
                / {totalPages}
              </span>
            </span>

            {/* Bouton suivant */}
            <button
              className="btn btn-sm"
              onClick={() => setPage(page + 1)}
              disabled={!pagination.next}
            >
              <ChevronRight className="btn__icon btn-sm__icon" />
            </button>

            {/* Bouton fin */}
            <button
              className="btn btn-sm"
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
            >
              <ChevronLast className="btn__icon btn-sm__icon" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
