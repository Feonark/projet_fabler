import { useState, useEffect } from "react";
import PlaceForm from "../../Components/PlaceForm/PlaceForm";
import { useAuth } from "../../Contexts/AuthContext";
import { useNavigate, useParams } from "react-router";

export default function EditStoryPage() {
  const { storyId, placeId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPlace();
  }, [token]);

  const fetchPlace = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/places/${placeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Unable to fetch place.");
      const data = await res.json();
      setInitialValues(data);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleUpdate = async (payload) => {
    setError("");
    try {
      const res = await fetch(`http://localhost:8000/api/places/${placeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/merge-patch+json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Update failed.");
      navigate(`/stories/${storyId}`);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <PlaceForm
        initialValues={initialValues}
        onSubmit={handleUpdate}
        submitLabel="Update"
        error={error}
      />
    </>
  );
}
