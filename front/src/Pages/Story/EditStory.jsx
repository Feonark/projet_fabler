import { useState, useEffect } from "react";
import StoryForm from "../../Components/StoryForm/StoryForm";
import { useAuth } from "../../Contexts/AuthContext";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";

const EditStory = () => {
  const { storyId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStory();
  }, [storyId, token]);

  const fetchStory = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/stories/${storyId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Unable to fetch story.");
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
        `${import.meta.env.VITE_API_URL}/api/stories/${storyId}`,
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
        <h1 className="title">Edit a story</h1>
      </div>
      <StoryForm
        initialValues={initialValues}
        onSubmit={handleUpdate}
        submitLabel="Update"
        error={error}
      />
    </div>
  );
};

export default EditStory;
