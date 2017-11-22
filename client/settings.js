require('babel-polyfill');

import lodash from 'lodash';

export default class Settings {
	static read(key, fallback = null) {
		return lodash.get(JSON.parse(localStorage.getItem('settings')), key, fallback);
	}

	static write(key, value) {
		localStorage.setItem('settings', JSON.stringify(lodash.set(JSON.parse(localStorage.getItem('settings')) || {}, key, value)));
	}

	static clear() {
		localStorage.removeItem('settings');
	}
}
