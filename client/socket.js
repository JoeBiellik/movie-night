import io from 'socket.io-client'

export default class Socket {
	constructor() {
		this._pingInterval = 2000;
		this._latency = 0;

		this._socket = io();
		this._socket.on('connect', this._onConnected.bind(this));
		this._socket.on('latency', this._pong.bind(this));
	}

	get socket() {
		return this._socket;
	}

	get latency() {
		return this._latency;
	}

	get pingInterval() {
		return this._pingInterval;
	}

	_onConnected() {
		setInterval(() => {
			this._ping();
		}, this._pingInterval);
	}

	_ping() {
		this.socket.emit('latency', Date.now(), (time) => {
			let latency = Date.now() - time;

			if (latency != this.latency) {
				this._latency = latency;

				// TODO: Raise latencyChanged event
				//console.log(this.latency);
			}
		});
	}
	
	_pong(time, cb) {
		cb(time);
	}
}
