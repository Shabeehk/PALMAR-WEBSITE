/**
 * Palmar — order sheet receiver
 *
 * Paste this into Extensions → Apps Script in your Google Sheet,
 * then Deploy → New deployment → Web app
 *   Execute as: Me
 *   Who has access: Anyone
 * Copy the Web app URL and put it in js/main.js as SHEET_ENDPOINT.
 */

var HEADERS = [
  "DATE", "Order ID", "Name", "Address", "Post", "Pin code",
  "Taluk", "District", "State", "Phone", "Item(s)", "Amount",
  "Payment", "Paid mark", "Received at"
];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // write the header row once
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    var d = JSON.parse(e.postData.contents);

    sheet.appendRow([
      d.date || "",
      d.orderId || "",
      d.name || "",
      d.address || "",
      d.post || "",
      d.pincode || "",
      d.taluk || "",
      d.district || "",
      d.state || "",
      d.phone || "",
      d.items || "",
      d.amount || "",
      d.payment || "",
      d.paidMark || "",
      new Date()
    ]);

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput("Palmar order endpoint is running.");
}
