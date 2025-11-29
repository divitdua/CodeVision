import io from 'socket.io-client';

const socket = io('https://collab-hbx4.onrender.com'); // or your server URL

export default socket;