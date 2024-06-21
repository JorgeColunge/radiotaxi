import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Preferences } from '@capacitor/preferences';
import './login.css';

const Login = () => {
  const [id_usuario, setIdUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!id_usuario || !password) {
      setError("Por favor, complete todos los campos.");
      return;
    }

    const payload = {
      id_usuario,
      password,
    };

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, payload);
      alert(`Bienvenido ${response.data.nombre}`);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("id_usuario", id_usuario);
      localStorage.setItem("tipo_usuario", response.data.tipo);

      // Guardar ID de usuario y token en Preferences de Capacitor
      await Preferences.set({ key: "id_usuario", value: id_usuario });
      await Preferences.set({ key: "token", value: response.data.token });

      // Redirección a la página principal
      navigate('/home');
    } catch (error) {
      const errorMsg = error.response ? error.response.data : "Error de red o respuesta no recibida.";
      setError(errorMsg);
    }
  };

  return (
    <div className="login-body">
      <div className="login-form">
        <div className="icon-circle">
          <img src="/RTIcon.png" alt="App Icon" />
        </div>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="ID de usuario"
            value={id_usuario}
            onChange={(e) => setIdUsuario(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input type="submit" value="Iniciar sesión" className="btn btn-primary" />
        </form>
      </div>
    </div>
  );
};

export default Login;
