import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

export default function LoginPage() {
  const navigate = useNavigate();

  const loginUser = async (
    email: string,
    password: string
  ) => {
    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "email": email,
          "password": password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        navigate(`/home`);
      }

      console.log("Server response:", data);
    } catch (error) {
      console.error("Error:", error);
    }
  }

  return (
    <div>
      <h1>
        Defo Secure Website
      </h1>

      <h2>
        Login
      </h2>
      <AuthForm
        mode="login"
        onSubmit={loginUser}
      />
    </div>
  );

}