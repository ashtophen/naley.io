import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Server } from 'socket.io';
import Database from 'better-sqlite3';
import { open } from 'sqlite';
import * as crypto from 'node:crypto';
import { stringify } from 'node:querystring';
import { createReadStream, fsync, readFile, readFileSync, readdir, readdirSync, rmSync, statSync, unlink, unlinkSync, writeFileSync } from 'node:fs';
import 'dotenv/config';
import favicon from 'serve-favicon';
//My Functions And Etc.

// add the crypto module for UUID
let uuid = crypto.randomUUID();

// open the database files
const db = new Database('chat.db');
db.pragma('journal_mode = WAL');

const suggestionDb = new Database('suggestion.db');
suggestionDb.pragma('journal_mode = WAL');

// create our 'messages' table
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_offset TEXT UNIQUE,
      content TEXT
  );
`);
// create the 'user' table (ADD SPOTIFY ACCOUNT INFO LATER)
db.exec(`
    CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        uuid TEXT,
        ready INTEGER NOT NULL DEFAULT 0,
		color TEXT
    );
`);

suggestionDb.exec(`
    CREATE TABLE IF NOT EXISTS suggestions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      suggestion TEXT,
      name TEXT
    );
`);
var client_id = 'e3243c3ad9b349b09fe88cc642bcf43b';
var redirect_uri = 'https://naley.io/musicparty';
var myplayers = [];
var started = false;
const app = express();
const server = createServer(app)
const io = new Server(server, {
  maxHttpBufferSize: 1e8,
  connectionStateRecovery: {}
});

app.use(express.json());

app.post('/api-endpoint', (req, res) => {
  let result;
  const receivedData = req.body;
  console.log('Data recieved:', receivedData);
  const stmt = suggestionDb.prepare('INSERT INTO suggestions (suggestion, name) VALUES (?, ?)');
  result = stmt.run(receivedData.suggestion, null);
  res.status(200).json({status: 'success', received: receivedData });
});

const __dirname = import.meta.dirname;

app.use(favicon(join(__dirname, 'public', 'favicon.ico')));

app.use(express.static(join(__dirname, 'public')));

 app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public','index.html'));
});

io.on('connection', async (socket) => {
    socket.on('name', async (user) => {
        const limiteduser = user.replace(/^(.{10}).*$/, '$1');
        let result;
        uuid = crypto.randomUUID();
		const rb = crypto.randomBytes(3);
		const hexc = rb.toString('hex');
		const fincol = `#${hexc}`;
        result =  db.prepare('INSERT INTO user (name, uuid, color) VALUES (?, ?, ?)', limiteduser, uuid, fincol);
        io.emit('name', limiteduser, uuid, fincol);
    });

    socket.on('chat message', async (msg, clientOffset, user, color, callback) => {
      let result;
      msg =`<span style="color: ${color}">${user}: </span>` + msg;
      try {
        result = db.prepare('INSERT INTO messages (content, client_offset) VALUES (?, ?)')
        result = result.run(msg, clientOffset);
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
      result = db.prepare('UPDATE user SET ready = ? WHERE uuid = ?')
      result = db.run(intready, uuid);
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
        result = db.prepare('SELECT name, ready FROM user WHERE uuid = ?').get(uuid);
        if(result) {
            io.emit('pfp update', file, uuid, row.name);
            io.emit('ready change', row.ready, uuid);
        }
            callback();
        });
        
	
    socket.on('gamestart', (callback) => {
      started = true;
      io.emit('gamestart');
      callback();
    });
    socket.on('roundchange', (currRound, callback) => {
      io.emit('roundchange', currRound);
      callback();
    })
    socket.on('roundOptions', async (options, callback) => {
      io.emit('roundOptions', options);
      callback();
    });
    socket.on('answerSubmit', async (answer, uuid, callback) => {
      io.emit('answerSubmit', answer, uuid);
      callback();
    });

    socket.on('playersUpdate', async (players, callback) => {
      myplayers = players;
      io.emit('playersUpdate', players);
      console.log(players);
      callback();
    });
    //ROOM HOSTING
    

    //fix this to make it synchronous
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
          if (started){
            socket.emit('gamestart');
          }
          socket.emit('playersUpdate', myplayers);
          // add ready status catch.
      } catch (e) {
        // something went wrong
      }
    };
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
