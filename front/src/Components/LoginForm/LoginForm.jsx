import { useState } from "react";
import { useAuth } from "../../Contexts/AuthContext";
import { useNavigate, Link } from "react-router";
import { SquarePlus, X } from "lucide-react";
import "./LoginForm.css";

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials.");
      }

      const data = await response.json();
      login({
        token: data.token,
        refresh_token: data.refresh_token,
      });
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <form className="form__container" onSubmit={handleSubmit}>
        {error && <div className="form__header-error">{error}</div>}

        <div className="input__container">
          <label className="input__label">Username</label>
          <input
            type="username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="input__container">
          <label className="input__label">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button className="btn invert-btn submit-btn" type="submit">
          Log in
        </button>

        <span className="form__text">
          You don't have an account?{" "}
          <Link className="register__link" to="/register">
            Register now
          </Link>
        </span>
      </form>
    </>
  );
};

export default LoginForm;
