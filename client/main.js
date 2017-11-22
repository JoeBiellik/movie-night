require('babel-polyfill');

import App from './app';

$(() => {
	new App({
		loading: {
			page: $('#page-loader'),
			message: $('#page-loader p')
		},
		container: $('main'),
		modals: {
			name: $('#modalName'),
			admin: $('#modalAdmin'),
			movie: $('#modalMovie')
		},
		video: {
			container: $('#video'),
			player: $('#video video')
		},
		sidebar: $('#sidebar'),
		tabs: $('nav'),
		leave: $('#sidebar > a'),
		users: {
			count: $('nav .badge'),
			list: $('#users dl')
		},
		chat: {
			form: $('#chat form'),
			messages: $('#chat dl')
		},
		info: {
			title: $('#info #info-title'),
			year: $('#info #info-year'),
			runtime: $('#info #info-runtime'),
			desc: $('#info p em'),
			poster: $('#info img')
		}
	});
});
