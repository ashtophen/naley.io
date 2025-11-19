import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import * as crypto from 'node:crypto';
import { stringify } from 'node:querystring';

// add the crypto module for UUID

let uuid = crypto.randomUUID();

// open the database file
const db = await open({
  filename: 'chat.db',
  driver: sqlite3.Database
});

// create our 'messages' table
await db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_offset TEXT UNIQUE,
      content TEXT
  );
`);
// create the 'user' table (ADD SPOTIFY ACCOUNT INFO LATER)
await db.exec(`
    CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        uuid TEXT
    );
`);
const app = express();
const server = createServer(app)
const io = new Server(server, {
  maxHttpBufferSize: 1e8,
  connectionStateRecovery: {}
});

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use('/public', express.static(join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.get('/style.css', (req, res) => {
    res.sendFile(join(__dirname, 'style.css'));
  });

  app.get('/lobby.html', (req, res) => {
    res.sendFile(join(__dirname, 'lobby.html'));
  });

  app.get('/bytebounce/ByteBounce.woff2', (req, res) => {
    res.sendFile(join(__dirname, '/bytebounce/ByteBounce.woff2'));
  });

io.on('connection', async (socket) => {

    socket.on('name', async (user, servedid) => {
        let result;
        const clientid = uuid;
        result = await db.run('INSERT INTO user (name, uuid) VALUES (?, ?)', user, clientid);
        servedid(clientid);

    });

    socket.on('chat message', async (msg, clientOffset, callback) => {
      let result;
      try {
        result = await db.run('INSERT INTO messages (content, client_offset) VALUES (?, ?)', msg, clientOffset);
      } catch (e) {
        if (e.errno === 19 /* SQLITE_CONSTRAINT */ ) {
          // the message was already inserted, so we notify the client
          callback();
        } else {
          // nothing to do, just let the client retry
        }
        return;
      }
      io.emit('chat message', msg, result.lastID);
      // acknowledge the event
      callback();
    });

    socket.on('pfp update', async (file, uuid, callback) => {
        let result;
        result = await db.each('SELECT name FROM user WHERE uuid = ?', uuid, (_err, row) => {
            console.log(file);
            io.emit('pfp update', file, uuid, row.name);
            callback();
        });
        
    });
  
    if (!socket.recovered) {
      try {
        await db.each('SELECT id, content FROM messages WHERE id > ?',
          [socket.handshake.auth.serverOffset || 0],
          (_err, row) => {
            socket.emit('chat message', row.content, row.id);
          }
        )
      } catch (e) {
        // something went wrong
      }
    }
  });

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});