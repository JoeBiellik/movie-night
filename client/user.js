require('babel-polyfill');

import Settings from './settings'

export default class User {
	constructor(socket, opts = {}) {
		this._socket = socket;
		this._admin = false;
	}

	async getName() {
		return Settings.read('name') || await new Promise((resolve, reject) => {
			this._socket.emit('get-name', resolve);
		});
	}

	async setName(name) {
		if (await new Promise((resolve, reject) => {
			this._socket.emit('set-name', name, resolve);
		})) {
			Settings.write('name', name);

			return true;
		}

		return false;
	}

	get admin() {
		return this._admin;
	}

	set admin(admin) {
		this._admin = Boolean(admin);
	}
}
