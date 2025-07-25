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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          avatarUrl,
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
    <form onSubmit={handleSubmit}>
      <p>RegisterForm</p>

      {error && <p>{error}</p>}
      {success && <p>Inscription réussie !</p>}

      <label>
        Username:
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </label>

      <label>
        Email:
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      <label>
        Password:
        <input
          type="password"
          value={plainPassword}
          onChange={(e) => setPlainPassword(e.target.value)}
          required
        />
      </label>

      <label>
        Birthdate:
        <input
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
        />
      </label>

      <label>
        Description:
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <label>
        Avatar URL:
        <input
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
        />
      </label>

      <button type="submit">Register</button>
    </form>
  );
};

export default RegisterForm;
