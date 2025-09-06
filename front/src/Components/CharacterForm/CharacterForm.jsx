import { useState, useEffect } from "react";
import { Upload, X, DiamondPlus } from "lucide-react";

const MAX_AVATAR_SIZE = 1000 * 1024; // 1Mo
const MAX_PORTRAIT_SIZE = 1000 * 1024; // 1Mo

// Regex
const reHtmlTag = /<[^>]*>/;

const CharacterForm = ({
  initialValues,
  onSubmit,
  submitLabel = "Save",
  error,
}) => {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [portraitUrl, setPortraitUrl] = useState("");
  const [portraitFile, setPortraitFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!initialValues) return;
    setName(initialValues.name ?? "");
    setTitle(initialValues.title ?? "");
    setBio(initialValues.bio ?? "");
    setPortraitUrl(initialValues.portraitUrl ?? "");
    setAvatarUrl(initialValues.avatarUrl ?? "");
  }, [initialValues]);

  const setFieldError = (field, messages) => {
    setFieldErrors((prev) => ({
      ...prev,
      [field]: Array.isArray(messages) ? messages : messages ? [messages] : [],
    }));
  };
  const clearFieldError = (field) => {
    setFieldErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  ////////////////////////////////////////////////////////////////////////////////////////
  // VALIDATION DES FIELDS
  ////////////////////////////////////////////////////////////////////////////////////////

  const validateName = (val) => {
    const errs = [];
    if (!val || !val.trim()) errs.push("Character name cannot be blank.");
    if (val && val.length < 3)
      errs.push("Character name must be at least 3 characters long.");
    if (val && val.length > 30)
      errs.push("Character name cannot be longer than 30 characters.");
    if (val && reHtmlTag.test(val))
      errs.push("HTML tags are not allowed in the name.");
    return errs;
  };

  const validateTitle = (val) => {
    const errs = [];
    if (!val || !val.trim()) errs.push("Title cannot be blank.");
    if (val && val.length < 3)
      errs.push("Title must be at least 3 characters long.");
    if (val && val.length > 40)
      errs.push("Title cannot be longer than 40 characters.");
    if (val && reHtmlTag.test(val))
      errs.push("HTML tags are not allowed in the title.");
    return errs;
  };

  const validateBio = (val) => {
    const errs = [];
    if (val && val.length > 2000)
      errs.push("Biography cannot be longer than 2000 characters.");
    if (val && reHtmlTag.test(val))
      errs.push("HTML tags are not allowed in the bio.");
    return errs;
  };

  const validatePortrait = (file, url) => {
    const errs = [];
    if (!file && !url) errs.push("Portrait is required.");
    if (file && file.size > MAX_PORTRAIT_SIZE)
      errs.push("The character portrait can't exceed 1Mo.");
    return errs;
  };

  const validateAvatar = (file, url) => {
    const errs = [];
    if (!file && !url) errs.push("Avatar is required.");
    if (file && file.size > MAX_AVATAR_SIZE)
      errs.push("The character avatar can't exceed 1Mo.");
    return errs;
  };

  const validateAll = () => {
    const newErrors = {};
    const n = validateName(name);
    if (n.length) newErrors.name = n;
    const t = validateTitle(title);
    if (t.length) newErrors.title = t;
    const b = validateBio(bio);
    if (b.length) newErrors.bio = b;
    const p = validatePortrait(portraitFile, portraitUrl);
    if (p.length) newErrors.portraitFile = p;
    const a = validateAvatar(avatarFile, avatarUrl);
    if (a.length) newErrors.avatarFile = a;
    return newErrors;
  };

  ////////////////////////////////////////////////////////////////////////////////////////
  // HANDLERS ONCHANGE DES FIELDS
  ////////////////////////////////////////////////////////////////////////////////////////

  const onNameChange = (e) => {
    const v = e.target.value;
    setName(v);
    const errs = validateName(v);
    errs.length ? setFieldError("name", errs) : clearFieldError("name");
  };

  const onTitleChange = (e) => {
    const v = e.target.value;
    setTitle(v);
    const errs = validateTitle(v);
    errs.length ? setFieldError("title", errs) : clearFieldError("title");
  };

  const onBioChange = (e) => {
    const v = e.target.value;
    setBio(v);
    const errs = validateBio(v);
    errs.length ? setFieldError("bio", errs) : clearFieldError("bio");
  };

  const onPortraitChange = (e) => {
    const file = e.target.files?.[0] || null;
    setPortraitFile(file);
    const errs = validatePortrait(file);
    errs.length
      ? setFieldError("portraitFile", errs)
      : clearFieldError("portraitFile");
  };

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
    const errs = validateAvatar(file);
    errs.length
      ? setFieldError("avatarFile", errs)
      : clearFieldError("avatarFile");
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

    let finalPortraitUrl = portraitUrl;
    let finalAvatarUrl = avatarUrl;

    if (portraitFile) {
      const fd = new FormData();
      const extension = portraitFile.name?.split(".").pop() || "jpg";
      fd.append("file", portraitFile, `portrait.${extension}`);
      fd.append("folder", "portraits");

      try {
        const uploadRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/images`,
          {
            method: "POST",
            headers: { Accept: "application/ld+json" },
            body: fd,
          }
        );

        if (!uploadRes.ok) throw new Error("Upload failed");
        const uploadData = await uploadRes.json();
        finalPortraitUrl = uploadData.url;
      } catch (err) {
        setFieldError("portraitFile", "Please upload a valid image file.");
        return;
      }
    }

    if (avatarFile) {
      const fd = new FormData();
      const extension = avatarFile.name?.split(".").pop() || "jpg";
      fd.append("file", avatarFile, `avatar.${extension}`);
      fd.append("folder", "avatars");

      try {
        const uploadRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/images`,
          {
            method: "POST",
            headers: { Accept: "application/ld+json" },
            body: fd,
          }
        );

        if (!uploadRes.ok) throw new Error("Upload failed");
        const uploadData = await uploadRes.json();
        finalAvatarUrl = uploadData.url;
      } catch (err) {
        setFieldError("avatarFile", "Please upload a valid image file.");
        return;
      }
    }

    onSubmit?.({
      name,
      title,
      bio,
      portraitUrl: finalPortraitUrl,
      avatarUrl: finalAvatarUrl,
    });
  };

  const firstErr = (field) => fieldErrors[field]?.[0] || "";

  ////////////////////////////////////////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////////////////////////////////////////

  return (
    <form onSubmit={handleSubmit} className="form__container">
      {error && <div className="form__header-error">{error}</div>}

      <div className="input__container">
        <label htmlFor="name" className="input__label">
          Name <span className="asterisk">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          placeholder="Your character name here"
          onChange={onNameChange}
          required
        />
        <span className="form__error">{firstErr("name")}</span>
      </div>

      <div className="input__container">
        <label htmlFor="title" className="input__label">
          Title <span className="asterisk">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          placeholder="Your character title here"
          onChange={onTitleChange}
          required
        />
        <span className="form__error">{firstErr("title")}</span>
      </div>

      <div className="input__container">
        <label htmlFor="bio" className="input__label">
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          placeholder="Describe your character here"
          onChange={onBioChange}
        />
        <span className="form__error">{firstErr("bio")}</span>
      </div>

      <div className="input__container">
        <label htmlFor="portraitFile" className="input__label">
          Character portrait <span className="asterisk">*</span>
        </label>
        <input
          id="portraitFile"
          className="input-file"
          type="file"
          accept=".jpg, .jpeg, .png, .bmp"
          onChange={onPortraitChange}
        />

        {/* input upload custom + preview */}
        <label htmlFor="portraitFile" className="file-upload__trigger">
          {portraitFile || portraitUrl ? (
            <div className="file-upload__preview-wrapper">
              <img
                className="file-upload__preview-img"
                src={
                  portraitFile
                    ? URL.createObjectURL(portraitFile)
                    : `${import.meta.env.VITE_API_URL}/${portraitUrl}`
                }
                alt="Portrait preview"
              />
              <button
                type="button"
                className="file-upload__remove"
                onClick={(e) => {
                  e.preventDefault();
                  setPortraitFile(null);
                  setPortraitUrl("");
                }}
              >
                <X className="file-upload__remove-icon" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="file-upload__icon" />
              <span className="file-upload__text">
                Click here to upload a file
              </span>
            </>
          )}
        </label>

        <span className="form__error">{firstErr("portraitFile")}</span>
      </div>

      <div className="input__container">
        <label htmlFor="characterAvatarFile" className="input__label">
          Character avatar <span className="asterisk">*</span>
        </label>
        <input
          id="characterAvatarFile"
          className="input-file"
          type="file"
          accept=".jpg, .jpeg, .png, .bmp"
          onChange={onAvatarChange}
        />

        {/* input upload custom + preview */}
        <label htmlFor="characterAvatarFile" className="file-upload__trigger">
          {avatarFile || avatarUrl ? (
            <div className="file-upload__preview-wrapper">
              <img
                className="file-upload__preview-img"
                src={
                  avatarFile
                    ? URL.createObjectURL(avatarFile)
                    : `${import.meta.env.VITE_API_URL}/${avatarUrl}`
                }
                alt="Avatar preview"
              />
              <button
                type="button"
                className="file-upload__remove"
                onClick={(e) => {
                  e.preventDefault();
                  setAvatarFile(null);
                  setAvatarUrl("");
                }}
              >
                <X className="file-upload__remove-icon" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="file-upload__icon" />
              <span className="file-upload__text">
                Click here to upload a file
              </span>
            </>
          )}
        </label>

        <span className="form__error">{firstErr("avatarFile")}</span>
      </div>

      <button type="submit" className="btn invert-btn submit-btn">
        <DiamondPlus className="btn__icon invert-btn__icon" />
        <span className="btn__text">{submitLabel}</span>
      </button>

      <span className="form__text">
        All fields marked with (<span className="asterisk">*</span>) are
        mandatory.
      </span>
    </form>
  );
};

export default CharacterForm;
