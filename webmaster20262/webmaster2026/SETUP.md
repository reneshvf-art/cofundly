# CoFundly — Setup & Manual Steps

Richmond, Virginia community resource hub.
Vanilla HTML / CSS / JS static site with optional Spline 3D background.

---

## What's in this project

```
webmaster2026/
├── index.html            ← Home with Spline hero + Richmond highlights
├── directory.html        ← Searchable directory w/ neighborhood filter
├── programs.html         ← Events & programs calendar
├── get-help.html         ← Emergency / crisis resources
├── suggest.html          ← Submission form
├── about.html            ← Mission, team, partners
├── faq.html              ← FAQ + contact form
├── css/
│   ├── main.css          ← Design tokens + typography + utilities
│   ├── components.css    ← Nav, buttons, cards, forms, modal, footer
│   └── home.css          ← Hero, Spline stage, highlights, stats
├── js/
│   ├── main.js           ← Theme toggle, nav, a11y bar, stats
│   ├── directory.js      ← Search, filter, modal
│   ├── favorites.js      ← Saved resources (localStorage)
│   ├── suggest.js        ← Form validation
│   └── spline.js         ← Reusable Spline loader + fallback ⭐
├── data/
│   └── resources.js      ← Richmond dataset (18 orgs, 8 events, 3 quotes)
└── SETUP.md              ← You are here
```

---

## 1. How to run it

No build step. No npm install. No framework.

Easiest:

1. Open the project folder in **VS Code**.
2. Install the **Live Server** extension (by Ritwick Dey) if you don't already have it.
3. Right-click `index.html` → **Open with Live Server**.
4. Site opens at `http://127.0.0.1:5500/index.html`.

You can also just double-click `index.html` to open in a browser, but the Spline viewer loads over HTTPS from a CDN, so a local server (Live Server, `python -m http.server`, etc.) works better.

---

## 2. Spline 3D — step-by-step setup

The homepage has a Spline background **stage** behind the hero. While you don't have a scene URL pasted in, the site automatically uses a beautiful animated gradient fallback — so everything works out of the box. You can ship without a Spline scene.

### 2a. Create (or pick) a Spline scene

1. Go to **https://spline.design** and sign up (free).
2. You have two options:

   **Option A — Use a community template (fastest):**
   - Go to the Spline **Community** page.
   - Search for something atmospheric: _"abstract 3D,"_ _"liquid,"_ _"gradient orbs,"_ _"floating shapes,"_ _"particles."_
   - Open a scene you like → click **"Remix"** → it opens in the editor under your account.

   **Option B — Build your own:**
   - Click **"New File"** in Spline → make something simple. Less is more for a background: a couple of abstract shapes with slow rotation and navy/orange materials looks premium without being distracting.

3. Tune colors to match CoFundly's palette:
   - Navy: `#1E3A5F`
   - Orange: `#F97316`
   - Background / soft: `#F8FAFC`

4. Keep it **calm**. Slow motion, low contrast, minimal shapes. The hero text sits on top — busy 3D fights with it.

### 2b. Get the scene URL

1. In Spline, click the **Export** button (top-right in the editor).
2. Choose **"Code Export"** tab → **"Viewer"** option.
3. Copy the scene URL. It looks like:
   ```
   https://prod.spline.design/abc123XYZ456/scene.splinecode
   ```
   It must end in `.splinecode` (not `.spline` or `.glb`).

### 2c. Paste it into the site

1. Open [index.html](index.html).
2. Find this block (around line 85):

   ```html
   <div class="spline-stage"
        data-spline-scene="PASTE_YOUR_SPLINE_SCENE_URL_HERE"
        data-spline-mobile="off"
        role="presentation">
   </div>
   ```

3. Replace `PASTE_YOUR_SPLINE_SCENE_URL_HERE` with the URL you copied. Keep the quotes.

4. Save. Refresh the browser. Spline loads in the hero.

### 2d. Optional: add Spline elsewhere

The `<div class="spline-stage" data-spline-scene="...">` component is fully reusable. Paste it anywhere you want a 3D background. Good additional candidates (**keep it tasteful**):

- **About page mission strip.** A subtle abstract scene behind the navy mission quote could look premium. Add a second `.spline-stage` inside `.mission-strip::before` region.
- **CTA banner on the home page.** There's a `.spline-accent` placeholder already positioned inside `.cta-banner` — paste a short, moody scene there for a final visual beat before the footer.

**Do not add Spline to the directory page, form pages, or FAQ.** Those pages prioritize readability and speed.

---

## 3. What I did for you (already done)

Everything below is already integrated — no action needed.

- **Rebranded** entire site from "CommonBridge / Grove City, OH" → **"CoFundly / Richmond, VA."**
- **Updated color palette** to the locked navy/orange spec in `css/main.css:9`:
  - Primary `#1E3A5F`, Slate `#334155`, Background `#F8FAFC`, Card `#FFFFFF`, Accent `#F97316`, Accent hover `#EA580C`, Text `#0F172A`, Muted `#475569`, Border `#E2E8F0`.
- **Richmond-localized dataset** in `data/resources.js`: 18 verified-style orgs (Feed More, Homeward, Daily Planet, Peter Paul RVA, CVLAS, YWCA Richmond, McShin Foundation, Sacred Heart Center, Nationz, Senior Connections, ChildSavers, GRTC CARE, etc.), 8 Richmond events, 3 Richmond testimonials, 12 neighborhoods (The Fan, Carytown, Church Hill, Shockoe Bottom, Scott's Addition, Southside, Jackson Ward, Manchester, Northside, East End, West End, Citywide).
- **Neighborhood filter** added to the directory sidebar.
- **Spline integration** ([js/spline.js](js/spline.js)):
  - Uses the official `@splinetool/viewer` web component (loaded from CDN — no npm).
  - Respects `prefers-reduced-motion`.
  - Skips Spline entirely on mobile (< 768px) by default for performance.
  - Respects `Save-Data` header for users on metered connections.
  - 12-second load timeout — if Spline hangs, the fallback gradient takes over automatically.
  - Emits runtime fallback state so you can style it (see `.spline-stage--fallback`).
- **Fixed broken pages**: the original `about.html` and `faq.html` both referenced CSS variables that were never defined (`--radius`, `--bg-subtle`, `--text-primary`, `--font-sans`, etc.) — effectively broken. Both are rewritten to use the correct CoFundly design system.
- **Legacy migration**: old `cb_favorites`, `cb_theme`, and `cb_fontsize` localStorage keys automatically migrate to `cf_*` on first load, so returning visitors don't lose their saved resources.

---

## 4. Files you may want to edit manually

| What you want to change          | File                                             | Where                       |
|-----------------------------------|--------------------------------------------------|-----------------------------|
| Spline scene URL                  | [index.html](index.html)                         | `data-spline-scene` attr    |
| Color palette                     | [css/main.css](css/main.css)                     | `:root` block, ~line 10     |
| Richmond orgs / events / quotes   | [data/resources.js](data/resources.js)           | Full file                   |
| Add a new neighborhood            | [data/resources.js](data/resources.js)           | `NEIGHBORHOODS` array       |
| Homepage hero copy                | [index.html](index.html)                         | `.hero-content` block       |
| Emergency phone numbers           | [get-help.html](get-help.html) + footer in each page | `.help-bar` / `.footer-emergency` |
| Form submission endpoint          | [js/suggest.js](js/suggest.js)                   | Currently demo-only — swap in real POST |

---

## 5. Troubleshooting the Spline hero

### "The homepage feels too busy / fighting the text"

- Open [index.html](index.html) and change `data-spline-mobile="off"` → **remove** or dial the scene back in Spline.
- Or make the overlay stronger: open [css/home.css](css/home.css) `.hero-overlay` selector (~line 32) and increase the first `rgba()` value, e.g.
  ```css
  rgba(248,250,252,0.96) → rgba(248,250,252,0.99)
  ```
- Or swap to a simpler scene in Spline (fewer shapes, more gradient, less motion).

### "Mobile performance is bad"

By default mobile is already set to skip Spline (`data-spline-mobile="off"`). If it still feels slow, the culprit is probably the Spline scene itself being too heavy — not the loader. Fixes:

- In Spline, reduce the polygon count of each object.
- Remove any physics or complex lighting.
- Bake materials instead of using dynamic reflections.

You can also completely disable Spline in one step: set `data-spline-scene=""` in [index.html](index.html). The animated gradient fallback ships looking premium on its own.

### "Text becomes hard to read over the Spline background"

Three knobs, in order of strength:

1. **Increase overlay opacity** — `.hero-overlay` in [css/home.css](css/home.css), bump the first gradient stop from `0.96` → `0.98`.
2. **Push Spline further back / darken** — adjust the vignette values in the same `.hero-overlay` rule.
3. **Move Spline to one side** — the stage already uses `clip-path`–free positioning so text on the left stays readable. If you're still struggling, consider picking a Spline scene with empty space on the left half; the overlay is designed for that.

### "Scene won't load at all"

Open DevTools (F12) → Console. Look for:

- **`data-spline-fallback="no-scene"`** on the stage → you didn't paste a URL, or it still has the placeholder.
- **`data-spline-fallback="mobile-skip"`** → you're on a narrow viewport; this is expected.
- **`data-spline-fallback="timeout"`** → the `.splinecode` file is loading but is too heavy. Simplify the scene in Spline.
- **`data-spline-fallback="viewer-error"` or `script-error`** → the scene URL is wrong, private, or the CDN is blocked by an ad-blocker / corporate proxy. Double-check the URL ends in `/scene.splinecode`.

### "I want the animated gradient fallback everywhere, no Spline"

Leave `data-spline-scene="PASTE_YOUR_SPLINE_SCENE_URL_HERE"` unchanged (or set to empty). The fallback is permanent until a real URL is provided.

### "I want to move the Spline scene to a different page"

Copy this entire block into any page's hero section (before the content):

```html
<div class="hero-spline-stage" aria-hidden="true">
  <div class="spline-stage"
       data-spline-scene="YOUR_URL"
       data-spline-mobile="off"></div>
</div>
<div class="hero-overlay" aria-hidden="true"></div>
```

Make sure the parent section has `position: relative; overflow: hidden;` and content has `z-index: 2` above the overlay. Then add `<script src="js/spline.js"></script>` before `</body>`.

---

## 6. Testing checklist (before calling the homepage finished)

Run through these before you call it done:

- [ ] Home loads in **under 3 seconds** on broadband.
- [ ] Hero text is **readable** at rest (no flicker, no contrast issues).
- [ ] Spline scene loads and animates smoothly on **desktop**.
- [ ] On a phone, Spline is **absent** and the floating-card fallback looks polished.
- [ ] Dark mode toggle works and keeps the Spline + overlay readable.
- [ ] Hero search → pressing Enter redirects to `directory.html?q=…` with the search prefilled.
- [ ] Directory neighborhood dropdown filters correctly (e.g., "Church Hill" shows Peter Paul + ChildSavers).
- [ ] Category chips on directory page recolor correctly.
- [ ] Click any resource card → modal opens with phone / email / address.
- [ ] Heart a resource → refresh → it's still there (localStorage persistence).
- [ ] Suggest a Resource form validates empty required fields.
- [ ] FAQ search filters questions as you type.
- [ ] Emergency links in the red help-bar dial real numbers on mobile (988, Homeward).
- [ ] Tab through the page with keyboard only — all buttons/links reachable and visible.
- [ ] Screen reader passes basic test (VoiceOver / NVDA reads hero heading, skip link works).
- [ ] `prefers-reduced-motion: reduce` in OS settings → Spline is skipped, site still looks good.

---

## 7. What's intentionally NOT built yet

- **AI assistant / chatbot** — deferred per your instruction. The site is structured so it can be dropped in later (floating button in bottom-right has plenty of z-index room).
- **Real form submission backend** — [js/suggest.js](js/suggest.js) and the contact form in [faq.html](faq.html) are wired up but POST to nothing. Swap in Formspree, Netlify Forms, or your own endpoint when you're ready.
- **Real-time resource availability** (e.g., "Feed More: open now / waitlisted") — would require API hooks per organization; deferred.

---

## 8. Where the Spline component is reusable

The `SplineStage` is just a div with two data attributes. That's on purpose — you can drop it anywhere:

```html
<!-- Minimal usage -->
<div class="spline-stage" data-spline-scene="YOUR_URL"></div>

<!-- Force Spline on mobile too (not recommended unless scene is very light) -->
<div class="spline-stage"
     data-spline-scene="YOUR_URL"
     data-spline-mobile="on"></div>
```

[js/spline.js](js/spline.js) automatically mounts any `.spline-stage[data-spline-scene]` on DOMContentLoaded. You don't have to call anything manually.

Good additional spots (subtle, tasteful):

- **About mission strip** ([about.html](about.html), inside `.mission-strip`).
- **Home CTA banner** ([index.html](index.html), inside `.cta-banner` using the `.spline-accent` slot).

Bad spots (avoid):

- Directory cards page (readability + scanability matter).
- Form pages (visual noise distracts from filling fields).
- FAQ (users are reading, not admiring).

---

## 9. Questions?

Everything here is hand-editable plain HTML / CSS / JS — no framework magic. If you want to change a heading, open the file, change the text. That was the whole point of sticking with the existing stack.
