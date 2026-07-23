import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type User = {
  user_id: number;
  username: string;
  bio: string;
}

export default function AdminPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const confirmDelete = async () => {
    if (!userToDelete) return;

    const response = await fetch(`http://localhost:8000/admin/delete/${userToDelete.user_id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      // Remove the user from the UI locally so you don't need to refresh the page
      setUsers(users.filter(user => user.user_id !== userToDelete.user_id));
      setUserToDelete(null); // Close the panel
    } else {
      console.error("Failed to delete user - check backend logs");
    }
  };

  useEffect(() => {
    fetch("http://localhost:8000/users", {
      credentials: "include"
    })
      .then(r => r.json())
      .then(setUsers);

    }, []);

  return (
      <div className="admin-page">
        <h1>Manage Users</h1>

        <div className="user-list">
        {users.map(user => (
          <div
            className="user-card"
            key={user.username}
            onClick={() => setUserToDelete(user)}
            style={{ cursor: 'pointer' }}
          >
            <h2>{user.username}</h2>
          </div>
        ))}
        </div>

        {userToDelete && (
          <div className="delete-modal">
            <div className="delete-modal-content">
              <h3>Are you sure you want to delete {userToDelete.username}?</h3>
              <button onClick={confirmDelete} className="confirm-btn">Yes</button>
              <button onClick={() => setUserToDelete(null)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        )}
      </div>
  );
}