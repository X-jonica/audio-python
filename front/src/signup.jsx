import React, { useState } from "react";
import axios from "axios";

const Signup = () => {
  const [formData, setFormData] = useState({
    nom: "",
    password: "",
    email: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/signup", formData);
      alert("Compte créé avec succès !");
    } catch (error) {
      alert("Erreur lors de l'enregistrement.");
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Créer un compte</h2>

        <input
          type="text"
          name="nom"
          placeholder="Entrez votre nom"
          value={formData.nom}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          style={styles.input}
        />

        <input type="submit" value="Sign up" style={styles.button} />
        <p>
          Vous avez un compte ? <a href="/login">Log in</a>
        </p>
      </form>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#e0f0ff",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    backgroundColor: "#ffffff",
    padding: "2rem",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0, 123, 255, 0.2)",
    display: "flex",
    flexDirection: "column",
    width: "300px",
  },
  title: {
    textAlign: "center",
    color: "#007bff",
    marginBottom: "1rem",
  },
  input: {
    padding: "10px",
    margin: "8px 0",
    border: "1px solid #ccc",
    borderRadius: "5px",
  },
  button: {
    padding: "10px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    marginTop: "10px",
  }
};

export default Signup;
