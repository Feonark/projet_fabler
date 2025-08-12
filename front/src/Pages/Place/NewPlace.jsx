import { useState } from "react";
import { useAuth } from "../../Contexts/AuthContext";
import { useNavigate } from "react-router";
import PlaceForm from "../../Components/PlaceForm/PlaceForm";
import { useParams } from "react-router";

export default function CreateStoryPage() {
  const { storyId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleCreate = async (payload) => {
    setError("");
    try {
      const res = await fetch("http://localhost:8000/api/places", {
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

      navigate(`/stories/${storyId}`);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <PlaceForm
        initialValues={null}
        onSubmit={handleCreate}
        submitLabel="Create"
        error={error}
      />
    </>
  );
}
