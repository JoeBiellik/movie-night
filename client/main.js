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
			player: $('#video video'),
			controls: $('section.controls'),
			play: $('section.controls button'),
			progress: $('section.controls .progress .progress-bar')
		},
		sidebar: $('#sidebar'),
		tabs: $('nav'),
		movie: $('#sidebar > a i.fa.fa-cog'),
		leave: $('#sidebar > a i.fa.fa-sign-out'),
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
