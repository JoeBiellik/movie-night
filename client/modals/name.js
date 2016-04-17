import Modal from './modal'
import Settings from '../settings'

export default class NameModal extends Modal {
	constructor(element, socket) {
		super(element);

		this._socket = socket;

		this._element.on('shown.bs.modal', this._shown.bind(this));
		$('form', this._element).on('submit', this._submit.bind(this));

		this.disabled = false;
	}

	get value() {
		return $('input', this._element).val().trim();
	}

	set value(name) {
		$('input', this._element).val(name);
	}

	set disabled(disabled) {
		$('button', this._element).prop('disabled', disabled);
	}

	set error(message = '') {
		$('h4 p', this._element).text(message);
	}

	_shown(e) {
		let input = $('input', this._element);
		let val = input.val();
		input.focus().val('').blur().focus().val(val);
	}

	_submit(e) {
		this.error = '';
		this.disabled = true;

		this._socket.emit('set-name', this.value, (valid) => {
			Settings.write('name', this.value);

			this.disabled = false;

			if (valid) {
				this._element.trigger('name:changed', [this.value]);

				this.hide();
			} else {
				this.error = 'Invalid username!';
			}
		});

		return false;
	}
}
