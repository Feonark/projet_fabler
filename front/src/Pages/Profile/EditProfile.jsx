import { useState, useEffect } from "react";
import ProfileForm from "../../Components/ProfileForm/ProfileForm";
import { useAuth } from "../../Contexts/AuthContext";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

const EditProfile = () => {
  const { user, token, getUser } = useAuth();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState(null);
  const [error, setError] = useState("");

  // Initialiser initialValues quand user est disponible
  useEffect(() => {
    if (user) {
      setInitialValues({
        username: user.username ?? "",
        email: user.email ?? "",
        description: user.description ?? "",
        birthdate: user.birthdate ?? "",
        avatarUrl: user.avatarUrl ?? "",
      });
    }
  }, [user]);

  const handleUpdate = async (payload) => {
    setError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/${user.id}`,
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

      await getUser(); // met à jour le contexte
      navigate("/profile");
    } catch (e) {
      setError(e.message);
    }
  };

  if (!initialValues) return <div>Loading...</div>; // loader

  return (
    <div className="page__container form-page__container">
      <div className="page__header form-page__header">
        <button className="btn" onClick={() => navigate(-1)}>
          <ArrowLeft className="btn__icon" />
          <span className="btn-txt-display">Back</span>
        </button>
      </div>
      <div className="page__title-header">
        <h1 className="title">Edit your profile</h1>
      </div>
      <ProfileForm
        initialValues={initialValues}
        onSubmit={handleUpdate}
        submitLabel="Update"
        error={error}
      />
    </div>
  );
};

export default EditProfile;
