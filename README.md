# Gikpik

Landing page for **Gikpik**, a software development and business automation studio.
*Geek thinking. Peak solutions.*

Live: https://rakibulx33.github.io/gikpik/

## What is here

A static site with no build step: plain HTML, CSS and a small amount of JavaScript.

```
index.html          the page
css/styles.css      all styles (tokens at the top of the file)
js/main.js          filters, tabs, altitude rail, brief form
assets/brand/       logo mark (SVG), favicon, app icons, social image
assets/fonts/       Chakra Petch and Hanken Grotesk, self-hosted
404.html            not-found page
```

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Notes

- The mark in `assets/brand/mark.svg` is a vector redraw of the supplied logo artwork. Swap in the original vector file if you have one.
- The contact form opens the visitor's email app with the brief filled in, so it works on static hosting. To receive briefs without that step, connect a form service and replace the `submit` handler in `js/main.js`.
- Project descriptions follow the public portfolio at https://rakibulx33.me. Private repositories are described without code.
- Update the `og:image` and canonical URLs in `index.html` when the site moves to its own domain.
