export default class Modal {
	constructor(element) {
		this._element = element;
		this._visible = false;
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
}
