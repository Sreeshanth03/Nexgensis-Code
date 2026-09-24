# Product Admin Dashboard

Next.js admin dashboard for DummyJSON products. Users log in, then search, filter, paginate, and manage products with Axios.

**Demo login:** `emilys` / `emilyspass`

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Optional: slow API (race-condition test)

Copy `.env.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_DUMMYJSON_DELAY=2000
```

Restart the dev server. Type quickly in search. Older responses are aborted/ignored so they cannot overwrite newer results.

```bash
npm run build
npm start
```

## What is finished

- [x] Login page (`POST /auth/login`) with error messages for wrong details
- [x] Product pages require a session; logout button clears it
- [x] Product list: image, title, category, price, rating, stock
- [x] Table on desktop, cards on mobile
- [x] Pagination from the API (`limit` + `skip`), page numbers, Previous/Next, page size 10/20/50, “Showing 21–40 of 194”
- [x] Debounced search via `/products/search?q=` (resets to page 1)
- [x] Category filter from `/products/categories`
- [x] Sort by price, rating, or title
- [x] Product details at `/products/[id]` (images, description, price, reviews)
- [x] Not-found UI for a bad id
- [x] Add / edit form with validation
- [x] Delete confirm popup
- [x] Loading, empty, and error + Retry states
- [x] One shared Axios instance: token on every request, centralized errors
- [x] Page, search, filter, and sort stored in the URL
- [x] No React Query, SWR, or table/pagination libraries
- [x] Small components; API calls live in `lib/`, not in UI files
- [x] Invalid query values (`page=abc`, `page=999`) do not crash the page
- [x] Rapid Login/Save clicks send only one request at a time

## Design choices

### Search vs category

DummyJSON cannot search and filter by category in one request. **Search wins.** If `q` is present, the app calls `/products/search` and disables category. Filtering search results on the client would break server-side `total` and pagination. The UI states this so the behavior is not a silent bug.

### Add / edit / delete are not persisted by DummyJSON

The app still calls `POST /products/add`, `PUT /products/:id`, and `DELETE /products/:id`. DummyJSON returns fake success and does not save data. A local overlay in `localStorage` (`lib/local-products.ts`) stores created items, patches, and deleted ids, then merges them into list and detail views after each fetch. Refresh in the same browser still shows those changes.

### Auth token

Login stores `accessToken` in `localStorage`. The Axios request interceptor attaches `Authorization: Bearer <token>`. A 401 clears the session and sends the user to `/login`.

## One problem and how it was fixed

Fast typing plus a slow API (`delay=2000`) can return old search results after newer ones. Fix: debounce 400ms, `AbortController` on each fetch, and a request sequence number. Aborted or stale responses never call `setProducts`.

## Where AI helped

AI helped scaffold the Next.js file layout, DummyJSON query params, and Tailwind structure. The race-condition handling, URL sanitizing, search-vs-category rule, and local overlay were written to match the assignment and should be walk-through-ready line by line.
## Deployment
The application is deployed on Vercel.

- **Live Demo:** https://productadmindashboard-henna.vercel.app/products
- **Framework:** Next.js
- **Build Command:** `npm run build`
- **Deployment Platform:** Vercel

The project is connected to GitHub and can be automatically deployed through Vercel.
