import { useState } from "react";
import CharacterForm from "../../Components/CharacterForm/CharacterForm";
import { useAuth } from "../../Contexts/AuthContext";
import { useNavigate } from "react-router";

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
    <>
      <CharacterForm
        initialValues={null}
        onSubmit={handleCreate}
        submitLabel="Create"
        error={error}
      />
    </>
  );
};

export default NewCharacter;
