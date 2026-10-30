/**
 * Lily's Floral Apothecary — form handler
 * 1) Saves each submission as a row in the Google Sheet
 * 2) Emails the customer an automatic confirmation
 * 3) Notifies the shop owner
 *
 * Setup: see README.md ("Connect Google Sheets").
 */
const SHOP_NAME  = "Lily’s Floral Apothecary";
const OWNER_EMAIL = "thatohatsiselai.tpy@gmail.com";
const SHOP_PHONE = "064 743 9988";
const SHOP_LOCATION = "Four Way Mall";
const SHEET_NAME = "Enquiries";

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const name = clean(d.name), email = clean(d.email);
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return out({ ok: false, error: "invalid" });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(SHEET_NAME);
    if (!sh) {
      sh = ss.insertSheet(SHEET_NAME);
      sh.appendRow(["Timestamp", "Name", "Email", "Phone", "Interested In", "Message", "Page", "Auto-reply sent"]);
      sh.setFrozenRows(1);
      sh.getRange("1:1").setFontWeight("bold");
    }
    const row = [new Date(), name, email, clean(d.phone), clean(d.interest), clean(d.message), clean(d.page), "pending"];
    sh.appendRow(row);
    const r = sh.getLastRow();

    try { sendAutoReply(name, email, clean(d.interest), clean(d.message)); sh.getRange(r, 8).setValue("Yes"); }
    catch (err) { sh.getRange(r, 8).setValue("Failed: " + err.message); }

    try {
      MailApp.sendEmail({ to: OWNER_EMAIL, replyTo: email, subject: "New enquiry from " + name,
        body: "Name: " + name + "\nEmail: " + email + "\nPhone: " + clean(d.phone) + "\nInterested in: " + clean(d.interest) + "\n\nMessage:\n" + clean(d.message) });
    } catch (err) {}
    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

function sendAutoReply(name, email, interest, message) {
  const subject = "We’ve received your message — " + SHOP_NAME;
  const text = "Dear " + name + ",\n\nThank you for writing to " + SHOP_NAME + ". Your message has reached our apothecary and a member of our team will reply personally very soon.\n\n" +
    "Your enquiry: " + interest + "\n\"" + message + "\"\n\nIn the meantime you can reach us on " + SHOP_PHONE + " or WhatsApp, or visit us at " + SHOP_LOCATION + ".\n\nWith warm regards,\nThe team at " + SHOP_NAME;
  const html = '<div style="font-family:Georgia,serif;max-width:560px;margin:auto;background:#f3e6c8;border:3px double #8a6a2b;padding:28px;color:#3b2a14">' +
    '<h2 style="color:#6b4a0f;text-align:center;margin:0">❦ ' + SHOP_NAME + ' ❦</h2><hr style="border:0;border-top:1px solid #8a6a2b">' +
    '<p>Dear <strong>' + esc(name) + '</strong>,</p>' +
    '<p>Thank you for writing to us. Your message has reached our apothecary and a member of our team will reply personally very soon.</p>' +
    '<p style="background:#fff8e6;padding:12px;border-left:4px solid #8a1f5c"><strong>Your enquiry:</strong> ' + esc(interest) + '<br><em>“' + esc(message) + '”</em></p>' +
    '<p>Need us sooner? Call <strong>' + SHOP_PHONE + '</strong>, message us on WhatsApp, or visit us at <strong>' + SHOP_LOCATION + '</strong>.</p>' +
    '<p>With warm regards,<br><em>The team at ' + SHOP_NAME + '</em></p></div>';
  MailApp.sendEmail({ to: email, subject: subject, body: text, htmlBody: html, name: SHOP_NAME, replyTo: OWNER_EMAIL });
}

function clean(v) { return String(v || "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, 2000); }
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function doGet() { return out({ ok: true, service: SHOP_NAME }); }
