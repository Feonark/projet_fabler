import { useState, useEffect } from "react";
import { useParams } from "react-router";

const CharacterForm = ({
  initialValues,
  onSubmit,
  submitLabel = "Save",
  error,
}) => {
  const [name, setName] = useState();
  const [title, setTitle] = useState();
  const [bio, setBio] = useState();
  const [portraitUrl, setPortraitUrl] = useState();
  const [avatarUrl, setAvatarUrl] = useState();

  useEffect(() => {
    if (!initialValues) return;
    setName(initialValues.name ?? "");
    setTitle(initialValues.title ?? "");
    setBio(initialValues.bio ?? "");
    setPortraitUrl(initialValues.portraitUrl ?? "");
    setAvatarUrl(initialValues.avatarUrl ?? "");
  }, [initialValues]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name,
      title,
      bio,
      portraitUrl,
      avatarUrl,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Character</h2>
      {error && <p className="">{error}</p>}

      <div className="">
        <label htmlFor="name" className="">
          Name*
        </label>
        <input
          id="name"
          className=""
          type="text"
          value={name}
          placeholder="Your character name here"
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="">
        <label htmlFor="title" className="">
          Title
        </label>
        <input
          id="title"
          className=""
          type="text"
          value={title}
          placeholder="Your character title here"
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="">
        <label htmlFor="bio" className="">
          Bio
        </label>
        <textarea
          id="bio"
          className=""
          value={bio}
          placeholder="Describe your character here"
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      <div className="">
        <label htmlFor="portraitUrl" className="">
          Place portrait URL
        </label>
        <input
          id="portraitUrl"
          className=""
          type="text"
          value={portraitUrl}
          placeholder="https://..."
          onChange={(e) => setPortraitUrl(e.target.value)}
        />
      </div>

      <div className="">
        <label htmlFor="avatarUrl" className="">
          Place avatar URL
        </label>
        <input
          id="avatarUrl"
          className=""
          type="text"
          value={avatarUrl}
          placeholder="https://..."
          onChange={(e) => setAvatarUrl(e.target.value)}
        />
      </div>

      <button type="submit" className="">
        {submitLabel}
      </button>
    </form>
  );
};

export default CharacterForm;
