import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { AuthMode } from "../types.ts";
import '../App.css'

type AuthFormProps = {
  mode: AuthMode;
  onSubmit: (
    email: string,
    password: string,
    username?: string,
  ) => void;
};

export default function AuthForm({
  mode,
  onSubmit,
}: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleSubmit = (
    e: React.SubmitEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    onSubmit(email, username, password);
  };

  const navigate = useNavigate();

  const switchMode = () => {
    if (mode === "register") {
      navigate("/login");
    } else {
      navigate("/register");
    }
  }


  return (
    <div className="login-container">

      <form
        onSubmit={handleSubmit}
        className="login-form"
      >
        <div className="login-input">
          <input
            type="username" // prevents react email checkers
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="login-input-text"
          />
        </div>

        {mode === "register" && (
          <>
            <div className="login-input">

              <input
                type="username"
                placeholder="Username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                className="login-input-text"
              />
            </div>
          </>
        )}

        <div className="login-input">

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="login-input-text"
          />
        </div>

        <div className="mb-20">
          <button
            type="submit"
            className="login-button"
          >
            {mode === "register" ? (
                <>
                  Get Started!
                </>
              ) : (
                <>
                  Sign In
                </>
              )
            }
          </button>
        </div>

        <p>
          {mode === "register" ? (
              <>
                Have an account?
              </>
            ) : (
              <>
                Create an account
              </>
            )
          }
        </p>
        
        <button 
          onClick={switchMode}
          type="button"
          className="change-login-method-button"
        >
          {mode === "register" ? (
            <>
              Login Instead
            </>
          ) : (
            <>
              Register Instead
            </>
          )
          }
        </button>
      </form>
    </div>
  );
}