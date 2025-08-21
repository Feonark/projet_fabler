import LoginForm from "../../Components/LoginForm/LoginForm";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

const Login = () => {
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
        <h1 className="title">Login</h1>
      </div>
      <LoginForm />
    </div>
  );
};

export default Login;
