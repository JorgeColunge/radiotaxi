// src/pages/HomePageContentTipo2.js
import React, { useEffect } from 'react'; 
import MapComponent from './MapComponent';
import socket from '../Socket';
import PanicButton from '../components/PanicButton';
import AudioRecorderButtonTipo2 from '../components/AudioRecorderButtonTipo2';

const HomePageContentTipo2 = () => {
  const id_usuario = localStorage.getItem('id_usuario');

  useEffect(() => {
    console.log('Socket conectado en HomePage:', socket.connected);

    socket.emit('join', { id_usuario });

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

    const handleNewAudioTipo2 = ({ audioUrl }) => {
      const fullAudioUrl = `${process.env.REACT_APP_API_URL}${audioUrl}`;
      console.log(fullAudioUrl);
      if (window.audioPlaybackAllowed) {
        const audio = new Audio(fullAudioUrl);
        audio.play();
      }
    };


    return () => {
      socket.off('new-audio', handleNewAudio);
      socket.off('new-audio-single', handleNewAudio);
    };
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <MapComponent id_usuario={id_usuario} />
      <PanicButton />
      <AudioRecorderButtonTipo2 />
    </div>
  );
};

export default HomePageContentTipo2;
