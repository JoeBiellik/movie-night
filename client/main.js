require('babel-core/register');

import App from './app'

$(window).load(function() {
	new App({
		loading: {
			page: $('#page-loader'),
			message: $('#page-loader p')
		},
		modals: {
			name: $('#modalName'),
			admin: $('#modalAdmin')
		},
		video: {
			container: $('#video'),
			player: $('#video video')
		},
		tabs: $('nav'),
		leave: $('#sidebar > a'),
		users: {
			count: $('nav .label'),
			list: $('#users dl')
		},
		chat: {
			form: $('#chat form'),
			messages: $('#chat dl')
		},
		info: {
			title: $('#info #info-title'),
			year: $('#info #info-year'),
			director: $('#info #info-director'),
			desc: $('#info p em'),
			poster: $('#info img')
		}
	});
});
