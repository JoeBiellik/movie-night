require('babel-polyfill');

import Message from './message';

export default class Messages {
	constructor(elements, socket) {
		this._elements = elements;
		this._socket = socket;

		this._socket.on('message', this._onMessage.bind(this));
		this._elements.form.on('submit', this._onMessageSubmit.bind(this));
	}

	add(message) {
		if (typeof message === 'string') {
			message = new Message({ msg: message });
		}

		this._elements.messages.append(message.html);

		this.scroll();
	}

	scroll() {
		const el = this._elements.messages.get(0);
		el.scrollTop = el.scrollHeight;
	}

	focus() {
		$('input', this._elements.form).focus();
	}

	_onMessageSubmit() {
		const input = $('input', this._elements.form);
		const value = input.val().trim();

		if (!value) {
			input.val('').focus();

			return false;
		}

		if (value.substr(0, 1) == '/') {
			if (value.toLowerCase() == '/admin') {
				input.val('').focus();

				this._elements.form.trigger('message:admin');

				return false;
			}

			if (value.toLowerCase() == '/movie') {
				input.val('').focus();

				this._elements.form.trigger('message:movie');

				return false;
			}

			if (value.toLowerCase() == '/position') {
				input.val('').focus();

				this._elements.form.trigger('message:position');

				return false;
			}

			// if (value.toLowerCase().substr(0, 6) == '/jump ') {
			// 	const position = value.toLowerCase().substr(6);
			// 	input.val('').focus();
			//
			// 	this._elements.form.trigger('message:jump', [position]);
			//
			// 	return false;
			// }

			if (value.toLowerCase() != '/play' && value.toLowerCase() != '/pause' && value.toLowerCase().substr(0, 6) != '/jump ') {
				this.add(new Message({
					name: 'Movie Night',
					msg: 'Command not recognised, supported commands:\n/jump [time]\n/position'
				}));

				input.val('').focus();

				return false;
			}
		}

		this._socket.emit('message', value);

		input.val('').focus();

		return false;
	}

	_onMessage(message) {
		this.add(new Message(message));
	}
}
