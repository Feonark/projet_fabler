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

  useEffect(() => {
    if (!initialValues) return;
    setTitle(initialValues.title ?? "");
    setDescription(initialValues.description ?? "");
    setPlaceImgUrl(initialValues.placeImgUrl ?? "");
  }, [initialValues]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      placeImgUrl,
      story: `/api/stories/${storyId}`,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Place</h2>
      {error && <p className="">{error}</p>}

      <div className="">
        <label htmlFor="title" className="">
          Title*
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
      </div>

      <div className="">
        <label htmlFor="description" className="">
          Description*
        </label>
        <textarea
          id="description"
          className=""
          value={description}
          placeholder="Describe your place here"
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="">
        <label htmlFor="placeImgUrl" className="">
          Place image URL
        </label>
        <input
          id="placeImgUrl"
          className=""
          type="text"
          value={placeImgUrl}
          placeholder="https://..."
          onChange={(e) => setPlaceImgUrl(e.target.value)}
        />
      </div>

      <button type="submit" className="">
        {submitLabel}
      </button>
    </form>
  );
};

export default PlaceForm;
