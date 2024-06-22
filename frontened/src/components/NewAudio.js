import { useEffect, useRef } from "react";
import socket from "../Socket";

const NewAudio = () => {
  const id_usuario = useRef(localStorage.getItem('id_usuario'));

  useEffect(() => {
    console.log('Socket conectado en HomePage:', socket.connected);

    socket.emit('join', { id_usuario: id_usuario.current });

    const handleNewAudio = ({ audioUrl }) => {
      const fullAudioUrl = `${process.env.REACT_APP_API_URL}${audioUrl}`;
      console.log(fullAudioUrl);
      if (window.audioPlaybackAllowed) {
        const audio = new Audio(fullAudioUrl);
        audio.play();
      }
    };

    socket.on('new-audio', handleNewAudio);
    socket.on('new-audio-single', handleNewAudio);

    return () => {
      socket.off('new-audio', handleNewAudio);
      socket.off('new-audio-single', handleNewAudio);
    };
  }, []); // Lista de dependencias vacía asegura que esto solo se ejecute una vez

  return null; // Este componente no renderiza nada en la UI
};

export default NewAudio;
