require('babel-polyfill');

import Modal from './modal';
import Settings from '../settings';

export default class MovieModal extends Modal {
	constructor(element, socket) {
		super(element);

		this._socket = socket;

		$('form', this._element).on('submit', this._submit.bind(this));

		this.disabled = false;
	}

	get urlInput() {
		return $('input#url', this._element);
	}

	get idInput() {
		return $('input#id', this._element);
	}

	get urlValue() {
		return this.urlInput.val().trim();
	}

	set urlValue(url) {
		this.urlInput.val(url);
	}

	get idValue() {
		return this.idInput.val().trim();
	}

	set idValue(id) {
		this.idInput.val(id);
	}

	set disabled(disabled) {
		$('button', this._element).prop('disabled', disabled);
	}

	set error(message = '') {
		$('h4 p', this._element).text(message);
	}

	async setMovie(url, id) {
		return await new Promise((resolve, reject) => {
			this._socket.emit('set-movie', url, id, resolve);
		});
	}

	_show(e) {
		this.error = '';
		this.disabled = false;

		this.urlValue = Settings.read('url');
		this.idValue = Settings.read('movie').id;
	}

	_shown(e) {
		this.urlInput.focus();
	}

	async _submit(e) {
		e.preventDefault();

		this.error = '';
		this.disabled = true;

		if (await this.setMovie(this.urlValue, this.idValue)) {
			this.hide();
		} else {
			this.error = 'ID lookup error!';
			this.idInput.focus();
		}

		this.disabled = false;
	}
}
