# Edge Sidebars

[English](README.md) | **Español**

Extensión de Spicetify que oculta la biblioteca (izquierda) y el panel de información (derecha) de Spotify.
Cada panel aparece solo cuando llevas el cursor al borde izquierdo o derecho de la ventana.

- Detecta los paneles por su posición, sin depender de nombres de clase.
- Si amplías la biblioteca con su botón, el panel se reajusta al nuevo ancho.

## Instalación manual

1. Copia `edgeSidebars.js` a la carpeta de extensiones (`%appdata%\spicetify\Extensions` en Windows).
2. Ejecuta:

```
spicetify config extensions edgeSidebars.js
spicetify apply
```

## Ajustes

Al inicio de `edgeSidebars.js`:

- `EDGE`: píxeles del borde que activan el panel.
- `KEEP`: margen extra antes de que el panel se cierre.
