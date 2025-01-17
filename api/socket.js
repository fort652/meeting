// pages/api/socket.js
import WebSocket from 'ws';

let clients = [];

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).send('WebSocket server is running');
    return;
  }

  if (req.method === 'POST') {
    res.status(405).send('Use WebSocket connection');
    return;
  }

  if (req.method === 'UPGRADE') {
    const socketServer = new WebSocket.Server({ noServer: true });

    res.socket.server.on('upgrade', (req, socket, head) => {
      socketServer.handleUpgrade(req, socket, head, (ws) => {
        socketServer.emit('connection', ws, req);
        clients.push(ws);

        ws.on('message', (message) => {
          // Broadcast the message to all other clients
          clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(message);
            }
          });
        });

        ws.on('close', () => {
          clients = clients.filter((client) => client !== ws);
        });
      });
    });

    return;
  }
}
