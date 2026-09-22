# ACCESS DENIED — barrier experience

An offline, client-side student portal for the **ACCESS DENIED** Computer Club challenge at Shobhit Institute of Engineering & Technology. Participants find the 23 September 2026 event and register, then reflect on the experience.

This version intentionally reproduces common visual accessibility barriers found in real portals. It remains functional so participants can complete the same task as in the accessible version. The barrier details are documented here for facilitators, not revealed during the participant task. The registration is a simulation: it validates in the browser and does not send or store personal details. Reflections are saved in this browser session only.

The event appears below four other campus listings. Opening its details starts a five-minute-and-one-second minimum review period. A valid registration submitted earlier stays pending with a countdown and completes automatically after that period. The start time survives a refresh in the same browser tab and is cleared when registration completes. This is a client-side event timing rule, not a real accessibility barrier or a secure time guarantee: browser tools, a changed device clock, or a previously started tab can bypass it. For each new participant, open a fresh tab or close the previous one.

## Run locally

Open `index.html` directly, or serve this folder with any static HTTP server, for example `python -m http.server 8000`, then visit `http://localhost:8000`. No build step or dependencies are required. The site works offline.

## Technologies

HTML, CSS, and plain JavaScript.

## Deployment

GitHub: https://github.com/Adarshcod/access-denied-inaccessible

Live: https://access-denied-inaccessible.vercel.app

This is an independent Vercel static project with `index.html` at its root.

## Facilitator

Press **Ctrl+Shift+A** to open or close the hidden facilitator notes. Press **Escape** to close them. The notes are not shown during the participant task.
