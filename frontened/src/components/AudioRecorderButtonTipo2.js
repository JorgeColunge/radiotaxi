import React, { useState, useRef } from 'react';
import { MicFill } from 'react-bootstrap-icons';
import axios from 'axios';
import socket from '../Socket';

const AudioRecorderButtonTipo2 = () => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimeoutRef = useRef(null); // Ref para el timeout

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      audioChunksRef.current = [];

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      try {
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/geolocation/upload-audio-tipo2`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        const backendAudioUrl = response.data.audioUrl;
        socket.emit('new-audio-tipo2', { audioUrl: backendAudioUrl });
        // Alerta eliminada
      } catch (error) {
        console.error('Error uploading audio:', error);
      }
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);

    // Detener la grabación automáticamente después de 15 segundos
    recordingTimeoutRef.current = setTimeout(() => {
      stopRecording();
    }, 15000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
    }
  };

  const handleButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div>
      <button
        onClick={handleButtonClick}
        style={{
          position: 'fixed',
          bottom: '150px',
          right: '20px',
          backgroundColor: 'white',
          color: 'black',
          border: '1px solid white',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
        }}
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
      >
        <MicFill size={30} fill={isRecording ? 'blue' : 'black'} />
      </button>
    </div>
  );
};

export default AudioRecorderButtonTipo2;
