const express = require('express');
const config = require('config');
const app = express();
app.server = require('http').Server(app);
const io = require('socket.io')(app.server);
const marvel = require('marvel-characters');
const moviedb = require('moviedb')(config.tmdb);

app.disable('x-powered-by');
app.set('view engine', 'pug');

app.locals.pretty = true;

app.options('*', function(req, res) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'X-Requested-With');
	res.status(200).send();
});

app.all('*', function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'X-Requested-With');
	next();
});

app.use(require('compression')());
app.use(express.static('public'));

app.get('/', function(req, res) {
	res.render('index', config.movie);
});

const log = function(socket, message) {
	console.log('[' + socket.name.value + '] ' + message);
};

const setMovie = function(movie) {
	config.movie = {
		id: movie.id,
		title: movie.title,
		year: (new Date(movie.release_date)).getFullYear(),
		runtime: movie.runtime || 0,
		desc: movie.overview || '',
		poster: 'https://image.tmdb.org/t/p/original' + movie.poster_path,
		cover: 'https://image.tmdb.org/t/p/original' + movie.backdrop_path,
		video: config.movie.video
	};
};

setInterval(function() {
	if (Object.keys(io.sockets.connected).length < 1) return;

	const clients = [];

	Object.keys(io.sockets.connected).forEach(function(element) {
		const client = io.sockets.connected[element];
		if (!client.name.picked) return;

		clients.push({
			name: client.name.value,
			latency: client.latency || null,
			videoStatus: client.videoStatus || 'waiting',
			bufferStatus: client.bufferStatus || 'pending',
			bufferProgress: client.bufferProgress || 0,
			admin: client.admin
		});
	});

	if (clients.length < 1) return;

	clients.sort(function(a, b) {
		if (a.name < b.name) return -1;
		if (a.name > b.name) return 1;
		return 0;
	});

	io.emit('users', clients);
}, 1000);

if (!config.movie.title) {
	moviedb.movieInfo({id: config.movie.id}, function(err, res) {
		setMovie(res);
	});
}

io.on('connection', function(socket) {
	if (!socket.name) socket.name = {
		value: marvel(),
		picked: false
	};

	setInterval(function() {
		socket.emit('latency', Date.now(), (time) => {
			socket.latency = Date.now() - time;
		});
	}, 2000);

	const countClients = function() {
		let joined = 0;
		Object.keys(io.sockets.connected).forEach(function(element) {
			if (io.sockets.connected[element].name.picked) {
				joined++;
			}
		});

		return {
			connected: Object.keys(io.sockets.connected).length,
			joined: joined
		};
	};

	log(socket, 'Connected (' + countClients().connected + ')');
	socket.emit('user-count', countClients().joined);

	socket.on('latency', function(time, cb) {
		cb(time);
	});

	socket.on('info', function(cb) {
		cb(config.movie);
	});

	socket.on('message', function(msg) {
		log(socket, 'Message');

		io.emit('message', {
			name: socket.name.value,
			msg: msg.trim(),
			sent: new Date()
		});

		if (msg.trim().toLowerCase() == '/play') {
			if (!socket.admin) return;

			log(socket, 'triggered playback');

			io.emit('play');
		}

		if (msg.trim().toLowerCase() == '/pause') {
			if (!socket.admin) return;

			log(socket, 'paused playback');

			io.emit('pause');
		}

		if (msg.trim().toLowerCase().substr(0, 6) == '/jump ') {
			if (!socket.admin) return;

			const position = msg.trim().toLowerCase().substr(6);

			log(socket, 'jumped playback to ' + position);

			io.emit('jump', position);
		}
	});

	socket.on('disconnect', function() {
		log(socket, 'Disconnected (' + countClients().connected + ')');

		if (!socket.name.picked) return;

		io.emit('left', socket.name.value);
		io.emit('user-count', countClients().joined);
	});

	socket.on('get-name', function(cb) {
		cb(socket.name.value);
	});

	socket.on('set-name', function(name, cb) {
		name = name.trim();

		let valid = Boolean(name);

		if (valid) {
			Object.keys(io.sockets.connected).forEach(function(element) {
				if (io.sockets.connected[element].name.value.toLowerCase() == name.toLowerCase()) {
					valid = false;
				}
			});

			if (name == socket.name.value) {
				valid = true;
			}

			if (valid) {
				log(socket, 'Changed name: ' + name);

				socket.name = {
					value: name,
					picked: true
				};

				io.emit('joined', socket.name.value);
				io.emit('user-count', countClients().joined);
			}
		}

		cb(valid);
	});

	socket.on('admin', function(password, cb) {
		if (password == config.password) {
			log(socket, 'is now an admin');

			socket.admin = true;
		} else {
			log(socket, 'Failed admin attempt');

			socket.admin = false;
		}

		cb(socket.admin);
	});

	socket.on('video-status', function(status) {
		if (socket.videoStatus == status) return;

		socket.videoStatus = status;
	});

	socket.on('buffer-status', function(status) {
		if (socket.bufferStatus == status) return;

		socket.bufferStatus = status;
	});

	socket.on('buffer-progress', function(progress) {
		progress = (progress || 0).toFixed(2);

		if (socket.bufferProgress == progress) return;

		socket.bufferProgress = progress;
	});

	socket.on('set-movie', function(url, id, cb) {
		moviedb.movieInfo({id: id}, function(err, res) {
			if (err) {
				log(socket, 'Movie lookup failed');

				cb(false);
				return;
			}

			cb(true);

			config.movie.video = url;
			setMovie(res);

			io.emit('movie-changed', config.movie);
		});
	});
});

module.exports = app;
