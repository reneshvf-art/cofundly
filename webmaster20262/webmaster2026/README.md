# CoFundly

Richmond, Virginia's community resource hub — a free, verified directory of local services across food, housing, healthcare, mental health, jobs, legal aid, and more.

**Stack:** vanilla HTML / CSS / JS (no framework, no build step) with an optional Spline 3D background on the homepage.

## Getting started

Open [SETUP.md](SETUP.md) — it's the single source of truth for:

1. Running the site locally.
2. Pasting your Spline scene URL into the homepage.
3. Where to edit data, copy, and styling.
4. Troubleshooting Spline performance / readability issues.
5. The testing checklist for the homepage.

## Project structure

```
css/    design tokens + components + home-specific styles
js/     main.js, directory.js, favorites.js, suggest.js, spline.js
data/   Richmond resource dataset (orgs, events, testimonials, neighborhoods)
*.html  home, directory, programs, get-help, suggest, about, faq
```

## Important files

- [index.html](index.html) — homepage + Spline hero
- [data/resources.js](data/resources.js) — all 18 Richmond org records + 8 events
- [js/spline.js](js/spline.js) — reusable `.spline-stage` loader with fallback
- [css/main.css](css/main.css) — palette and design tokens

## Notes

Resource data uses realistic Richmond organizations for sample purposes — always verify directly before using any listed phone number or address for real services.
