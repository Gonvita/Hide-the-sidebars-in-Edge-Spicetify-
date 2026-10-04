# Edge Sidebars

[English](README.md) | [Español](README.es.md)

A Spicetify extension that hides Spotify's left sidebar (Your Library) and right panel (now playing / activity).
Each panel slides in only when you move the cursor to the left or right edge of the window.

- Detects the panels by their position on screen, so it doesn't depend on class names.
- If you expand the library with its button, the panel readjusts to the new width.

## Manual installation

1. Copy `edgeSidebars.js` into your Spicetify extensions folder (`%appdata%\spicetify\Extensions` on Windows).
2. Run:

```
spicetify config extensions edgeSidebars.js
spicetify apply
```

## Settings

At the top of `edgeSidebars.js`:

- `EDGE`: how many pixels from the window edge trigger the panel.
- `KEEP`: extra margin around the panel before it closes again.

## Notes

- A panel can only be detected while it is open in Spotify. If the right panel is closed, open it and the extension will pick it up within a couple of seconds.
- Spotify updates may change its internal layout. If something stops working, please open an issue describing what you see.
