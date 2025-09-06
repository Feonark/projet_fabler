import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { Upload, X, DiamondPlus } from "lucide-react";

const MAX_BANNER_SIZE = 1000 * 1024; // 1Mo

// Regex
const reHtmlTag = /<[^>]*>/;

const PlaceForm = ({
  initialValues,
  onSubmit,
  submitLabel = "Save",
  error,
}) => {
  const { storyId } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [placeImgUrl, setPlaceImgUrl] = useState("");
  const [placeFile, setPlaceFile] = useState(null);

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!initialValues) return;
    setTitle(initialValues.title ?? "");
    setDescription(initialValues.description ?? "");
    setPlaceImgUrl(
      initialValues.placeImgUrl ?? initialValues.placeImageUrl ?? ""
    );
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
    if (!val || !val.trim()) errs.push("Description cannot be blank.");
    if (val && val.length > 200)
      errs.push("Description cannot be longer than 200 characters.");
    if (val && reHtmlTag.test(val))
      errs.push("HTML tags are not allowed in the description.");
    return errs;
  };

  const validateBanner = (file) => {
    const errs = [];
    if (file && file.size > MAX_BANNER_SIZE)
      errs.push("The place picture can't exceed 1Mo.");
    return errs;
  };

  const validateAll = () => {
    const next = {};
    const t = validateTitle(title);
    if (t.length) next.title = t;
    const d = validateDescription(description);
    if (d.length) next.description = d;
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

  const onPlaceFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setPlaceFile(file);
    const errs = validateBanner(file);
    errs.length
      ? setFieldError("placeFile", errs)
      : clearFieldError("placeFile");
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

    let finalPlaceUrl = placeImgUrl;

    if (placeFile) {
      const fd = new FormData();
      const extension = placeFile.name?.split(".").pop() || "jpg";
      fd.append("file", placeFile, `place.${extension}`);
      fd.append("folder", "places");

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
        finalPlaceUrl = uploadData.url;
      } catch (err) {
        setFieldError("placeFile", "Please upload a valid image file.");
        return;
      }
    }

    onSubmit?.({
      title,
      description,
      placeImageUrl: finalPlaceUrl,
      story: `/api/stories/${storyId}`,
    });
  };

  const firstErr = (field) => fieldErrors[field]?.[0] || "";

  ////////////////////////////////////////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////////////////////////////////////////

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
          placeholder="Your place title here"
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
          placeholder="Describe your place here"
          onChange={onDescriptionChange}
          required
        />
        <span className="form__error">{firstErr("description")}</span>
      </div>

      <div className="input__container">
        <label htmlFor="placeFile" className="input__label">
          Place picture
        </label>

        <input
          id="placeFile"
          className="input-file"
          type="file"
          accept=".jpg, .jpeg, .png, .bmp"
          onChange={onPlaceFileChange}
        />

        {/* input upload custom + preview */}
        <label htmlFor="placeFile" className="file-upload__trigger">
          {placeFile || placeImgUrl ? (
            <div className="file-upload__preview-wrapper">
              <img
                className="file-upload__preview-img"
                src={
                  placeFile
                    ? URL.createObjectURL(placeFile)
                    : `${import.meta.env.VITE_API_URL}/${placeImgUrl}`
                }
                alt="Place preview"
              />
              <button
                type="button"
                className="file-upload__remove"
                onClick={(e) => {
                  e.preventDefault();
                  setPlaceFile(null);
                  setPlaceImgUrl("");
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

        <span className="form__error">{firstErr("placeFile")}</span>
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

export default PlaceForm;
