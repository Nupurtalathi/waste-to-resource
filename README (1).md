# Waste to Resource — Circular Marketplace

A front-end-only marketplace where industries list **waste materials** (fly ash, slag, e-waste, etc.) and buyers post **material requirements**, so waste can be matched to reuse. Everything runs in the browser and saves to `localStorage` — no backend, no build step.

## Project structure

```
waste-marketplace/
├── index.html   # Page structure: public site, user dashboard, login/signup and detail modals
├── style.css    # All styling (green/orange theme, responsive layouts)
├── script.js    # All logic: auth, listings, filters, compare, charts, analytics
└── README.md
```

## How to run

1. Keep the three files (`index.html`, `style.css`, `script.js`) in the **same folder**.
2. Double-click `index.html` to open it in a browser (Chrome, Edge, Firefox, Safari).
   - Optional local server: `python -m http.server 8000` and open `http://localhost:8000`.

No installs or internet connection required.

## App flow

```
Public marketplace ──► Browse / search / filter / compare ──► View listing detail
        │
        └─► Sign up / Login ──► Dashboard ──► Create / Edit / Delete listings
                                     │
                                     └─► Overview analytics (charts update live)
```

### 1. Public marketplace (no login needed)
- **Hero** shows live counts: total listings, waste available, buyer requirements.
- **Marketplace** lists all listings as cards. On first load, **10 demo listings** are seeded automatically.
- **Tabs**: All / Waste available / Buyer requirements.
- **Search + sort** and filters for material, location, quantity, price, purity, element, buyer, seller, grade and status.
- **Compare**: tick the checkbox on exactly **two** cards, then open the compare tray at the bottom to see a side-by-side table and bar charts (price, purity, quantity, estimated value).
- **View details**: opens a modal with full info, price/buyer/composition charts, and a **Make offer** action (prompts for ₹/kg and sets status to *Negotiating*).

### 2. Sign up / Login
- Click **Login** or **Get started** → switch between *Login* and *Create account*.
- Accounts and the active session are stored in `localStorage`.
- After login, the site switches to the dashboard.

### 3. User dashboard (sidebar panels)
| Panel | What it does |
|---|---|
| **Overview** | Stat cards, price trend, category split, composition, buyer/demand charts, top locations, recent activity |
| **My waste** | Your waste listings with View / Edit / Delete |
| **My buyer needs** | Your buyer requirements with View / Edit / Delete |
| **Create listing** | Form to publish a waste listing or buyer requirement |
| **Profile** | Your name and email |

### 4. Creating a listing
1. Go to **Create listing** (or use a "post" shortcut button).
2. Choose type: *Waste available* or *Buyer requirement*.
3. Fill title, material, quantity (tons), location, application, price (₹/kg), purity, grade, status, verification, collection date, recovered/landfill figures, capacity, element composition (%), and description.
4. Click **Publish listing**. It appears instantly on the public marketplace and in all dashboard charts.
5. To change it, use **Edit** on your listing (you can only edit/delete your own).

## How to use it (quick walkthrough)

1. Open `index.html` and browse the demo listings.
2. Try the search, tabs and filters; compare two listings; open a listing's details.
3. Click **Get started** and create an account.
4. Post a waste listing or buyer requirement from the dashboard.
5. Check **Overview** — charts and totals now include your data.
6. Log out to return to the public marketplace.

## Data & storage

| localStorage key | Contents |
|---|---|
| `wtr_users_v2` | Registered users |
| `wtr_session_v2` | Logged-in user id |
| `wtr_listings_v2` | All listings |
| `wtr_demo_seed_v1` | Flag that demo data was already seeded |

- Data lives **only in your browser**. Clearing site data or switching browser/device resets it.
- **Reset the app**: open DevTools → Console and run `localStorage.clear(); location.reload()`.
- Changes made in one tab sync to other open tabs automatically.

## Important notes

- **Not production-ready security**: passwords are stored in plain text in `localStorage`, and there is no server. This is a demo/prototype. For real use, add a backend (auth with hashed passwords, a database, and API routes).
- Prices are in ₹/kg; quantities are in tons. "Estimated value" = quantity × price × 1000.
- Charts are lightweight custom SVG/CSS — no external libraries.

## Customizing

- **Colors/theme**: edit the CSS variables at the top of `style.css` (`--green`, `--orange`, `--bg`, …).
- **Demo data**: edit the `ensureDemoListings()` function in `script.js`.
- **Filters/fields**: add inputs in `index.html` and read them in `createListing()` / `renderMarketplace()` in `script.js`.
