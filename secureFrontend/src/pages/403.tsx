import { useNavigate } from "react-router-dom";
import "./ForbiddenPage.css";

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="forbidden-container">
      <div className="forbidden-card">
        <h1>403</h1>
        <h2>Access Forbidden</h2>

        <p>
          You do not have permission to access this resource.
          If you believe this is an error, please contact an administrator.
        </p>

        <button onClick={() => navigate("/")}>
          Return Home
        </button>
      </div>
    </div>
  );
}