# ENERTECH FZC — Corporate Website

Static corporate website for **ENERTECH FZC**, a supply chain, engineering, and renewable energy solutions company headquartered in Sharjah, UAE.

---

## Overview

Single-page marketing website featuring a hero carousel, service showcase, about section, testimonials, and contact form. Built with vanilla HTML, CSS, and JavaScript — no build tools or frameworks required.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 |
| Styles | CSS3 (custom properties, CSS Grid, Flexbox) |
| Scripting | Vanilla JavaScript (ES5-compatible) |
| Animations | [GSAP 3.12.5](https://gsap.com/) + ScrollTrigger |
| Smooth Scroll | [Lenis 1.1.14](https://lenis.darkroom.engineering/) |
| Fonts | Sora + Manrope (Google Fonts) |

## Project Structure

```
Enertec/
├── index.html              # Main homepage
├── css/
│   └── index.css           # All styles
├── js/
│   └── index.js            # All interactions & animations
└── assets/
    └── images/
        ├── enerteclogo.png
        ├── banner1.png
        ├── banner2.png
        ├── banner3.webp
        └── servicesimages/ # 7 service card images
```

## Features

- **Hero carousel** — auto-advancing slides with dot navigation and prev/next controls
- **Smooth scroll** — Lenis-powered inertia scroll synced with GSAP's ticker
- **GSAP animations** — word-split heading reveals, blur-fade paragraphs, staggered card entries, 3D tilt on pillar cards, about image parallax
- **Bento service grid** — 7 service cards in an asymmetric 3-column layout (wide-first, wide-last)
- **Sticky header** — adds shadow on scroll
- **Mobile menu** — slide-in panel with accordion sub-navigation
- **Animated counters** — triggered on viewport entry via IntersectionObserver
- **Testimonials slider** — auto-cycling with manual controls
- **Contact form** — client-side submission with status feedback
- **Responsive** — breakpoints at 1024px and 720px

## Services Covered

1. Instrumentation & Control Systems
2. Pipes, Valves & Fittings
3. Industrial Safety & Fire Protection
4. Electrical & Heat Tracing Systems
5. Renewable Energy Solutions
6. Mechanical & Rotating Equipment
7. Industrial & Oilfield Chemical Solutions

## Getting Started

No build step needed. Open `index.html` directly in a browser, or serve with any static file server:

```bash
# Python
python -m http.server 8080

# Node (npx)
npx serve .
```

Then visit `http://localhost:8080`.

## Browser Support

Modern evergreen browsers (Chrome, Firefox, Safari, Edge). GSAP and Lenis gracefully degrade — a vanilla IntersectionObserver fallback handles reveals when GSAP is unavailable.

---

© ENERTECH FZC. All rights reserved.
