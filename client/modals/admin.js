require('babel-polyfill');

import Modal from './modal';
import Settings from '../settings';

export default class AdminModal extends Modal {
	constructor(element, socket) {
		super(element);

		this._socket = socket;

		$('form', this._element).on('submit', this._submit.bind(this));
	}

	get input() {
		return $('input', this._element);
	}

	get value() {
		return this.input.val().trim();
	}

	set value(name) {
		this.input.val(name);
	}

	set disabled(disabled) {
		$('button', this._element).prop('disabled', disabled);
	}

	set error(message = '') {
		$('h4 p', this._element).text(message);
	}

	async login(password) {
		let valid = await new Promise((resolve, reject) => {
			this._socket.emit('admin', password, resolve);
		});

		this._element.trigger('admin:changed', [valid]);

		return valid;
	}

	_show(e) {
		this.error = '';
		this.disabled = false;
	}

	_shown(e) {
		this.input.val('').focus();
	}

	async _submit(e) {
		e.preventDefault();

		this.error = '';
		this.disabled = true;

		if (await this.login(this.value)) {
			Settings.write('admin', this.value);

			this.hide();
		} else {
			this.error = 'Incorrect password!';
			this.value = '';
			this.input.focus();

			Settings.write('admin', null);
		}

		this.disabled = false;
	}
}
