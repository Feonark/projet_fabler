import { useState } from "react";
import StoryForm from "../../Components/StoryForm/StoryForm";
import { useAuth } from "../../Contexts/AuthContext";
import { useNavigate } from "react-router";

export default function CreateStoryPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleCreate = async (payload) => {
    setError("");
    
    try {
      const res = await fetch("http://localhost:8000/api/stories", {
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

      const data = await res.json();
      const id = data.id ?? data["@id"]?.split("/").pop();
      navigate(`/stories/${id}`);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <StoryForm
        initialValues={null}
        onSubmit={handleCreate}
        submitLabel="Create"
        error={error}
      />
    </>
  );
}
