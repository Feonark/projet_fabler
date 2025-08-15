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
  const [portraitFile, setPortraitFile] = useState();
  const [avatarUrl, setAvatarUrl] = useState();
  const [avatarFile, setAvatarFile] = useState();

  useEffect(() => {
    if (!initialValues) return;
    setName(initialValues.name ?? "");
    setTitle(initialValues.title ?? "");
    setBio(initialValues.bio ?? "");
    setPortraitUrl(initialValues.portraitUrl ?? "");
    setAvatarUrl(initialValues.avatarUrl ?? "");
  }, [initialValues]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let finalPortraitUrl = portraitUrl;
    let finalAvatarUrl = avatarUrl;

    // POST du portrait
    if (portraitFile) {
      const fd = new FormData();
      const extension = portraitFile.name?.split(".").pop() || "jpg";
      fd.append("file", portraitFile, `portrait.${extension}`);
      fd.append("folder", "portraits");

      try {
        const uploadRes = await fetch("http://localhost:8000/api/images", {
          method: "POST",
          headers: { Accept: "application/ld+json" },
          body: fd,
        });

        if (!uploadRes.ok) throw new Error("Upload failed");
        const uploadData = await uploadRes.json();
        finalPortraitUrl = uploadData.url;
      } catch (err) {
        console.error(err);
        alert("Upload échoué");
        return;
      }
    }

    // POST de l'avatar
    if (avatarFile) {
      const fd = new FormData();
      const extension = avatarFile.name?.split(".").pop() || "jpg";
      fd.append("file", avatarFile, `avatar.${extension}`);
      fd.append("folder", "avatars");

      try {
        const uploadRes = await fetch("http://localhost:8000/api/images", {
          method: "POST",
          headers: { Accept: "application/ld+json" },
          body: fd,
        });

        if (!uploadRes.ok) throw new Error("Upload failed");
        const uploadData = await uploadRes.json();
        finalAvatarUrl = uploadData.url;
      } catch (err) {
        console.error(err);
        alert("Upload échoué");
        return;
      }
    }

    onSubmit({
      name,
      title,
      bio,
      portraitUrl: finalPortraitUrl,
      avatarUrl: finalAvatarUrl,
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

      <div>
        <label htmlFor="portraitFile">Upload portrait</label>
        <input
          id="portraitFile"
          type="file"
          accept="image/*"
          onChange={(e) => setPortraitFile(e.target.files[0] || null)}
        />
      </div>

      <div>
        <label htmlFor="charaAvatarFile">Upload Banner</label>
        <input
          id="charaAvatarFile"
          type="file"
          accept="image/*"
          onChange={(e) => setAvatarFile(e.target.files[0] || null)}
        />
      </div>

      <button type="submit" className="">
        {submitLabel}
      </button>
    </form>
  );
};

export default CharacterForm;
