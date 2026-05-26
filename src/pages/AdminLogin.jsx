import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
  } catch (error) {
  console.error(error);
  setError(error.code);
}
  }

  return (
    <main className="admin-login">
      <form className="login-card" onSubmit={handleLogin}>
        <Link className="back-link" to="/">
          ← Retour au menu
        </Link>

        <div className="mini-logo">CF</div>

        <h1>Espace Admin</h1>
        <p>Connectez-vous pour modifier le menu.</p>

        {error && <p className="error">{error}</p>}

        <input
          type="email"
          placeholder="Email admin"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Se connecter</button>
      </form>
    </main>
  );
}