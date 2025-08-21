import { useState, useEffect } from "react";
import { useParams } from "react-router";

const PlaceForm = ({
  initialValues,
  onSubmit,
  submitLabel = "Save",
  error,
}) => {
  const { storyId } = useParams();
  const [title, setTitle] = useState();
  const [description, setDescription] = useState();
  const [placeImgUrl, setPlaceImgUrl] = useState();
  const [placeFile, setPlaceFile] = useState(null);

  useEffect(() => {
    if (!initialValues) return;
    setTitle(initialValues.title ?? "");
    setDescription(initialValues.description ?? "");
    setPlaceImgUrl(initialValues.placeImgUrl ?? "");
  }, [initialValues]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let finalPlaceUrl = placeImgUrl;

    if (placeFile) {
      const fd = new FormData();
      const extension = placeFile.name?.split(".").pop() || "jpg";
      fd.append("file", placeFile, `place.${extension}`);
      fd.append("folder", "places");

      try {
        const uploadRes = await fetch("http://localhost:8000/api/images", {
          method: "POST",
          headers: { Accept: "application/ld+json" },
          body: fd,
        });

        if (!uploadRes.ok) throw new Error("Upload failed");
        const uploadData = await uploadRes.json();
        finalPlaceUrl = uploadData.url;
      } catch (err) {
        console.error(err);
        alert("Upload échoué");
        return;
      }
    }

    onSubmit({
      title,
      description,
      placeImageUrl: finalPlaceUrl,
      story: `/api/stories/${storyId}`,
    });
  };

  return (
    <form className="form__container" onSubmit={handleSubmit}>
      {error && <p className="">{error}</p>}

      <div className="input__container">
        <label htmlFor="title" className="input__label">
          Title
        </label>
        <input
          id="title"
          className=""
          type="text"
          value={title}
          placeholder="Your place title here"
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
          className=""
          value={description}
          placeholder="Describe your place here"
          onChange={(e) => setDescription(e.target.value)}
        />
        <span className="form__error"></span>
      </div>

      <div className="input__container">
        <label htmlFor="placeFile" className="input__label">
          Place picture
        </label>
        <input
          id="placeFile"
          className="input-file"
          type="file"
          accept="image/*"
          onChange={(e) => setPlaceFile(e.target.files[0] || null)}
        />
        <span className="form__error"></span>
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
};

export default PlaceForm;
