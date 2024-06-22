import 'bootstrap/dist/css/bootstrap.min.css'; // Importa Bootstrap CSS
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import HomePage from "./HomePage";
import UserPage from "./components/UserPage";
import UserList from './components/UserList';
import RequireAuth from './RequireAuth';
import RedirectAuth from './RedirectAuth';
import HistoryTrips from './components/HistoryTrips';
import HistoryTripsUser from './components/HistoryTripsUser';
import HistoryAllTrips from './components/HistoryAllTrips';
import socket from './Socket'; // Importa la instancia del socket
import Layout from './components/Layout';
import NewAudio from './components/NewAudio';
import NewAudioWithAuth from './components/NewAudioWithAuth';

function App() {
  const tipo_usuario = localStorage.getItem('tipo_usuario');
  
  useEffect(() => {
    socket.connect();

    const id_usuario = localStorage.getItem('id_usuario');
    if (id_usuario) {
      socket.emit('registerUser', id_usuario);
    }

    const enableAudioPlayback = () => {
      document.body.removeEventListener('click', enableAudioPlayback);
      window.audioPlaybackAllowed = true;
    };

    document.body.addEventListener('click', enableAudioPlayback);

    return () => {
      socket.disconnect();
      document.body.removeEventListener('click', enableAudioPlayback);
    };
  }, []);

  return (
    <Router>
      <NewAudio />
      {tipo_usuario === 'tipo1' &&  <NewAudioWithAuth />}
      <Routes>
        <Route path="/" element={<RedirectAuth><Login /></RedirectAuth>} />
        <Route path="/register" element={<RedirectAuth><Register /></RedirectAuth>} />
        <Route path="/home" element={<RequireAuth><HomePage /></RequireAuth>} />
        <Route path="/user" element={<RequireAuth><UserPage /></RequireAuth>} />
        <Route path="/users-list" element={<RequireAuth><UserList /></RequireAuth>} />
        <Route path="/historial-mis-viajes" element={<RequireAuth><HistoryTrips /></RequireAuth>} />
        <Route path="/history-trips/:id_usuario" element={<RequireAuth><HistoryTripsUser /></RequireAuth>} />
        <Route path="/historial-viajes" element={<RequireAuth><HistoryAllTrips /></RequireAuth>} />
      </Routes>
    </Router>
  );
}

export default App;