import { useState, useEffect } from "react";

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

export default function StoryForm({
  initialValues,
  onSubmit,
  submitLabel = "Save",
  error,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bannerImgUrl, setBannerImgUrl] = useState("");
  const [bannerFile, setBannerFile] = useState(null);
  const [isPublic, setIsPublic] = useState(false);
  const [genreType, setGenreType] = useState(GENRE_OPTIONS[0]);
  const [audienceType, setAudienceType] = useState(AUDIENCE_OPTIONS[0]);
  const [accessType, setAccessType] = useState(ACCESS_OPTIONS[0]);
  const [languageType, setLanguageType] = useState(LANGUAGE_OPTIONS[0]);

  useEffect(() => {
    if (!initialValues) return;
    setTitle(initialValues.title ?? "");
    setDescription(initialValues.description ?? "");
    setBannerImgUrl(initialValues.bannerImgUrl ?? "");
    setIsPublic(Boolean(initialValues.isPublic));
    setGenreType(initialValues.genreType ?? GENRE_OPTIONS[0]);
    setAudienceType(initialValues.audienceType ?? AUDIENCE_OPTIONS[0]);
    setAccessType(initialValues.accessType ?? ACCESS_OPTIONS[0]);
    setLanguageType(initialValues.languageType ?? LANGUAGE_OPTIONS[0]);
  }, [initialValues]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let finalBannerUrl = bannerImgUrl;

    if (bannerFile) {
      const fd = new FormData();
      const extension = bannerFile.name?.split(".").pop() || "jpg";
      fd.append("file", bannerFile, `banner.${extension}`);
      fd.append("folder", "banners");

      try {
        const uploadRes = await fetch("http://localhost:8000/api/images", {
          method: "POST",
          headers: { Accept: "application/ld+json" },
          body: fd,
        });

        if (!uploadRes.ok) throw new Error("Upload failed");
        const uploadData = await uploadRes.json();
        finalBannerUrl = uploadData.url;
      } catch (err) {
        console.error(err);
        alert("Upload échoué");
        return;
      }
    }

    onSubmit({
      title,
      description,
      bannerImageUrl: finalBannerUrl,
      isPublic,
      genreType,
      audienceType,
      accessType,
      languageType,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Story</h2>
      {error && <p className="">{error}</p>}

      <div>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          placeholder="Your story title here"
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={description}
          placeholder="Describe your story here"
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="bannerFile">Upload Banner</label>
        <input
          id="bannerFile"
          type="file"
          accept="image/*"
          onChange={(e) => setBannerFile(e.target.files[0] || null)}
        />
      </div>

      <div>
        <label htmlFor="isPublic">IsPublic</label>
        <input
          id="isPublic"
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
      </div>

      <div>
        <label htmlFor="genreType">GenreType</label>
        <select
          id="genreType"
          value={genreType}
          onChange={(e) => setGenreType(e.target.value)}
          required
        >
          {GENRE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="audienceType">AudienceType</label>
        <select
          id="audienceType"
          value={audienceType}
          onChange={(e) => setAudienceType(e.target.value)}
          required
        >
          {AUDIENCE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="accessType">AccessType</label>
        <select
          id="accessType"
          value={accessType}
          onChange={(e) => setAccessType(e.target.value)}
          required
        >
          {ACCESS_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="languageType">LanguageType</label>
        <select
          id="languageType"
          value={languageType}
          onChange={(e) => setLanguageType(e.target.value)}
          required
        >
          {LANGUAGE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <button type="submit">{submitLabel}</button>
    </form>
  );
}
