# SET STUDIO

A responsive nail-artist portfolio and booking-site template with an interactive, browser-only demo scheduler.

## Try the demo booking flow

Start the local site with `npm install` (first run only), then `npm start` and visit `http://localhost:3000`. Choose a service, select one of the example calendar dates and times, then preview the confirmation.

The scheduler is a front-end demo only. Dates and times are illustrative, not live availability. It does not reserve appointments, collect or store personal details, process deposits, or contact a booking provider. Connect a real scheduling provider and configure its availability and payment rules before accepting appointments.

## Project files

- `index.html` — portfolio, service menu, policies, and parallax gallery.
- `booking-demo.html` — interactive demo booking experience.
- `booking-demo.js` — demo calendar, service/time selection, and local confirmation preview.
- `booking.css` — responsive shared booking-page styles.
- `server.js` — local Express static server with security headers.
- `images/` — supplied parallax gallery photos.

`npm test` runs the static-server and demo-calendar tests.
