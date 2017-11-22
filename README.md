# Movie Night
[![License](https://img.shields.io/github/license/JoeBiellik/movie-night.svg)](LICENSE.md)
[![Release Version](https://img.shields.io/github/release/JoeBiellik/movie-night.svg)](https://github.com/JoeBiellik/movie-night/releases)
[![Dependencies](https://img.shields.io/david/JoeBiellik/movie-night.svg)](https://david-dm.org/JoeBiellik/movie-night)

Very simple [Node.js](https://nodejs.org/) web app that allows users to stream a movie and watch synchronised. Built with [Express.js](https://expressjs.com/), [Socket.io](https://socket.io/), [jQuery](https://jquery.com/), [Pug](https://pugjs.org/) and [Bootstrap 4](https://getbootstrap.com/), with [Babel](https://babeljs.io/) and [Browserify](http://browserify.org/) for client-side ES7.

## Development
1. Clone this repo:
  ```
  git clone https://github.com/JoeBiellik/movie-night.git && cd movie-night
  ```

2. Install dependencies:
  ```
  docker-compose run app npm install
  ```

3. Configure `config/default.json` with the movie URL and metadata.

4. Start the app:
  ```
  docker-compose up
  ```
