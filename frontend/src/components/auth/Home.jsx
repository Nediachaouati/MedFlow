import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios.get("http://localhost:3000/users/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(res => setUser(res.data))
    .catch(() => localStorage.removeItem("token"));
  }, []);

  if (!user) return <p>Chargement...</p>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Bienvenue, {user.name}</h1>
      <p>Email : {user.email}</p>
      <p>Rôle : {user.role}</p>
    </div>
  );
}
