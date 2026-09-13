// Palmar — simple rule-based chatbot widget with order-taking flow
let chatState = { step: "idle", data: {} };

function initChatbot(){
  const fab = document.getElementById("chatFab");
  const win = document.getElementById("chatWindow");
  const closeBtn = document.getElementById("chatClose");
  const sendBtn = document.getElementById("chatSend");
  const input = document.getElementById("chatInput");
  if(!fab || !win) return;

  fab.addEventListener("click", ()=>{
    win.classList.toggle("show");
    if(win.classList.contains("show") && document.getElementById("chatBody").children.length === 0){
      chatBotSay(t("chatbot.greeting"));
      renderChatOptions();
    }
  });
  closeBtn.addEventListener("click", ()=> win.classList.remove("show"));
  sendBtn.addEventListener("click", handleChatSend);
  input.addEventListener("keydown", (e)=>{ if(e.key === "Enter") handleChatSend(); });
}

function chatBotSay(text){
  const body = document.getElementById("chatBody");
  const div = document.createElement("div");
  div.className = "msg bot";
  div.textContent = text;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}
function chatUserSay(text){
  const body = document.getElementById("chatBody");
  const div = document.createElement("div");
  div.className = "msg user";
  div.textContent = text;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}
function chatBotSayHtml(html){
  const body = document.getElementById("chatBody");
  const div = document.createElement("div");
  div.className = "msg bot";
  div.innerHTML = html;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}

function renderChatOptions(){
  const optsWrap = document.getElementById("chatOptions");
  if(!optsWrap) return;
  optsWrap.innerHTML = "";
  if(chatState.step === "idle" || chatState.step === "menu"){
    addChatOption(t("chatbot.opt_price"), ()=> handlePriceInfo());
    addChatOption(t("chatbot.opt_delivery"), ()=> handleDeliveryInfo());
    addChatOption(t("chatbot.opt_order"), ()=> startOrderFlow());
    addChatOption(t("chatbot.opt_human"), ()=> {
      window.open(whatsappLink("Assalamu Alaikum, I have a question about Palmar."), "_blank");
    });
  }
}
function addChatOption(label, handler){
  const btn = document.createElement("button");
  btn.className = "chat-opt-btn";
  btn.textContent = label;
  btn.addEventListener("click", handler);
  document.getElementById("chatOptions").appendChild(btn);
}

function handlePriceInfo(){
  chatUserSay(t("chatbot.opt_price"));
  chatBotSay(t("chatbot.price_reply"));
  chatState.step = "menu";
  renderChatOptions();
}
function handleDeliveryInfo(){
  chatUserSay(t("chatbot.opt_delivery"));
  chatBotSay(t("chatbot.delivery_reply"));
  chatState.step = "menu";
  renderChatOptions();
}
function startOrderFlow(){
  chatUserSay(t("chatbot.opt_order"));
  chatState = { step: "ask_name", data: {} };
  chatBotSay(t("chatbot.order_start"));
  document.getElementById("chatOptions").innerHTML = "";
}

function handleChatSend(){
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if(!text) return;
  chatUserSay(text);
  input.value = "";
  processChatInput(text);
}

function processChatInput(text){
  switch(chatState.step){
    case "ask_name":
      chatState.data.name = text;
      chatState.step = "ask_phone";
      chatBotSay(t("chatbot.ask_phone").replace("{name}", chatState.data.name));
      break;
    case "ask_phone":
      chatState.data.phone = text;
      chatState.step = "ask_address";
      chatBotSay(t("chatbot.ask_address"));
      break;
    case "ask_address":
      chatState.data.address = text;
      chatState.step = "review";
      showOrderReview();
      break;
    default:
      // free text outside a flow: gentle nudge back to menu
      chatState.step = "menu";
      chatBotSay(t("chatbot.greeting"));
      renderChatOptions();
  }
}

function showOrderReview(){
  const product = PRODUCTS[0];
  const orderId = generateOrderId();
  const order = {
    orderId,
    date: new Date().toLocaleDateString("en-GB"),
    items: [{ id: product.id, qty: 1 }],
    total: product.price,
    payment: "cod",
    name: chatState.data.name,
    phone: chatState.data.phone,
    address: chatState.data.address,
    post: "",
    pincode: "",
    taluk: "",
    district: "",
    state: ""
  };
  saveOrderRecord(order);
  chatBotSay(t("chatbot.order_review"));
  const summary = `
    <div style="font-size:.85rem;line-height:1.5;">
      <b>${t(product.nameKey)}</b> x1 — ${CURRENCY_SYMBOL}${product.price}<br>
      ${order.name}<br>${order.phone}<br>${order.address}
    </div>
  `;
  chatBotSayHtml(summary);
  const msg = buildOrderMessage(order);
  const optsWrap = document.getElementById("chatOptions");
  optsWrap.innerHTML = "";
  const waBtn = document.createElement("a");
  waBtn.href = whatsappLink(msg);
  waBtn.target = "_blank";
  waBtn.className = "btn btn-primary";
  waBtn.style.width = "100%";
  waBtn.style.marginBottom = "8px";
  waBtn.textContent = t("chatbot.confirm_whatsapp");
  optsWrap.appendChild(waBtn);
  addChatOption(t("chatbot.restart"), ()=>{
    chatState = { step: "menu", data: {} };
    renderChatOptions();
  });
}
