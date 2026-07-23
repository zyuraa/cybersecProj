import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

export default function RegisterPage() {
  const navigate = useNavigate();

  const registerUser = async (
    email: string,
    password: string,
    username: string = ""
  ) => {
    try {
      const response = await fetch("http://localhost:8000/register", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "email": email,
          "username": username,
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
        Register
      </h2>
      <AuthForm
        mode="register"
        onSubmit={registerUser}
      />
    </div>
  );

}