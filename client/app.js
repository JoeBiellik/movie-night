require('babel-polyfill');

import Settings from './settings'
import Socket from './socket'
import User from './user'
import Player from './player'
import Messages from './messages'
import NameModal from './modals/name'
import AdminModal from './modals/admin'
import MovieModal from './modals/movie'

export default class App {
	constructor(elements = {}) {
		this._elements = elements;

		Settings.write('url', this._elements.video.player.attr('src'));

		this._io = new Socket();
		this._user = new User(this.socket);
		this._player = new Player(this._elements.video, this.socket);
		this._messages = new Messages(this._elements.chat, this.socket);

		this._modals = {
			name: new NameModal(this._elements.modals.name, this.socket),
			admin: new AdminModal(this._elements.modals.admin, this.socket),
			movie: new MovieModal(this._elements.modals.movie, this.socket)
		};

		this.socket.on('connect', this.onConnected.bind(this));
		this.socket.on('joined', this.onUserJoined.bind(this));
		this.socket.on('left', this.onUserLeft.bind(this));
		this.socket.on('user-count', this.onUserCount.bind(this));
		this.socket.on('users', this.onUsers.bind(this));
		this.socket.on('play', this.onPlay.bind(this));
		this.socket.on('pause', this.onPause.bind(this));
		this.socket.on('movie-changed', this.onMovieChanged.bind(this));

		this._elements.modals.name.on('name:changed', this.onNameChanged.bind(this));
		this._elements.modals.admin.on('admin:changed', this.onAdminChanged.bind(this));
		this._elements.chat.form.on('message:admin', this.onMessageAdmin.bind(this));
		this._elements.chat.form.on('message:movie', this.onMessageMovie.bind(this));
		this._elements.chat.form.on('message:position', this.onMessagePosition.bind(this));
		this._elements.chat.form.on('message:jump', this.onMessageJump.bind(this));
		this._elements.tabs.on('shown.bs.tab', this.onTabChange.bind(this));
		this._elements.leave.on('click', this.onLeaveClick.bind(this));

		$(window).on('resize', this.onResize.bind(this));
		$(window).resize();

		this.updateSpinner('Connecting to server');
	}

	get io() {
		return this._io;
	}

	get socket() {
		return this.io.socket;
	}

	get user() {
		return this._user;
	}

	get player() {
		return this._player;
	}

	get messages() {
		return this._messages;
	}

	updateSpinner(msg) {
		$(this._elements.loading.message).text(msg);
	}
	hideSpinner() {
		this.updateSpinner('');
		this._elements.loading.page.fadeOut('slow');
	}

	setInfo(info) {
		Settings.write('movie', info);

		this._elements.info.title.text(info.title);
		this._elements.info.year.text(info.year);
		this._elements.info.runtime.text('Runtime: ' + info.runtime.toLocaleString() + ' minutes');
		this._elements.info.desc.text(info.desc);
		this._elements.info.poster.attr('src', info.poster);
		this._elements.video.container.css('background-image', 'url(' + info.cover + ')');
		this._elements.video.player.attr('src', info.video);

		document.title = document.title.substr(0, document.title.indexOf('·') + 2) + info.title;
	}

	async getInfo() {
		this.setInfo(await new Promise((resolve, reject) => {
			this.socket.emit('info', resolve);
		}));
	}

	async onConnected() {
		this._modals.name.value = await this._user.getName();
		this._modals.name.show();

		this.getInfo();

		this.hideSpinner();
	}

	async onNameChanged(e, name) {
		this.messages.focus();

		if (!this.user.admin && Settings.read('admin', false)) {
			await this._modals.admin.login(Settings.read('admin'))
		}
	}

	onAdminChanged(e, admin) {
		this.user.admin = admin;

		if (admin) {
			this.messages.add('You are now an admin!');
			this.messages.focus();
		} else {
			Settings.write('admin', null);
		}

		//this.player.visible = admin;
		//this.player.controls = admin;
	}

	onMessageAdmin() {
		if (this.user.admin) {
			this.messages.add('You are already an admin!');
		} else {
			this._modals.admin.show();
		}
	}

	onMessageMovie() {
		if (this.user.admin) {
			this._modals.movie.show();
		}
	}

	onMessagePosition() {
		this.messages.add('You are currently at playback position ' + this.player.positionString + ' of ' + this.player.durationString);
		this.messages.focus();
	}

	onMessageJump(e, position) {
		this.player.position = position;

		this.onMessagePosition();
	}

	onUserJoined(user) {
		this.messages.add(user + ' has joined');
	}

	onUserLeft(user) {
		this.messages.add(user + ' has left');
	}

	onUserCount(count) {
		this._elements.users.count.text(count);
	}

	async onUsers(users) {
		this._elements.users.list.empty();

		let name = await this.user.getName();

		users.sort((a, b) => {
			if (b.name == name) return 1;
			if (a.name < b.name) return -1;
			if (a.name > b.name) return 1;
			return 0;
		});

		users.forEach((user) => {
			let dt = $('<dt>').text(' ' + user.name + ' ');

			if (user.admin) {
				dt.prepend($('<i>').attr('title', 'Admin').addClass('fa fa-star text-warning'));
			}

			if (user.latency) {
				dt.append($('<small>').text(user.latency + 'ms'));
			}

			let icon = $('<i>');
			let progress = $('<progress>').attr('max', 100).addClass('progress');

			if (user.bufferStatus == 'waiting') {
				icon.text('Waiting');
				progress.addClass('progress-default');
			} else if (user.bufferStatus == 'canplay') {
				icon.addClass('text-warning fa fa-refresh fs-spin');
				progress.addClass('progress-warning');
			} else if (user.bufferStatus == 'canplaythrough') {
				icon.addClass('text-success fa fa-check');
				progress.addClass('progress-success');
			} else {
				icon.addClass('text-error fa fa-times-circle');
				progress.addClass('progress-default');
			}

			progress.attr('value', user.bufferProgress);

			dt.append($('<span>').addClass('pull-sm-right').append(icon));

			let dd = $('<dd>').append(progress);

			this._elements.users.list.append(dt);
			this._elements.users.list.append(dd);
		});
	}

	onPlay() {
		if (!this.player.visible) this.player.visible = true;

		this.player.video.play();
	}

	onPause() {
		this.player.video.pause();
	}

	onMovieChanged(movie) {
		this.setInfo(movie);

		this.messages.add('Movie changed: ' + movie.title + ' (' + movie.year + ')');
		
		this.player.buffer();
	}

	onTabChange(e) {
		if ($(e.target).attr('href') == '#chat') {
			this.messages.focus();
		}
	}

	onLeaveClick(e) {
		e.preventDefault();

		Settings.clear();
		window.location.reload(true);
	}

	onResize() {
		this.player.resize();

		this._elements.chat.messages.css('height', this._elements.video.container.height() - 85);

		this.messages.scroll();
	}
}
