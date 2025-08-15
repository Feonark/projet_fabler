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

      <div>
        <label htmlFor="placeFile">Upload place image</label>
        <input
          id="placeFile"
          type="file"
          accept="image/*"
          onChange={(e) => setPlaceFile(e.target.files[0] || null)}
        />
      </div>

      <button type="submit" className="">
        {submitLabel}
      </button>
    </form>
  );
};

export default PlaceForm;
