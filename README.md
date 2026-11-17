# Decision Switch

A simple, responsive yes-or-no random picker for everyday decisions.

Type a question, select **Make a random pick**, and the app returns **YES** or **NO**. You can also make a pick without entering a question. Your recent questions and results appear in the history panel.

## Run it

No installation, account, API key, server, or build step is required.

1. Download or clone this repository.
2. Open `index.html` in a modern web browser.
3. Type an optional question and select **Make a random pick**.

The app can also be hosted as a static website using GitHub Pages.

## Publish with GitHub Pages

1. Open **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select the `main` branch and `/ (root)`, then save.
4. GitHub Pages will publish the app at `https://razorjetinz.github.io/decision-switch/`.

## Privacy

Questions and decision history are saved in the browser's local storage on the device where the app is used. The app does not send this information to a server or over the internet. There is no account, analytics, external API, or remote font dependency. The **Clear all** control removes the saved decision history from this browser.

As with other browser-local data, clearing the browser's site data or using a different browser/profile/device may remove or separate the saved history.

## Technology

- HTML
- CSS
- Vanilla JavaScript
- Browser Web Crypto API for random selection when available
- `localStorage` for on-device history

## Licence

MIT. See [LICENSE](LICENSE).