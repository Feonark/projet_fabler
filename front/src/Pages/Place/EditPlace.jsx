import { useState, useEffect } from "react";
import PlaceForm from "../../Components/PlaceForm/PlaceForm";
import { useAuth } from "../../Contexts/AuthContext";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";

const EditPlace = () => {
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/places/${placeId}`, {
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/places/${placeId}`, {
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
        <h1 className="title">Edit a place</h1>
      </div>
      <PlaceForm
        initialValues={initialValues}
        onSubmit={handleUpdate}
        submitLabel="Update"
        error={error}
      />
    </div>
  );
};

export default EditPlace;
