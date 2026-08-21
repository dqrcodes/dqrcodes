# QR Studio

A modular, browser-first QR Code Generator built with HTML5, CSS3, vanilla ES6 JavaScript, Bootstrap 5 and QR Code Styling.

## Run
Open `index.html` in a modern browser. Internet access is required for the CDN-loaded Bootstrap, Icons and QR Code Styling library.

For local development, a simple static server is recommended:
`python -m http.server 8000`
Then open `http://localhost:8000`.

## Features
- 200 QR use cases across 13 categories
- Dynamic QR forms
- URL, text, email, phone, SMS, Wi-Fi, vCard, UPI, location and event payloads
- Live customization
- Logo support
- PNG/JPEG/WebP downloads
- Print/copy/share
- Local project history and favorites
- Batch CSV validation and local project creation
- Search, categories, templates
- Responsive UI and dark mode

## Important
This is a frontend-only static QR implementation. It does not provide dynamic QR redirects, server-side analytics, payment verification, authentication, cloud sync or backend contact-form delivery.

## Add a QR type
Edit `assets/js/qr-types.js`, add a registry entry, then update the encoder/form logic in `assets/js/generator.js` if the payload needs a specialized format.

## Future backend
A backend can add user accounts, dynamic redirect IDs, scan analytics, cloud projects and server-side API endpoints.
