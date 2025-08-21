import RegisterForm from "../../Components/RegisterForm/RegisterForm";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();

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
        <h1 className="title">Register</h1>
      </div>
      <RegisterForm />
    </div>
  );
};

export default Register;
