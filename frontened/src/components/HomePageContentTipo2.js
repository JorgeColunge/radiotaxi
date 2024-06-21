// src/pages/HomePageContentTipo2.js
import React, { useEffect } from 'react'; 
import MapComponent from './MapComponent';
import socket from '../Socket';
import PanicButton from '../components/PanicButton';
import AudioRecorderButtonTipo2 from '../components/AudioRecorderButtonTipo2';

const HomePageContentTipo2 = () => {
  const id_usuario = localStorage.getItem('id_usuario');

  return (
    <div style={{ position: 'relative' }}>
      <MapComponent id_usuario={id_usuario} />
      <PanicButton />
      <AudioRecorderButtonTipo2 />
    </div>
  );
};

export default HomePageContentTipo2;
