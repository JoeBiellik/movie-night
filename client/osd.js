require('babel-polyfill');

export default class Osd {
	static setup(parent) {
		this._parent = parent;
		this._element = $('<span>', { id: 'osd' }).hide();
		this._parent.after(this._element);
	}

	static display(message, timeout = 500) {
		this._element.stop(true, true).text(message).show().delay(timeout).fadeOut(300);
	}
}
