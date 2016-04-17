export default class Player {
	constructor(elements, socket) {
		this._elements = elements;
		this._socket = socket;
		this._buffering = false;
		this._aspectRatio = 16 / 9;
		this.visible = false;
		this.controls = false;

		this._elements.player.on('play', this._onVideoPlay.bind(this));
		this._elements.player.on('playing', this._onVideoPlaying.bind(this));
		this._elements.player.on('pause', this._onVideoPause.bind(this));
		this._elements.player.on('progress', this._onVideoProgress.bind(this));
		this._elements.player.on('seeking', this._onVideoSeeked.bind(this));
		this._elements.player.on('seeked', this._onVideoSeeked.bind(this));
		this._elements.player.on('ended', this._onVideoEnded.bind(this));
		this._elements.player.on('dblclick', this._onVideoDblClick.bind(this));
		//this._elements.player.on('DOMMouseScroll mousewheel', this._onVideoScroll.bind(this));
		this._elements.player.on('contextmenu', () => { return this.controls; });

		this._elements.player.on('waiting', () => { this._socket.emit('buffer-status', 'waiting'); })
			.on('canplay', () => { this._socket.emit('buffer-status', 'canplay'); })
			.on('canplaythrough', () => { this._socket.emit('buffer-status', 'canplaythrough'); })
			.on('error', () => { this._socket.emit('video-status', 'error'); });

		this.buffer();
		this.resize();
	}

	get video() {
		return this._elements.player.get(0);
	}

	get buffering() {
		return this._buffering;
	}

	get aspectRatio() {
		return this._aspectRatio;
	}

	set aspectRatio(ratio) {
		this._aspectRatio = ratio;

		this.resize();
	}

	get visible() {
		return this._elements.player.is(':visible');
	}

	set visible(enabled) {
		enabled = Boolean(enabled);

		if (enabled) {
			this._elements.player.show();
			this._elements.container.data('img', this._elements.container.css('background-image'));
			this._elements.container.css('background-image', 'none');
		} else {
			this._elements.player.hide();
			this._elements.container.css('background-image', this._elements.container.data('img'));
			this._elements.container.data('img', null);
		}

		this.resize();
	}

	get controls() {
		return this._elements.player.prop('controls');
	}

	set controls(enabled) {
		enabled = Boolean(enabled);
		this._elements.player.prop('controls', enabled);
	}

	resize() {
		let width = this._elements.container.width();
		let height = this._elements.container.height();

		if (width / height < this._aspectRatio) {
			this._elements.player.css('width', width);
			this._elements.player.css('height', width / this._aspectRatio);
		} else {
			this._elements.player.css('height', height);
			this._elements.player.css('width', height * this._aspectRatio);
		}

		this._elements.player.css('margin-top', (height - this._elements.player.height()) / 2);
	}

	buffer() {
		//if (this.buffering) return;

		this.video.muted = true;
		this.video.play();

		let listener = (e) => {
			if (this.video.currentTime > 0) {
				this._buffering = true;
				this.video.pause();
				this.video.muted = false;
				this.video.currentTime = 0;

				this.aspectRatio = this.video.videoWidth / this.video.videoHeight;
				this.resize();

				this.video.removeEventListener('timeupdate', listener, false);
			}
		};

		this.video.addEventListener('timeupdate', listener, false);
	}

	_onVideoPlay() {
		console.log('play');
	}

	_onVideoPlaying() {
		console.log('playing');
	}

	_onVideoPause() {
		console.log('pause');
	}

	_onVideoSeeked() {
		console.log('seeked');
	}

	_onVideoEnded() {
		console.log('ended');
	}

	_onVideoProgress(e) {
		let buffered = 0;

		for (let i = 0; i < this.video.buffered.length; i++) {
			buffered += this.video.buffered.end(i) - this.video.buffered.start(i);
		}

		this._socket.emit('buffer-progress', (buffered / this.video.duration) * 100);
	}

	_onVideoScroll(e) {
		e.preventDefault();

		let delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

		if (delta == 1 && this.video.volume <= 0.9) this.video.volume += 0.1;
		if (delta == -1 && this.video.volume > 0.1) this.video.volume -= 0.1;
	}

	_onVideoDblClick() {
		if (document.fullscreen || document.mozFullScreen|| document.webkitIsFullScreen || document.msFullscreenElement) {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (document.webkitCancelFullScreen) {
				document.webkitCancelFullScreen();
			} else if (document.msExitFullscreen) {
				document.msExitFullscreen();
			}
		} else {
			let el = this.video;

			if (el.requestFullscreen) {
				el.requestFullscreen();
			} else if (el.mozRequestFullScreen) {
				el.mozRequestFullScreen();
			} else if (el.webkitRequestFullScreen) {
				el.webkitRequestFullScreen();
			} else if (el.msRequestFullscreen) {
				el.msRequestFullscreen();
			}
		}
	}
}
