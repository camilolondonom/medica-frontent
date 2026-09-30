// services/websocketService.js
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { WS_URL } from '../config';

let stompClient = null;

export const conectarWebSocket = (onConnectCallback) => {
  if (stompClient && stompClient.connected) {
    if (onConnectCallback) onConnectCallback(stompClient);
    return stompClient;
  }

  const socket = new SockJS(WS_URL);
  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    onConnect: () => {
      console.log('Conectado a WebSocket desde el módulo emisor');
      if (onConnectCallback) onConnectCallback(stompClient);
    },
    onStompError: (frame) => {
      console.error('Error en STOMP:', frame);
    }
  });

  stompClient.activate();
  return stompClient;
};

export const enviarLlamadoTurno = (datosTurno) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: '/app/llamar-turno',
      body: JSON.stringify(datosTurno),
    });
  } else {
    console.warn('El socket no está conectado. Intentando reconectar...');
    conectarWebSocket((client) => {
      client.publish({
        destination: '/app/llamar-turno',
        body: JSON.stringify(datosTurno),
      });
    });
  }
};