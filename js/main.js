// Palmar — site logic: language switching, cart, chatbot, WhatsApp handoff
const WHATSAPP_NUMBER = "971561282052"; // international format, no +, no spaces
const CURRENCY_SYMBOL = "₹";
const FREE_DELIVERY_THRESHOLD = 0; // delivery is always free currently

// UPI / QR payment
const UPI_ID = "kappuramshabeeh@oksbi";
const UPI_PAYEE = "AHAMMED SHABEEH";
const UPI_DISCOUNT = 20;   // ₹ off when paying by UPI instead of cash on delivery

function upiPayLink(amount, note){
  return "upi://pay?pa=" + encodeURIComponent(UPI_ID) +
         "&pn=" + encodeURIComponent(UPI_PAYEE) +
         "&am=" + encodeURIComponent(amount) +
         "&cu=INR&tn=" + encodeURIComponent(note || "Palmar order");
}

/* ---------- Language ---------- */
function getLang(){
  return localStorage.getItem("palmar_lang") || "en";
}
function setLang(lang){
  if(!SUPPORTED_LANGS.includes(lang)) lang = "en";
  localStorage.setItem("palmar_lang", lang);
  document.documentElement.lang = lang === "hi" ? "hi" : (lang === "ml" ? "ml" : "en");
  applyTranslations(lang);
  const sel = document.getElementById("langSelect");
  if(sel) sel.value = lang;
}
function t(key, lang){
  lang = lang || getLang();
  const dict = translations[lang] || translations.en;
  return dict[key] || translations.en[key] || key;
}
function applyTranslations(lang){
  lang = lang || getLang();
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key, lang);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{
    const key = el.getAttribute("data-i18n-placeholder");
    el.setAttribute("placeholder", t(key, lang));
  });
  document.title = t("site.title", lang);
  renderCartDrawer();
  if(typeof renderShop === "function") renderShop();
  if(typeof renderChatOptions === "function") renderChatOptions();
}

/* ---------- Cart ---------- */
function getCart(){
  try{ return JSON.parse(localStorage.getItem("palmar_cart") || "[]"); }
  catch(e){ return []; }
}
function saveCart(cart){
  localStorage.setItem("palmar_cart", JSON.stringify(cart));
  updateCartCount();
  renderCartDrawer();
}
function addToCart(productId, qty){
  qty = qty || 1;
  const cart = getCart();
  const existing = cart.find(i=>i.id===productId);
  if(existing) existing.qty += qty;
  else cart.push({id:productId, qty:qty});
  saveCart(cart);
  openCartDrawer();
}
function updateQty(productId, qty){
  let cart = getCart();
  if(qty <= 0){
    cart = cart.filter(i=>i.id!==productId);
  } else {
    const item = cart.find(i=>i.id===productId);
    if(item) item.qty = qty;
  }
  saveCart(cart);
}
function removeFromCart(productId){
  const cart = getCart().filter(i=>i.id!==productId);
  saveCart(cart);
}
function cartTotal(){
  return getCart().reduce((sum, item)=>{
    const p = getProductById(item.id);
    return sum + (p ? p.price * item.qty : 0);
  }, 0);
}
function cartCount(){
  return getCart().reduce((sum, item)=>sum + item.qty, 0);
}
function updateCartCount(){
  document.querySelectorAll(".cart-count").forEach(el=>{ el.textContent = cartCount(); });
}
function renderCartDrawer(){
  const body = document.getElementById("cartDrawerBody");
  const foot = document.getElementById("cartDrawerFoot");
  if(!body) return;
  const cart = getCart();
  if(cart.length === 0){
    body.innerHTML = `<div class="empty-state">${t("cart.empty")}</div>`;
    if(foot) foot.style.display = "none";
    return;
  }
  if(foot) foot.style.display = "block";
  body.innerHTML = cart.map(item=>{
    const p = getProductById(item.id);
    if(!p) return "";
    return `
      <div class="cart-item">
        <img src="${p.image}" alt="">
        <div class="cart-item-info">
          <h4>${productName(p)}</h4>
          <div>${CURRENCY_SYMBOL}${p.price} x ${item.qty}</div>
          <div class="cart-item-actions">
            <div class="qty-control">
              <button onclick="updateQty('${p.id}', ${item.qty-1})">−</button>
              <span>${item.qty}</span>
              <button onclick="updateQty('${p.id}', ${item.qty+1})">+</button>
            </div>
            <button class="remove-link" onclick="removeFromCart('${p.id}')">${t("cart.remove")}</button>
          </div>
        </div>
      </div>`;
  }).join("");
  const total = cartTotal();
  if(foot){
    foot.innerHTML = `
      <div class="summary-row"><span>${t("cart.subtotal")}</span><span>${CURRENCY_SYMBOL}${total}</span></div>
      <div class="summary-row"><span>${t("cart.delivery")}</span><span>${t("cart.free")}</span></div>
      <div class="summary-row total"><span>${t("cart.total")}</span><span>${CURRENCY_SYMBOL}${total}</span></div>
      <a href="checkout.html" class="btn btn-primary btn-block" style="margin-top:14px;">${t("cart.checkout")}</a>
      <button class="btn btn-outline btn-block" style="margin-top:10px;" onclick="closeCartDrawer()">${t("cart.continue")}</button>
    `;
  }
}
function openCartDrawer(){
  document.getElementById("cartOverlay").classList.add("show");
  document.getElementById("cartDrawer").classList.add("show");
  renderCartDrawer();
}
function closeCartDrawer(){
  document.getElementById("cartOverlay").classList.remove("show");
  document.getElementById("cartDrawer").classList.remove("show");
}

/* ---------- WhatsApp order message builder ---------- */
function buildOrderMessage(order){
  const lines = [];
  lines.push(`Assalamu Alaikum, I'd like to place a Palmar order.`);
  lines.push(``);
  lines.push(`Order ID: ${order.orderId}`);
  order.items.forEach(item=>{
    const p = getProductById(item.id);
    if(p) lines.push(`- ${p.name || productName(p)} x${item.qty} — ${CURRENCY_SYMBOL}${p.price*item.qty}`);
  });
  if(order.payment === "upi"){
    lines.push(`Discount (UPI): -${CURRENCY_SYMBOL}${UPI_DISCOUNT}`);
    lines.push(`Total paid: ${CURRENCY_SYMBOL}${order.total} — PAID BY UPI ✅ (please verify)`);
  } else {
    lines.push(`Total: ${CURRENCY_SYMBOL}${order.total} (Cash on Delivery)`);
  }
  lines.push(``);
  lines.push(`Name: ${order.name}`);
  lines.push(`Phone: ${order.phone}`);
  lines.push(`Address: ${order.address}, ${order.city}, ${order.state} - ${order.pincode}`);
  return lines.join("\n");
}
function whatsappLink(message){
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
function generateOrderId(){
  const d = new Date();
  return "PLM" + d.getFullYear().toString().slice(-2) +
    String(d.getMonth()+1).padStart(2,"0") + String(d.getDate()).padStart(2,"0") +
    "-" + Math.floor(1000 + Math.random()*9000);
}
function saveOrderRecord(order){
  try{
    const orders = JSON.parse(localStorage.getItem("palmar_orders") || "[]");
    orders.push(order);
    localStorage.setItem("palmar_orders", JSON.stringify(orders));
  }catch(e){}
}

/* ---------- Shop grid (all products) ---------- */
function renderShop(){
  const wrap = document.getElementById("shopGrid");
  if(!wrap) return;
  wrap.innerHTML = PRODUCTS.map(p=>`
    <div class="shop-card">
      <div class="shop-card-img"><img src="${p.image}" alt="${productName(p)}"></div>
      <div class="shop-card-body">
        <h3>${productName(p)}</h3>
        <p>${productDesc(p)}</p>
        <div class="shop-card-foot">
          <span class="shop-price">${CURRENCY_SYMBOL}${p.price}</span>
          <button class="btn btn-primary" onclick="addToCart('${p.id}',1)">${t("product.add_to_cart")}</button>
        </div>
      </div>
    </div>
  `).join("");
}

/* ---------- FAQ accordion ---------- */
function initFaq(){
  document.querySelectorAll(".faq-item").forEach(item=>{
    const q = item.querySelector(".faq-q");
    if(!q) return;
    q.addEventListener("click", ()=>{
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item").forEach(i=>i.classList.remove("open"));
      if(!isOpen) item.classList.add("open");
    });
  });
}

/* ---------- Gallery ---------- */
function initGallery(){
  const main = document.getElementById("galleryMain");
  document.querySelectorAll(".gallery-thumbs img").forEach(thumb=>{
    thumb.addEventListener("click", ()=>{
      if(main) main.src = thumb.src;
      document.querySelectorAll(".gallery-thumbs img").forEach(t=>t.classList.remove("active"));
      thumb.classList.add("active");
    });
  });
}

/* ---------- Mobile nav ---------- */
function initMobileNav(){
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("mainNav");
  if(!toggle || !nav) return;
  toggle.addEventListener("click", ()=> nav.classList.toggle("open"));
  nav.querySelectorAll("a").forEach(a=> a.addEventListener("click", ()=> nav.classList.remove("open")));
}

/* ---------- Global init ---------- */
document.addEventListener("DOMContentLoaded", ()=>{
  setLang(getLang());
  updateCartCount();
  initFaq();
  initGallery();
  initMobileNav();

  const langSelect = document.getElementById("langSelect");
  if(langSelect){
    langSelect.value = getLang();
    langSelect.addEventListener("change", (e)=> setLang(e.target.value));
  }
  const cartBtn = document.getElementById("cartBtn");
  if(cartBtn) cartBtn.addEventListener("click", openCartDrawer);
  const cartClose = document.getElementById("cartDrawerClose");
  if(cartClose) cartClose.addEventListener("click", closeCartDrawer);
  const overlay = document.getElementById("cartOverlay");
  if(overlay) overlay.addEventListener("click", closeCartDrawer);

  const addBtn = document.getElementById("addToCartBtn");
  if(addBtn){
    addBtn.addEventListener("click", ()=>{
      const qty = parseInt(document.getElementById("qtyDisplay").textContent, 10) || 1;
      addToCart(PRODUCTS[0].id, qty);
    });
  }
  const buyNowBtn = document.getElementById("buyNowBtn");
  if(buyNowBtn){
    buyNowBtn.addEventListener("click", ()=>{
      const qty = parseInt(document.getElementById("qtyDisplay").textContent, 10) || 1;
      addToCart(PRODUCTS[0].id, qty);
      window.location.href = "checkout.html";
    });
  }
  const qtyMinus = document.getElementById("qtyMinus");
  const qtyPlus = document.getElementById("qtyPlus");
  if(qtyMinus && qtyPlus){
    qtyMinus.addEventListener("click", ()=>{
      const el = document.getElementById("qtyDisplay");
      el.textContent = Math.max(1, parseInt(el.textContent,10)-1);
    });
    qtyPlus.addEventListener("click", ()=>{
      const el = document.getElementById("qtyDisplay");
      el.textContent = parseInt(el.textContent,10)+1;
    });
  }

  if (typeof initChatbot === "function") initChatbot();
});
