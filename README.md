# Lily's Floral Apothecary — Website

A fully responsive 5-page website (phone, tablet, desktop). Theme: medieval fantasy apothecary with neon accents.

## Files
- `index.html` Home · `about.html` · `services.html` · `gallery.html` · `contact.html`
- `css/style.css` · `js/main.js`
- `google-apps-script/Code.gs` — saves form data to Google Sheets and sends the automatic reply

## View locally
Double-click `index.html`. No build step needed.

## Connect Google Sheets + automatic reply (5 minutes)
1. Create a new Google Sheet (e.g. "Lily's Enquiries").
2. Menu **Extensions → Apps Script**. Delete any code and paste in everything from `google-apps-script/Code.gs`. Save.
3. Click **Deploy → New deployment → type: Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click Deploy and **authorise** when asked (it needs Sheets + Gmail send permission).
4. Copy the **Web app URL**.
5. Open `js/main.js` and paste it into `const SHEET_WEBAPP_URL = "";` at the top.
6. Upload the site folder to any host (Netlify, GitHub Pages, etc.).

Each submission then adds a row to the "Enquiries" sheet, emails the customer an automatic confirmation, and notifies you.
If you edit `Code.gs` later, use **Deploy → Manage deployments → Edit → New version**.
Google limits free Gmail accounts to about 100 automated emails per day.

## Customising
- Prices/services: edit `services.html`.
- Gallery: replace an SVG inside a `<figure class="gal-item">` with `<img src="images/photo.jpg" alt="...">`.
- WhatsApp number: search `27647439988` in the HTML files.
- Colours: variables at the top of `css/style.css`.
