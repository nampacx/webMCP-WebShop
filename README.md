# Contoso Sports — Demo Webshop

A sample sports webshop built as a **React frontend only** — no backend services.
Everything (catalog, users, cart, checkout) runs client-side with static dummy data.

## Features

- **Catalog with search** — browse 16 dummy products, search by name/brand/category/description, filter by category, and sort by price or rating.
- **Dummy sign-in** — sign in with a demo account (no real auth). Session persists in `localStorage`.
- **Shopping cart** — add items, change quantities, remove items. Cart persists in `localStorage`. Cart & checkout require sign-in.
- **Checkout** — shipping + payment form with validation (demo only, no real payment).
- **Order confirmation** — an order summary with a generated order number.

## Demo accounts

| Email               | Password     |
| ------------------- | ------------ |
| `demo@contoso.com`  | `contoso123` |
| `jordan@contoso.com`| `sports456`  |

(Also selectable with one click on the sign-in screen.)

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Tech

- React 18 + React Router 6
- Vite
- React Context for auth and cart state
- Plain CSS (no UI framework)

## Project structure

```
src/
  components/     Navbar, ProductCard
  context/        AuthContext, CartContext
  data/           products.js, users.js  (static dummy data)
  pages/          Catalog, Login, CartPage, Checkout, OrderConfirmation
  styles/         index.css
  App.jsx         routes + protected routes
  main.jsx        app bootstrap
```

> This is a demo. No real orders are placed and no data leaves your browser.
