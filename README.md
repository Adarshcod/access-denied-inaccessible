# ACCESS DENIED — barrier experience

An offline, client-side student portal for the **ACCESS DENIED** Computer Club challenge at Shobhit Institute of Engineering & Technology. Participants find the 23 September 2026 event and register, then reflect on the experience.

This version intentionally reproduces common visual accessibility barriers found in real portals. It remains functional so participants can complete the same task as in the accessible version. The barrier details are documented here for facilitators, not revealed during the participant task. The registration is a simulation: it validates in the browser and does not send or store personal details. Reflections are saved in this browser session only.

The event appears below four other campus listings, with no event search or category filter, no visual highlight, and a vague **More** action. Opening its details starts a five-minute-and-one-second minimum review period. A valid form advances to a review step, but the final **Submit registration** button stays disabled until the period ends; no registration is submitted automatically. A page refresh starts a new timed attempt, so a previous participant's countdown cannot carry over. This is a client-side event timing rule, not a real accessibility barrier or a secure time guarantee: browser tools can still alter it.

The form asks participants to re-enter their email and match the venue, start time, and reference shown elsewhere on the page. It does not ask for the event name or date. Wrong answers receive the same vague validation message as the original fields. These extra checks add task friction; they are not a model for a real registration form. No entered registration details are sent or stored.

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
