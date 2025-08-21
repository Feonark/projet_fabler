import { useState } from "react";
import CharacterForm from "../../Components/CharacterForm/CharacterForm";
import { useAuth } from "../../Contexts/AuthContext";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

const NewCharacter = () => {
  const { token, getUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState();

  const handleCreate = async (payload) => {
    setError("");

    try {
      const res = await fetch("http://localhost:8000/api/characters", {
        method: "POST",
        headers: {
          "Content-Type": "application/ld+json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Some of the fields are not properly defined.");
      }

      await getUser();
      navigate("/profile");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="page__container form-page__container">
      <div className="page__header form-page__header">
        <button
          className="btn"
          onClick={() => {
            navigate(-1);
          }}
        >
          <ArrowLeft className="btn__icon" />
          <span className="btn-txt-display">Back</span>
        </button>
      </div>
      <div className="page__title-header">
        <h1 className="title">Create a character</h1>
      </div>
      <CharacterForm
        initialValues={null}
        onSubmit={handleCreate}
        submitLabel="Create"
        error={error}
      />
    </div>
  );
};

export default NewCharacter;
