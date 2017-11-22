require('babel-polyfill');

export default class Message {
	constructor(message) {
		this._sender = message.name || null;
		this._message = message.msg || null;
		this._sent = message.sent || null;
	}

	get sender() {
		return this._sender;
	}

	get message() {
		return this._message;
	}

	get sent() {
		return this._sent;
	}

	get html() {
		if (this.sender) {
			const dt = $('<dt>').text(this.sender);
			const dd = $('<dd>').text(this.message);
			dd.html(dd.html().replace(/\n/g, '<br>'));

			if (this.sent) {
				dt.append($('<small>').text(this._formatTime(this.sent)));
			}

			return [dt, dd];
		} else {
			return $('<dt>').text(this.message);
		}
	}

	_formatTime(date) {
		if (!(date instanceof Date)) date = new Date(date);

		let hour = date.getHours();
		let minute = date.getMinutes();
		let amPm = 'am';

		if (hour >= 12) {
			hour = hour - 12;
			amPm = 'pm';
		}

		if (hour == 0) hour = 12;
		if (minute < 10) minute = '0' + minute;

		return hour + ':' + minute + amPm;
	}
}
