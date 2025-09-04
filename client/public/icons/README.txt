This folder should contain PWA icon PNGs used by manifest.json.
Place icons with these exact names and sizes:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

Recommended: generate maskable icons too (same PNGs work). Use tools like:
- https://app-manifest.firebaseapp.com/
- https://realfavicongenerator.net/
- https://github.com/antfu/pwa-asset-generator

Place the PNGs in this folder and commit before building for production to ensure installability and correct icons on home screens.

Local helper:
You can generate PNGs from the included SVGs using the `generate-pngs.sh` script (needs rsvg-convert or ImageMagick `convert`):

	cd client/public/icons
	./generate-pngs.sh

Then commit the generated PNG files.
