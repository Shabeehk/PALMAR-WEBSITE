// Palmar — product catalog
// Add products here, or use admin.html to generate a new version of this file.
const PRODUCTS = [
  {
    id: "palmar-sujood-stool",
    nameKey: "product.title",          // translated via i18n.js
    name: "Palmar Sujood Stool",       // fallback name
    price: 970,
    currency: "INR",
    image: "assets/stool-product.jpg",
    images: ["assets/stool-product.jpg", "assets/stool-closeup.jpg"],
    descKey: "product.tagline",
    desc: "Pain-Free Tashahhud, Made Simple",
    sku: "PALMAR-001"
  },
  {
    id: "palmar-reading-stand",
    name: "Reading Stand",
    price: 2010,
    currency: "INR",
    image: "assets/reading-stand.jpg",
    images: ["assets/reading-stand.jpg"],
    descKey: "shop.reading_stand_desc",
    desc: "Height-adjustable mobile stand with tilting top — for Qur'an, books or a laptop.",
    sku: "PALMAR-002"
  },
  {
    id: "palmar-writing-chair",
    name: "Writing Pad Chair",
    price: 4000,
    currency: "INR",
    image: "assets/writing-chair.jpg",
    images: ["assets/writing-chair.jpg"],
    descKey: "shop.writing_chair_desc",
    desc: "Cushioned chair on castors with a swing-out writing pad — for study halls and offices.",
    sku: "PALMAR-003"
  }
];

function getProductById(id) {
  return PRODUCTS.find(p => p.id === id);
}

// Name/description resolve through i18n when a key exists, otherwise plain text.
function productName(p) {
  if (!p) return "";
  if (p.nameKey && typeof t === "function") {
    const translated = t(p.nameKey);
    if (translated && translated !== p.nameKey) return translated;
  }
  return p.name || "";
}
function productDesc(p) {
  if (!p) return "";
  if (p.descKey && typeof t === "function") {
    const translated = t(p.descKey);
    if (translated && translated !== p.descKey) return translated;
  }
  return p.desc || "";
}
