# Palmar Website

A complete, free-to-host website for **Palmar Sujood Stool** — English / Malayalam / Hindi, product page, cart, Cash-on-Delivery checkout (via WhatsApp), and a chatbot widget that can also take orders.

No backend, no monthly cost — it's a static site, so GitHub Pages hosts it for free.

## What's inside

```
index.html        → homepage (hero, product, features, specs, FAQ, contact)
checkout.html      → cart checkout page
css/style.css       → all styling
js/i18n.js          → English / Malayalam / Hindi text
js/products.js      → product catalog (add more products here later)
js/main.js          → cart logic, language switching
js/chatbot.js       → chatbot widget logic
assets/             → your product photos + video
```

## How orders work (no backend needed)

There's no payment gateway — it's Cash on Delivery. When a customer checks out (from the cart page or the chatbot), the site opens **WhatsApp** with their order details (name, phone, address, items, total) already typed into a message to your business number. They just hit send. This matches how you already take orders today.

**Your WhatsApp number is set in `js/main.js`:**
```js
const WHATSAPP_NUMBER = "971561282052";
```
Change this if you want orders to go to a different number.

## 1. Put it on GitHub (free hosting)

1. Create a free GitHub account at https://github.com if you don't have one.
2. Create a new repository — e.g. `palmar-website`. Keep it **Public** (required for free GitHub Pages).
3. Upload every file in this folder to that repository, keeping the same folder structure (`css/`, `js/`, `assets/` etc.). Easiest way:
   - On the repo page, click **"Add file" → "Upload files"**, drag in everything, and commit.
   - Or, if you're comfortable with git:
     ```
     git init
     git add .
     git commit -m "Palmar website"
     git branch -M main
     git remote add origin https://github.com/<your-username>/palmar-website.git
     git push -u origin main
     ```
4. In the repository, go to **Settings → Pages**.
5. Under "Build and deployment", set **Source = Deploy from a branch**, **Branch = main**, folder = `/ (root)`. Save.
6. After a minute, GitHub shows your live URL, e.g. `https://<your-username>.github.io/palmar-website/`.

## 2. Connect your own domain

1. In **Settings → Pages → Custom domain**, type your domain (e.g. `www.palmar.com` or `palmar.com`) and save. This creates a `CNAME` file in your repo automatically — you can also edit the `CNAME` file already included here with your domain name.
2. At your domain registrar (GoDaddy, Namecheap, etc.), add these DNS records:
   - For a subdomain like `www.palmar.com`: a **CNAME** record pointing `www` → `<your-username>.github.io`
   - For the bare domain `palmar.com`: four **A** records pointing to GitHub's IPs:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
3. Back in GitHub Pages settings, tick **Enforce HTTPS** once it becomes available (can take a few hours after DNS is set).

## 3. Editing content later

- **Price / product text** — edit `js/products.js` (price) and `js/i18n.js` (all wording, in three languages).
- **Photos/video** — replace files in `assets/` (keep the same filenames, or update the paths in `index.html` / `js/products.js`).
- **Add a new product** — add an entry to the `PRODUCTS` array in `js/products.js`, add its translation keys in `js/i18n.js`, and duplicate the product section markup in `index.html`.
- **WhatsApp number** — `WHATSAPP_NUMBER` at the top of `js/main.js`.

## Notes

- The chatbot is a simple guided-menu bot (not AI-powered) — since this is a free static site with no server, it can't call a paid AI API. It answers price/delivery FAQs and walks a customer through placing an order, then hands off to WhatsApp for confirmation — exactly like your current WhatsApp order flow.
- Orders are also saved in the customer's own browser (`localStorage`) as a lightweight backup, but WhatsApp is the real order channel — always confirm there.
- Everything is plain HTML/CSS/JS — no build step, no npm install needed.
