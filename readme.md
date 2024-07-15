# GraderBot Version 1

## To start

-   Clone this repo.
-   `npm install` to install dependencies.
-   `npm start` to run the server and live reload (locally)

Which will output where you can view it in the console. By defualt this will be http://localhost:2123

Currently:

2 routes, `/` and `/config`.

The root route `/` shows the paragraph of text (just 1 line right now) which gives people the options to choose from. These options are currently hardcoded in `main.js`

The `/config` route shows an example config screen. Neither options currently actually DO anything.

Items implemented as starting points:

A `storage` policy. Right now, it uses a local storage policy, so anything saved is stored to the user's browser. In the future, if we move to a static storage, then moving to that would be pretty straight forward.

A `notifications` strategy. Events are emitted, and then notifications (currently using a CDN'd version of toast) are shown.

Live Reload works for any changes to HTML, CSS, or JavaScript within the `public` directory.

Settings from the `.ENV` file are loaded.
