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

// Regex
const reHtmlTag = /<[^>]*>/;
const reNonSpace = /\S/;

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

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!initialValues) return;
    setTitle(initialValues.title ?? "");
    setDescription(initialValues.description ?? "");
    setBannerImgUrl(
      initialValues.bannerImgUrl ?? initialValues.bannerImageUrl ?? ""
    );
    setIsPublic(Boolean(initialValues.isPublic));
    setGenreType(initialValues.genreType ?? GENRE_OPTIONS[0]);
    setAudienceType(initialValues.audienceType ?? AUDIENCE_OPTIONS[0]);
    setAccessType(initialValues.accessType ?? ACCESS_OPTIONS[0]);
    setLanguageType(initialValues.languageType ?? LANGUAGE_OPTIONS[0]);
  }, [initialValues]);

  const setFieldError = (field, messages) => {
    setFieldErrors((prev) => ({
      ...prev,
      [field]: Array.isArray(messages) ? messages : messages ? [messages] : [],
    }));
  };
  const clearFieldError = (field) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  ////////////////////////////////////////////////////////////////////////////////////////
  // VALIDATION DES FIELDS
  ////////////////////////////////////////////////////////////////////////////////////////

  const validateTitle = (val) => {
    const errs = [];
    if (!val || !val.trim()) errs.push("This value should not be blank.");
    if (val && val.length < 3)
      errs.push("The title must be at least 3 characters long.");
    if (val && val.length > 50)
      errs.push("The title cannot be longer than 50 characters.");
    if (val && reHtmlTag.test(val))
      errs.push("HTML tags are not allowed in the title.");
    return errs;
  };

  const validateDescription = (val) => {
    const errs = [];
    if (val === "" || !reNonSpace.test(val)) {
      errs.push("The description cannot be empty or contain only spaces.");
    }
    if (val && val.length > 1000)
      errs.push("The description cannot be longer than 1000 characters.");
    if (val && reHtmlTag.test(val))
      errs.push("HTML tags are not allowed in the description.");
    return errs;
  };

  const validateEnum = (val, allowed) => {
    const errs = [];
    if (!allowed.includes(val)) errs.push("This value is not valid.");
    return errs;
  };

  const validateAll = () => {
    const next = {};
    const t = validateTitle(title);
    if (t.length) next.title = t;
    const d = validateDescription(description);
    if (d.length) next.description = d;
    const g = validateEnum(genreType, GENRE_OPTIONS);
    if (g.length) next.genreType = g;
    const a = validateEnum(audienceType, AUDIENCE_OPTIONS);
    if (a.length) next.audienceType = a;
    const ac = validateEnum(accessType, ACCESS_OPTIONS);
    if (ac.length) next.accessType = ac;
    const l = validateEnum(languageType, LANGUAGE_OPTIONS);
    if (l.length) next.languageType = l;
    return next;
  };

  ////////////////////////////////////////////////////////////////////////////////////////
  // HANDLERS ONCHANGE DES FIELDS
  ////////////////////////////////////////////////////////////////////////////////////////

  const onTitleChange = (e) => {
    const v = e.target.value;
    setTitle(v);
    const errs = validateTitle(v);
    errs.length ? setFieldError("title", errs) : clearFieldError("title");
  };

  const onDescriptionChange = (e) => {
    const v = e.target.value;
    setDescription(v);
    const errs = validateDescription(v);
    errs.length
      ? setFieldError("description", errs)
      : clearFieldError("description");
  };

  const onBannerFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setBannerFile(file);
  };

  const onGenreChange = (e) => {
    const v = e.target.value;
    setGenreType(v);
    const errs = validateEnum(v, GENRE_OPTIONS);
    errs.length
      ? setFieldError("genreType", errs)
      : clearFieldError("genreType");
  };

  const onAudienceChange = (e) => {
    const v = e.target.value;
    setAudienceType(v);
    const errs = validateEnum(v, AUDIENCE_OPTIONS);
    errs.length
      ? setFieldError("audienceType", errs)
      : clearFieldError("audienceType");
  };

  const onAccessChange = (e) => {
    const v = e.target.value;
    setAccessType(v);
    const errs = validateEnum(v, ACCESS_OPTIONS);
    errs.length
      ? setFieldError("accessType", errs)
      : clearFieldError("accessType");
  };

  const onLanguageChange = (e) => {
    const v = e.target.value;
    setLanguageType(v);
    const errs = validateEnum(v, LANGUAGE_OPTIONS);
    errs.length
      ? setFieldError("languageType", errs)
      : clearFieldError("languageType");
  };

  ////////////////////////////////////////////////////////////////////////////////////////
  // HANDLESUBMIT
  ////////////////////////////////////////////////////////////////////////////////////////

  const handleSubmit = async (e) => {
    e.preventDefault();
    const all = validateAll();
    if (Object.keys(all).length > 0) {
      setFieldErrors(all);
      return;
    }

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
        setFieldError("bannerFile", "Upload échoué.");
        return;
      }
    }

    onSubmit?.({
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

  const firstErr = (field) => fieldErrors[field]?.[0] || "";

  ////////////////////////////////////////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////////////////////////////////////////

  return (
    <form className="form__container" onSubmit={handleSubmit}>
      {error && <p>{error}</p>}

      <div className="input__container">
        <label htmlFor="title" className="input__label">
          Title <span className="asterisk">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          placeholder="Your story title here"
          onChange={onTitleChange}
          required
        />
        <span className="form__error">{firstErr("title")}</span>
      </div>

      <div className="input__container">
        <label htmlFor="description" className="input__label">
          Description <span className="asterisk">*</span>
        </label>
        <textarea
          id="description"
          value={description}
          placeholder="Describe your story here"
          onChange={onDescriptionChange}
          required
        />
        <span className="form__error">{firstErr("description")}</span>
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
          onChange={onBannerFileChange}
        />
        <span className="form__error">{firstErr("bannerFile")}</span>
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
            onChange={onGenreChange}
            required
          >
            {GENRE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown className="select__icon" />
          <span className="form__error">{firstErr("genreType")}</span>
        </div>

        <div className="select__container form-row__item">
          <label htmlFor="audienceType" className="input__label">
            Audience <span className="asterisk">*</span>
          </label>
          <select
            id="audienceType"
            value={audienceType}
            onChange={onAudienceChange}
            required
          >
            {AUDIENCE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown className="select__icon" />
          <span className="form__error">{firstErr("audienceType")}</span>
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
            onChange={onAccessChange}
            required
          >
            {ACCESS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown className="select__icon" />
          <span className="form__error">{firstErr("accessType")}</span>
        </div>

        <div className="select__container form-row__item">
          <label htmlFor="languageType" className="input__label">
            Language <span className="asterisk">*</span>
          </label>
          <select
            id="languageType"
            value={languageType}
            onChange={onLanguageChange}
            required
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
          <ChevronDown className="select__icon" />
          <span className="form__error">{firstErr("languageType")}</span>
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
