export default class Modal {
	constructor(element) {
		this._element = element;
		this._visible = false;

		this._element.on('show.bs.modal', this._show.bind(this));
		this._element.on('shown.bs.modal', this._shown.bind(this));
		this._element.on('hide.bs.modal', this._hide.bind(this));
		this._element.on('hidden.bs.modal', this._hidden.bind(this));
	}

	show() {
		if (this.visible) return;

		this._element.modal('show');
		this._visible = true;
	}

	hide() {
		if (!this.visible) return;

		this._element.modal('hide');
		this._visible = false;
	}

	get visible() {
		return this._visible;
	}

	_show(e) { }

	_shown(e) { }

	_hide(e) { }

	_hidden(e) {
		this._visible = false;
	}
}
