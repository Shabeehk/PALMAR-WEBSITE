// Palmar — product catalog
// Add new products here in future; the cart/checkout code already supports multiple items.
const PRODUCTS = [
  {
    id: "palmar-sujood-stool",
    nameKey: "product.title",
    price: 970,
    currency: "INR",
    image: "assets/hero-lifestyle.jpg",
    images: ["assets/hero-lifestyle.jpg", "assets/sizes-features.jpg", "assets/how-it-works.jpg"],
    sku: "PALMAR-001"
  }
];

function getProductById(id) {
  return PRODUCTS.find(p => p.id === id);
}
