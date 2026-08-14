import React, { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const SalaEsperaTV = () => {
  const playerRef = useRef(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [fechaHora, setFechaHora] = useState(new Date());

  // Estados de Turnos
  const [turnoAnterior, setTurnoAnterior] = useState(null);
  const [turnoActual, setTurnoActual] = useState(null);
  const [turnoSiguiente, setTurnoSiguiente] = useState(null);

  // LISTA DE REPRODUCCIÓN POR DEFECTO (IDs de YouTube)
  const playlistDefault = ['dQw4w9WgXcQ', '3JZ_D3ELwOQ', 'L_LUpnjgPso'];

  // Reloj
  useEffect(() => {
    const timer = setInterval(() => setFechaHora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cargar API de YouTube con Playlist
  useEffect(() => {
    const initPlayer = () => {
      if (window.YT && window.YT.Player) {
        playerRef.current = new window.YT.Player('youtube-player', {
          playerVars: {
            autoplay: 1,
            controls: 0,
            mute: 1,
            playlist: playlistDefault.join(','), // Carga la lista
          },
          events: {
            onReady: () => setIsPlayerReady(true),
          },
        });
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      window.onYouTubeIframeAPIReady = initPlayer;
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }
  }, []);

  // WebSockets
  useEffect(() => {
    let client;
    try {
      client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws-turnos'),
        reconnectDelay: 5000,
        onConnect: () => {
          client.subscribe('/topic/turnos', (message) => {
            try {
              const data = JSON.parse(message.body);
              if (Array.isArray(data)) procesarTurnosPrivacidad(data);
            } catch (e) {
              console.error('Error parseando turnos:', e);
            }
          });

          // Comandos de Control Remoto de TV
          client.subscribe('/topic/tv-control', (message) => {
            try {
              const command = JSON.parse(message.body);
              handleTvCommand(command);
            } catch (e) {
              console.error('Error enviando comando a TV:', e);
            }
          });
        },
      });
      client.activate();
    } catch (err) {
      console.error('Error WebSocket TV:', err);
    }
    return () => { if (client) client.deactivate(); };
  }, [isPlayerReady]);

  const procesarTurnosPrivacidad = (listaPacientes) => {
    const atendidos = listaPacientes.filter((p) => p.estado === 'ATENDIDO');
    const actual = listaPacientes.find((p) => p.estado === 'EN_CONSULTORIO' || p.estado === 'LLAMADO');
    let enEspera = listaPacientes.filter((p) => p.estado === 'EN_ESPERA');

    enEspera.sort((a, b) => {
      if (a.fueAusenteReactivado && !b.fueAusenteReactivado) return -1;
      if (!a.fueAusenteReactivado && b.fueAusenteReactivado) return 1;
      return 0;
    });

    setTurnoAnterior(atendidos.length > 0 ? atendidos[atendidos.length - 1] : null);
    setTurnoActual(actual || null);
    setTurnoSiguiente(enEspera.length > 0 ? enEspera[0] : null);
  };

  // CONTROL DE REPRODUCTOR DESDE RECEPCIÓN
  const handleTvCommand = (command) => {
    const player = playerRef.current;
    if (!player) return;

    switch (command.action) {
      case 'PLAY':
        if (typeof player.playVideo === 'function') player.playVideo();
        break;
      case 'PAUSE':
        if (typeof player.pauseVideo === 'function') player.pauseVideo();
        break;
      case 'NEXT':
        if (typeof player.nextVideo === 'function') player.nextVideo();
        break;
      case 'PREV':
        if (typeof player.previousVideo === 'function') player.previousVideo();
        break;
      case 'LOAD_VIDEO':
        if (command.videoId && typeof player.loadVideoById === 'function') {
          player.loadVideoById(command.videoId);
        }
        break;
      case 'LOAD_PLAYLIST':
        if (command.playlistId && typeof player.loadPlaylist === 'function') {
          player.loadPlaylist({ list: command.playlistId, listType: 'playlist' });
        }
        break;
      case 'MUTE_TOGGLE':
        if (typeof player.isMuted === 'function') {
          player.isMuted() ? player.unMute() : player.mute();
        }
        break;
      default:
        break;
    }
  };

  const horaFormateada = fechaHora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const fechaFormateada = fechaHora.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="grid grid-cols-3 h-screen bg-slate-900 text-white overflow-hidden font-sans">
      <div className="col-span-2 h-full relative bg-black">
        <div id="youtube-player" className="w-full h-full pointer-events-none" />
      </div>

      <div className="col-span-1 p-6 bg-slate-800 flex flex-col justify-between border-l border-slate-700 shadow-2xl">
        <div>
          <div className="border-b border-slate-700 pb-3 mb-4 text-center">
            <h2 className="text-xl font-black tracking-wide text-blue-400 uppercase">Sala de Espera</h2>
            <div className="mt-2 bg-slate-900/80 rounded-xl p-2 border border-slate-700 flex justify-around items-center">
              <span className="text-xs text-slate-300 capitalize font-medium">📅 {fechaFormateada}</span>
              <span className="text-sm font-mono font-bold text-amber-400 bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">⏰ {horaFormateada}</span>
            </div>
          </div>

          <div className="mb-3 p-2.5 bg-slate-700/60 rounded-lg border border-slate-600/50 flex justify-between items-center opacity-75">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">✓ Atendido Anteriormente</span>
              <span className="text-xs font-semibold text-slate-200">{turnoAnterior ? turnoAnterior.nombre || turnoAnterior.paciente : '---'}</span>
            </div>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
              {turnoAnterior ? turnoAnterior.documento || 'Atendido' : '---'}
            </span>
          </div>

          <div className="mb-4 p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl text-center shadow-xl border border-blue-400/30 animate-pulse">
            <span className="text-[11px] uppercase tracking-widest font-black text-blue-200 block">📢 Paciente en Llamado / Consulta</span>
            <div className="text-2xl font-black text-white mt-1.5 truncate">{turnoActual ? turnoActual.nombre || turnoActual.paciente : 'En Espera'}</div>
            <div className="text-xs mt-1 text-blue-100 font-mono font-bold">{turnoActual ? `Doc: ${turnoActual.documento}` : 'Esperando próximo llamado'}</div>
          </div>

          <div className="p-3.5 bg-slate-700/90 rounded-xl border border-slate-600 mb-3">
            <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400 block mb-1.5">⏳ Siguiente en Lista</span>
            {turnoSiguiente ? (
              <div className="flex justify-between items-center bg-slate-800 p-2.5 rounded-lg border border-slate-700">
                <span className="font-bold text-sm text-white truncate">{turnoSiguiente.nombre || turnoSiguiente.paciente}</span>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">En espera</span>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-1">Sin pacientes pendientes en cola</p>
            )}
          </div>
        </div>

        <div className="text-center border-t border-slate-700/80 pt-2.5">
          <p className="text-xs font-bold text-slate-200">Consultorio Médico Dra. Carolina Londoño</p>
          <p className="text-[11px] text-emerald-400 font-mono mt-0.5 font-semibold flex items-center justify-center gap-1">
            <span>💬 WhatsApp:</span><span>3147262285</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SalaEsperaTV;