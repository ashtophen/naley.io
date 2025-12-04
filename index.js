import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import * as crypto from 'node:crypto';
import { stringify } from 'node:querystring';
import { createReadStream, fsync, readFile, readFileSync, readdir, readdirSync, rmSync, statSync, unlink, unlinkSync, writeFileSync } from 'node:fs';

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
        uuid TEXT,
        ready INTEGER NOT NULL DEFAULT 0
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
    socket.on('name', async (user) => {
        const limiteduser = user.replace(/^(.{10}).*$/, '$1');
        let result;
        uuid = crypto.randomUUID();
        result = await db.run('INSERT INTO user (name, uuid) VALUES (?, ?)', limiteduser, uuid);
        io.emit('name', limiteduser, uuid);
        
    });

    socket.on('chat message', async (msg, clientOffset, user, callback) => {
      let result;
      msg = user + ": " + msg;
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

    socket.on('ready change', async (ready, uuid, callback) => {
      console.log(ready, uuid);
      let intready;
      let result;
      intready = Number(ready);
      result = await db.run('UPDATE user SET ready = ? WHERE uuid = ?', intready, uuid);
      io.emit('ready change', ready, uuid);

      callback();

    })

    socket.on('pfp update', async (file, uuid, callback) => {
        let result;
            console.log(file);
        if(file == 'filler') {
            const buffer = readFileSync(`${__dirname}/public/images/oh_no.PNG`);
            file  = buffer;
        }
        writeFileSync(`./public/tempfiles/${uuid}.png`, file);
        result = await db.each('SELECT name, ready FROM user WHERE uuid = ?', uuid, (_err, row) => {
            io.emit('pfp update', file, uuid, row.name);
            io.emit('ready change', row.ready, uuid);
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
        const files = readdirSync(join(__dirname, '/public/tempfiles'));
            const filenames = [];
            files.forEach(file => {
                let result;
                let uuid = file.replace(/\..*/, "");
                result = db.each('SELECT name, ready FROM user WHERE uuid = ?', uuid, (_err, row) => {
                
                if (statSync(join(__dirname, '/public/tempfiles', file)).isFile()) {
                
                filenames.push(uuid);
                    console.log(filenames);
                }
                readFile(join(__dirname, "/public/tempfiles", file), (err, data) =>{
                    if (err) {
                        console.error('error reading file:', err);
                        return;
                    }
                    socket.emit('pfp update', data, uuid, row.name);
                    socket.emit('ready change', row.ready, uuid);
                });
        
                });
            });
          // add ready status catch.
      } catch (e) {
        // something went wrong
      }
    }
  });

  function emptyDirectory(dirPath) {
    console.log(dirPath);
    try {
        const files = readdirSync(dirPath);
        for (const file of files) {
            const filePath = join(dirPath, file);
            unlinkSync(filePath);
            console.log(`Deleted: ${filePath}`);
        }
        console.log(`All files deleted from: ${dirPath}`);
    } catch (err) {
        console.error(`Error emptying directory ${dirPath}:`, err);
    }
};

  // Listen for process termination signals
process.on('SIGINT', () => {
    console.log('\nReceived SIGINT signal. Performing cleanup...');
    emptyDirectory(`${__dirname}/public/tempfiles`);
    process.exit(130); // Exit after cleanup
});

process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM signal. Performing cleanup...');
    emptyDirectory(`${__dirname}/public/tempfiles`);
    process.exit(143); // Exit after cleanup (typical exit code for SIGTERM)
});

server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
