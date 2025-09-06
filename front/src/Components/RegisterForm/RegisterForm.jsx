import { useState } from "react";
import { useNavigate } from "react-router";
import { Upload, X, DiamondPlus } from "lucide-react";

const MAX_AVATAR_SIZE = 1000 * 1024; // 1Mo

// Helpers dates
const todayISO = () => new Date().toISOString().slice(0, 10);
const yearsAgoISO = (years) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d.toISOString().slice(0, 10);
};

// Regex
const reUsername = /^[A-Za-z0-9]+$/;
const reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const rePwUpper = /[A-Z]/;
const rePwLower = /[a-z]/;
const rePwDigit = /[0-9]/;
const reHtmlTag = /<[^>]*>/;

const extractBackFieldErrors = (errorData) => {
  const out = {};

  // Cas standard Api Platform: violations
  if (Array.isArray(errorData?.violations)) {
    errorData.violations.forEach((v) => {
      const key = v.propertyPath || "global";
      if (key !== "global") {
        out[key] = [...(out[key] || []), v.message];
      }
    });
  }

  // // Cas "Unique violation" Doctrine/PostgreSQL
  const text = [
    errorData?.detail,
    errorData?.description,
    errorData?.["hydra:description"],
    errorData?.message,
    errorData?.title,
  ]
    .filter(Boolean)
    .join("\n");

  // Match: Key (email)=(xxx) already exists.  OU  Key (username)=(xxx) already exists.
  const uniqueRx = /Key\s*\(([^)]+)\)\s*=\s*\([^)]+\)\s*already exists/i;
  const m = uniqueRx.exec(text);
  if (m && m[1]) {
    const field = m[1].trim();
    if (field === "email" || field === "username") {
      out[field] = [...(out[field] || []), "This is already used."];
    }
  }

  return out;
};

const RegisterForm = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [plainPassword, setPlainPassword] = useState("");
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});
  const [backFieldErrors, setBackFieldErrors] = useState({});

  const setFieldError = (field, messages) => {
    setFieldErrors((prev) => ({
      ...prev,
      [field]: Array.isArray(messages) ? messages : messages ? [messages] : [],
    }));
  };

  const clearFieldError = (field) => {
    setFieldErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  ////////////////////////////////////////////////////////////////////////////////////////
  // VALIDATION DES FIELDS
  ////////////////////////////////////////////////////////////////////////////////////////

  const validateUsername = (val) => {
    const errs = [];
    if (!val || !val.trim()) errs.push("The username is required.");
    if (val && val.length < 3)
      errs.push("Your username must be at least 3 characters long.");
    if (val && val.length > 20)
      errs.push("Your username cannot be longer than 30 characters.");
    if (val && !reUsername.test(val))
      errs.push(
        "Your username can only contain letters and numbers (no spaces, dashes or special characters)."
      );
    return errs;
  };

  const validatePassword = (val) => {
    const errs = [];
    if (!val || !val.trim()) errs.push("The password is required.");
    if (val && val.length < 8)
      errs.push("Your password must be at least 8 characters long.");
    if (val && val.length > 50)
      errs.push("Your username cannot be longer than 50 characters.");
    if (val && !rePwUpper.test(val))
      errs.push("At least one uppercase letter.");
    if (val && !rePwLower.test(val))
      errs.push("At least one lowercase letter.");
    if (val && !rePwDigit.test(val)) errs.push("At least one number.");
    if (val && reHtmlTag.test(val)) errs.push("HTML tags are not allowed.");
    return errs;
  };

  const validateEmail = (val) => {
    const errs = [];
    if (!val || !val.trim()) errs.push("The email is required.");
    if (val && val.length > 255)
      errs.push("Email cannot be longer than 255 characters.");
    if (val && !reEmail.test(val)) errs.push("Must be a valid email.");
    return errs;
  };

  const validateBirthdate = (val) => {
    if (!val) return [];
    const errs = [];
    const isoToday = todayISO();
    const iso13 = yearsAgoISO(13);
    const iso120 = yearsAgoISO(120);
    if (val >= isoToday) errs.push("Birthdate must be in the past.");
    if (val > iso13) errs.push("You must be at least 13 years old.");
    if (val < iso120) errs.push("No human lives that long, elf.");
    return errs;
  };

  const validateDescription = (val) => {
    const errs = [];
    if (val) {
      if (val.trim().length === 0) errs.push("Description is required.");
      if (val.length > 100)
        errs.push("Your description cannot be longer than 100 characters.");
      if (reHtmlTag.test(val)) errs.push("HTML tags are not allowed.");
    }
    return errs;
  };

  const validateAvatarFile = (file) => {
    const errs = [];
    if (file && file.size > MAX_AVATAR_SIZE)
      errs.push("The profile picture can't exceed 1Mo.");
    return errs;
  };

  const validateAll = () => {
    const newErrors = {};
    const u = validateUsername(username);
    if (u.length) newErrors.username = u;
    const p = validatePassword(plainPassword);
    if (p.length) newErrors.plainPassword = p;
    const e = validateEmail(email);
    if (e.length) newErrors.email = e;
    const b = validateBirthdate(birthdate);
    if (b.length) newErrors.birthdate = b;
    const d = validateDescription(description);
    if (d.length) newErrors.description = d;
    const a = validateAvatarFile(avatarFile);
    if (a.length) newErrors.avatarFile = a;
    return newErrors;
  };

  ////////////////////////////////////////////////////////////////////////////////////////
  // HANDLERS ONCHANGE DES FIELDS
  ////////////////////////////////////////////////////////////////////////////////////////

  const onUsernameChange = (e) => {
    const v = e.target.value;
    setUsername(v);
    const errs = validateUsername(v);
    errs.length ? setFieldError("username", errs) : clearFieldError("username");
    setBackFieldErrors((prev) => ({ ...prev, username: undefined }));
  };

  const onPasswordChange = (e) => {
    const v = e.target.value;
    setPlainPassword(v);
    const errs = validatePassword(v);
    errs.length
      ? setFieldError("plainPassword", errs)
      : clearFieldError("plainPassword");
  };

  const onEmailChange = (e) => {
    const v = e.target.value;
    setEmail(v);
    const errs = validateEmail(v);
    errs.length ? setFieldError("email", errs) : clearFieldError("email");
    setBackFieldErrors((prev) => ({ ...prev, email: undefined }));
  };

  const onBirthdateChange = (e) => {
    const v = e.target.value;
    setBirthdate(v);
    const errs = validateBirthdate(v);
    errs.length
      ? setFieldError("birthdate", errs)
      : clearFieldError("birthdate");
  };

  const onDescriptionChange = (e) => {
    const v = e.target.value;
    setDescription(v);
    const errs = validateDescription(v);
    errs.length
      ? setFieldError("description", errs)
      : clearFieldError("description");
  };

  const onAvatarChange = (e) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
    const errs = validateAvatarFile(file);
    errs.length
      ? setFieldError("avatarFile", errs)
      : clearFieldError("avatarFile");
  };

  ////////////////////////////////////////////////////////////////////////////////////////
  // HANDLESUBMIT
  ////////////////////////////////////////////////////////////////////////////////////////

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setBackFieldErrors({});

    const all = validateAll();
    if (Object.keys(all).length > 0) {
      setFieldErrors(all);
      return;
    }

    let finalAvatarUrl = avatarUrl;

    if (avatarFile) {
      const fd = new FormData();
      const extension = avatarFile.name?.split(".").pop() || "jpg";
      fd.append("file", avatarFile, `avatar.${extension}`);
      fd.append("folder", "avatars");

      try {
        const uploadRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/images`,
          {
            method: "POST",
            headers: { Accept: "application/ld+json" },
            body: fd,
          }
        );
        if (!uploadRes.ok) throw new Error("Please upload a valid image file.");
        const uploadData = await uploadRes.json();
        finalAvatarUrl = uploadData.url;
      } catch {
        setFieldError("avatarFile", "Please upload a valid image file.");
        return;
      }
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/ld+json",
            Accept: "application/ld+json",
          },
          body: JSON.stringify({
            username,
            plainPassword,
            email,
            birthdate: birthdate === "" ? null : birthdate,
            description,
            avatarUrl: finalAvatarUrl,
          }),
        }
      );

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch {
          console.log(error);
        }
        const mapped = extractBackFieldErrors(errorData);
        setBackFieldErrors(mapped);
        return;
      }

      setSuccess(true);
      await response.json();
      navigate("/login");
    } catch {}
  };

  // sous chaque champ : on montre d’abord l’erreur front, sinon l’erreur back
  const firstErr = (field) =>
    fieldErrors[field]?.[0] || backFieldErrors[field]?.[0] || "";

  ////////////////////////////////////////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////////////////////////////////////////

  return (
    <form className="form__container" onSubmit={handleSubmit}>
      {success && <p>Inscription réussie !</p>}
      {error && <div className="form__header-error">{error}</div>}

      <div className="input__container">
        <label className="input__label">
          Username <span className="asterisk">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. GlassHollow95"
          value={username}
          onChange={onUsernameChange}
          required
        />
        <span className="form__error">{firstErr("username")}</span>
      </div>

      <div className="input__container">
        <label className="input__label">
          Email <span className="asterisk">*</span>
        </label>
        <input
          type="email"
          placeholder="e.g. glasshollow@domain.com"
          value={email}
          onChange={onEmailChange}
          required
        />
        <span className="form__error">{firstErr("email")}</span>
      </div>

      <div className="input__container">
        <label className="input__label">
          Password <span className="asterisk">*</span>
        </label>
        <input
          type="password"
          placeholder="••••••••••"
          value={plainPassword}
          onChange={onPasswordChange}
          required
        />
        <span className="form__error">{firstErr("plainPassword")}</span>
      </div>

      <div className="form__row">
        <div className="input__container form-row__item">
          <label className="input__label">Birthdate</label>
          <input type="date" value={birthdate} onChange={onBirthdateChange} />
          <span className="form__error">{firstErr("birthdate")}</span>
        </div>

        <div className="input__container form-row__item">
          <label htmlFor="avatarFile" className="input__label">
            Profile picture
          </label>
          <input
            id="avatarFile"
            type="file"
            className="input-file"
            accept=".jpg, .jpeg, .png, .bmp"
            onChange={onAvatarChange}
          />

          {/* input upload custom + preview */}
          <label htmlFor="avatarFile" className="file-upload__trigger">
            {avatarFile || avatarUrl ? (
              <div className="file-upload__preview-wrapper">
                <img
                  className="file-upload__preview-img"
                  src={
                    avatarFile
                      ? URL.createObjectURL(avatarFile)
                      : `${import.meta.env.VITE_API_URL}/${avatarUrl}`
                  }
                  alt="Avatar preview"
                />
                <button
                  type="button"
                  className="file-upload__remove"
                  onClick={(e) => {
                    e.preventDefault();
                    setAvatarFile(null);
                    setAvatarUrl("");
                  }}
                >
                  <X className="file-upload__remove-icon" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="file-upload__icon" />
                <span className="file-upload__text">
                  Click here to upload a file
                </span>
              </>
            )}
          </label>

          <span className="form__error">{firstErr("avatarFile")}</span>
        </div>
      </div>

      <div className="input__container">
        <label className="input__label">Description</label>
        <textarea
          value={description}
          placeholder="e.g. I am here to roleplay!"
          onChange={onDescriptionChange}
        />
        <span className="form__error">{firstErr("description")}</span>
      </div>

      <button className="btn invert-btn submit-btn" type="submit">
        <DiamondPlus className="btn__icon invert-btn__icon" />
        <span className="btn__text">Register</span>
      </button>

      <span className="form__text">
        All fields marked with (<span className="asterisk">*</span>) are
        mandatory.
      </span>
    </form>
  );
};

export default RegisterForm;
