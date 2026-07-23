import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './home.css'

type User = {
  username: string;
  bio: string;
}

export default function ExplorePage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [errorStatus, setErrorStatus] = useState(0);

  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");

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
    
    setUsername("");
    setEmail("");
    navigate("/login");

  };

  useEffect(() => {
    fetch("http://localhost:8000/users", {
      credentials: "include"
    })
      .then(r => r.json())
      .then(setUsers);

    }, []);

  const search = async () => {
    const response = await fetch("http://localhost:8000/user/lookup", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      // Sending a query: string
      body: JSON.stringify({ user_id: query})
    });

    const data = await response.json();

    // I am debugging my server
    if (!response.ok) {
      alert(data.error);
    };
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

      <div className="explore-page">
        <h1>Explore Users</h1>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <button onClick={search}>
            Search
          </button>
        </div>

        <div className="user-list">
        {users.map(user => (
          <div
            className="user-card"
            key={user.username}
          >
            <h2>{user.username}</h2>
            <div
              className="user-bio"
              dangerouslySetInnerHTML={{
                __html: user.bio
              }}
            />
          </div>
        ))}
        </div>
      </div>
    </>
  );
}