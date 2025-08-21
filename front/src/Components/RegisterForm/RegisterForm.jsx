import { useState } from "react";
import { useNavigate } from "react-router";

const RegisterForm = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [plainPassword, setPlainPassword] = useState("");
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    let finalAvatarUrl = avatarUrl;

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

    setError("");
    setSuccess(false);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/ld+json",
          Accept: "application/ld+json",
        },
        body: JSON.stringify({
          username,
          plainPassword,
          email,
          birthdate: birthdate === "" ? null : birthdate,
          description,
          avatarUrl: finalAvatarUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData["hydra:description"] ??
            JSON.stringify(errorData.violations) ??
            "Erreur lors de l'inscription"
        );
      }

      setSuccess(true);
      const data = await response.json();
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="form__container" onSubmit={handleSubmit}>
      {error && <p>{error}</p>}
      {success && <p>Inscription réussie !</p>}

      <div className="input__container">
        <label className="input__label">
          Username <span className="asterisk">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. GlassHollow95"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <span className="form__error"></span>
      </div>

      <div className="input__container">
        <label className="input__label">
          Email <span className="asterisk">*</span>
        </label>
        <input
          type="email"
          placeholder="e.g. glasshollow@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <span className="form__error"></span>
      </div>

      <div className="input__container">
        <label className="input__label">
          Password <span className="asterisk">*</span>
        </label>
        <input
          type="password"
          placeholder="••••••••••"
          value={plainPassword}
          onChange={(e) => setPlainPassword(e.target.value)}
          required
        />
        <span className="form__error"></span>
      </div>

      <div className="form__row">
        <div className="input__container form-row__item">
          <label className="input__label">Birthdate</label>
          <input
            type="date"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
          />
          <span className="form__error"></span>
        </div>

        <div className="input__container form-row__item">
          <label htmlFor="avatarFile" className="input__label">
            Profile picture
          </label>
          <input
            id="avatarFile"
            type="file"
            className="input-file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files[0] || null)}
          />
        </div>
        <span className="form__error"></span>
      </div>

      <div className="input__container">
        <label className="input__label">Description</label>
        <textarea
          value={description}
          placeholder="e.g. I am here to roleplay!"
          onChange={(e) => setDescription(e.target.value)}
        />
        <span className="form__error"></span>
      </div>

      <button className="btn invert-btn submit-btn" type="submit">
        Register
      </button>

      <span className="form__text">
        All fields marked with (<span className="asterisk">*</span>) are
        mandatory.
      </span>
    </form>
  );
};

export default RegisterForm;
