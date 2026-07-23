import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css'

export default function HomePage() {
  const navigate = useNavigate();

  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [errorStatus, setErrorStatus] = useState(0);

  useEffect(() => {
    const loadProfile = async () => {
      const response = await fetch("http://localhost:8000/home", {
        credentials: "include"
      });

    if (response.status === 401) {
      setErrorStatus(401);
      throw new Error('Unauthorized');
    }

      const data = await response.json();

      setBio(data.bio);
      setUsername(data.username);
      setEmail(data.email);
    };

    loadProfile();
  }, []);

  const logout = async () => {
    await fetch("http://localhost:8000/logout", {
      method: "DELETE",
      credentials: "include",
    });

    setBio("");
    setUsername("");
    setEmail("");
    navigate("/login");

  };

  const saveBio = async () => {
    await fetch("http://localhost:8000/home/bio", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        bio
      })
    });
  };

  if (errorStatus === 401) {
    return (
      <div className="error-page">
        <h2>401 - Session Expired</h2>
        <p>Please log in again to access this page.</p>
        <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  return (
    <>
      <div className="topbar">
        <div className="user-info">
          <p> {username} </p>
          <div> {email} </div>
        </div>
        <button 
          className="logout-btn"
          onClick={logout}
        >
          Log out
        </button>
      </div>

      <h1>Welcome!</h1>

      <h2>Your Bio</h2>

      <textarea
        rows={8}
        cols={50}
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />

      <button onClick={saveBio}>
        Save Bio
      </button>

      <hr />

      <h2>Preview</h2>

      <div
        dangerouslySetInnerHTML={{
          __html: bio
        }}
      />

      <button onClick={() => {navigate("/home/explore");}}>Explore users!</button>
    </>
  );
}
