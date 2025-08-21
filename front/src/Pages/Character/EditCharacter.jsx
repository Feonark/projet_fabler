import { useState, useEffect } from "react";
import CharacterForm from "../../Components/CharacterForm/CharacterForm";
import { useAuth } from "../../Contexts/AuthContext";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";

const EditCharacter = () => {
  const { characterId } = useParams();
  const { token, getUser } = useAuth();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCharacter();
  }, [token]);

  const fetchCharacter = async () => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/characters/${characterId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Unable to fetch character.");
      const data = await res.json();
      setInitialValues(data);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleUpdate = async (payload) => {
    setError("");
    try {
      const res = await fetch(
        `http://localhost:8000/api/characters/${characterId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/merge-patch+json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Update failed.");
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
        <h1 className="title">Edit a character</h1>
      </div>
      <CharacterForm
        initialValues={initialValues}
        onSubmit={handleUpdate}
        submitLabel="Update"
        error={error}
      />
    </div>
  );
};

export default EditCharacter;
