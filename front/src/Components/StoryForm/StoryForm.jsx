import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

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
    <form className="form__container" onSubmit={handleSubmit}>
      {error && <p className="">{error}</p>}

      <div className="input__container">
        <label htmlFor="title" className="input__label">
          Title <span className="asterisk">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          placeholder="Your story title here"
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <span className="form__error"></span>
      </div>

      <div className="input__container">
        <label htmlFor="description" className="input__label">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          placeholder="Describe your story here"
          onChange={(e) => setDescription(e.target.value)}
        />
        <span className="form__error"></span>
      </div>

      <div className="input__container">
        <label htmlFor="bannerFile" className="input__label">
          Banner picture
        </label>
        <input
          id="bannerFile"
          className="input-file"
          type="file"
          accept="image/*"
          onChange={(e) => setBannerFile(e.target.files[0] || null)}
        />
        <span className="form__error"></span>
      </div>

      <div>
        <input
          id="isPublic"
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
        />
        <label htmlFor="isPublic" className="input__label">
          Public <span className="asterisk">*</span>
        </label>
      </div>

      <div className="form__row">
        <div className="select__container form-row__item">
          <label htmlFor="genreType" className="input__label">
            Genre <span className="asterisk">*</span>
          </label>
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
          <ChevronDown className="select__icon" />
        </div>

        <div className="select__container form-row__item">
          <label htmlFor="audienceType" className="input__label">
            Audience <span className="asterisk">*</span>
          </label>
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
          <ChevronDown className="select__icon" />
        </div>
      </div>

      <div className="form__row">
        <div className="select__container form-row__item">
          <label htmlFor="accessType" className="input__label">
            Access <span className="asterisk">*</span>
          </label>
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
          <ChevronDown className="select__icon" />
        </div>

        <div className="select__container form-row__item">
          <label htmlFor="languageType" className="input__label">
            Language <span className="asterisk">*</span>
          </label>
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
          <ChevronDown className="select__icon" />
        </div>
      </div>

      <button type="submit" className="btn invert-btn submit-btn">
        {submitLabel}
      </button>

      <span className="form__text">
        All fields marked with (<span className="asterisk">*</span>) are
        mandatory.
      </span>
    </form>
  );
}
