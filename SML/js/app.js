const $=s=>document.querySelector(s);
const eur=cents=>new Intl.NumberFormat("nl-NL",{style:"currency",currency:"EUR"}).format(cents/100);
const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const safeColor=value=>/^#[0-9a-f]{6}$/i.test(value||"")?value:"#68735c";
const forms={tee:'<path d="M59 28 84 20Q100 39 116 20L141 28 182 69 158 94 141 78V216H59V78L42 94 18 69Z"/><path class="stitch" d="M80 24Q100 47 120 24M100 45V214"/>',hoodie:'<path d="M58 34 82 23Q100 50 118 23L142 34 185 93 164 215 142 207V216H58V207L36 215 15 93Z"/><path class="shade" d="M80 24Q100-5 120 24Q100 52 80 24Z"/><path class="stitch" d="M70 151H130V182H70Z"/>',pants:'<path d="M61 20H139L153 222H110L100 92 90 222H47Z"/><path class="stitch" d="M61 22H139M100 22V89"/>',shorts:'<path d="M60 39H140L156 161H110L100 97 90 161H44Z"/><path class="stitch" d="M60 41H140M100 43V91"/>',jacket:'<path d="M58 33 84 21 100 44 116 21 142 33 184 69 169 200H146V218H54V200H31L16 69Z"/><path class="stitch" d="M98 44H102V215M80 27 99 54 120 27"/>',cap:'<path d="M40 150Q36 80 100 78Q164 80 160 150Z"/><path class="stitch" d="M100 80V149"/><path class="shade" d="M150 140Q196 138 196 158L100 156Z"/>'};
function illustration(product){
  const type=forms[product.product_type]||forms.tee,color=safeColor(product.color),id=Number(product.id)||1;
  return `<svg viewBox="0 0 200 240" role="img" aria-label="Illustratie ${escapeHtml(product.name)}"><defs><linearGradient id="g${id}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${color}"/><stop offset="1" stop-color="#151a16"/></linearGradient></defs><g class="garment" fill="url(#g${id})" stroke="rgba(255,255,255,.15)" stroke-width="1">${type}</g><style>.garment .shade{fill:rgba(0,0,0,.25)}.garment .stitch{fill:none;stroke:rgba(244,241,233,.42);stroke-width:2;stroke-dasharray:2 3}</style></svg>`;
}
function productArt(product,small=false){
  if(product.image_url){try{const url=new URL(product.image_url,location.href);if(["https:","http:"].includes(url.protocol))return `<img src="${escapeHtml(url.href)}" alt="${escapeHtml(product.name)}" loading="lazy">`}catch{}}
  return illustration(product);
}

let products=[...window.SML_FALLBACK],category="Alles",cart=[];
let dbReady=false,paymentsReady=false;
try{const stored=JSON.parse(localStorage.getItem("sml-cart")||"[]");cart=Array.isArray(stored)?stored.filter(i=>Number.isInteger(Number(i.id))&&typeof i.s==="string"&&Number.isInteger(Number(i.q))&&i.q>0).map(i=>({id:Number(i.id),s:i.s,q:Math.min(10,Number(i.q))})):[]}catch{}
const saveCart=()=>{try{localStorage.setItem("sml-cart",JSON.stringify(cart))}catch{}};
const subtotal=()=>cart.reduce((sum,item)=>sum+(products.find(p=>p.id===item.id)?.price_cents||0)*item.q,0);
const shipping=subtotal()>=10000?0:(cart.length?495:0);
const cartCount=()=>cart.reduce((sum,item)=>sum+item.q,0);
let selectedProduct=null,selectedSize=null;

function renderChips(){const categories=["Alles",...new Set(products.map(p=>p.category))];$("#chips").innerHTML=categories.map(name=>`<button class="chip" aria-pressed="${name===category}" data-category="${escapeHtml(name)}">${escapeHtml(name)}</button>`).join("")}
function renderProducts(){
  const term=$("#q").value.trim().toLocaleLowerCase("nl-NL"),sort=$("#sort").value;
  let list=products.filter(p=>(category==="Alles"||p.category===category)&&p.name.toLocaleLowerCase("nl-NL").includes(term));
  if(sort==="a")list.sort((a,b)=>a.price_cents-b.price_cents);if(sort==="d")list.sort((a,b)=>b.price_cents-a.price_cents);
  $("#grid").innerHTML=list.length?list.map(p=>`<article class="card"><button class="product-main" data-open="${p.id}" aria-label="Bekijk ${escapeHtml(p.name)}"><span class="pic">${p.badge?`<span class="tag">${escapeHtml(p.badge)}</span>`:""}${productArt(p)}<span class="product-mark">SML — STUDIO</span></span><span class="card-copy"><span><span class="card-name">${escapeHtml(p.name)}</span><span class="card-category">${escapeHtml(p.category)}</span></span><span class="card-price">${eur(p.price_cents)}</span></span></button><button class="quick-add" data-open="${p.id}" aria-label="Kies maat voor ${escapeHtml(p.name)}">＋</button></article>`).join(""):'<p class="empty">Geen items gevonden. Probeer een andere zoekterm.</p>';
}
function updateCount(){$("#cnt").textContent=cartCount();$("#cartSubCount").textContent=cartCount()?`(${cartCount()})`:""}
function updateDemo(){const note=$("#demoNote");note.hidden=dbReady&&paymentsReady;note.textContent=!dbReady?"Voorbeeldcatalogus — verbind Supabase om live producten en voorraad te tonen.":"Voeg je bankrekeninggegevens toe in Vercel om bestellingen te kunnen afrekenen."}

function openProduct(id){selectedProduct=products.find(p=>p.id===Number(id));if(!selectedProduct)return;selectedSize=null;
  const sizes=Array.isArray(selectedProduct.sizes)?selectedProduct.sizes:["S","M","L","XL"];
  $("#mbox").innerHTML=`<div class="big">${productArt(selectedProduct)}</div><div class="mi"><button class="x" data-close aria-label="Sluiten">×</button><p class="eyebrow">SML ESSENTIALS</p><h2>${escapeHtml(selectedProduct.name)}</h2><div class="category">${escapeHtml(selectedProduct.category)}</div><div class="price">${eur(selectedProduct.price_cents)}</div><div class="size-label">KIES JE MAAT</div>${sizes.length?`<div class="sz" id="sz">${sizes.map(s=>`<button data-size="${escapeHtml(s)}" aria-pressed="false">${escapeHtml(s)}</button>`).join("")}</div>`:'<p class="checkout-intro">Op dit moment niet op voorraad.</p>'}<div class="error" id="sizeError"></div><button class="btn" id="addToCart" ${sizes.length?"":"disabled"}>${sizes.length?"Voeg toe aan winkelmand":"Niet op voorraad"}</button><ul class="det">${String(selectedProduct.description||"").split("·").map(x=>x.trim()).filter(Boolean).map(x=>`<li>— &nbsp;${escapeHtml(x)}</li>`).join("")}</ul></div>`;
  $("#modal").classList.add("on");$("#ov").classList.add("on");
}
function addToCart(){if(!selectedProduct)return;if(!selectedSize){$("#sizeError").textContent="Kies eerst een maat.";return}const item=cart.find(i=>i.id===selectedProduct.id&&i.s===selectedSize);if(item)item.q=Math.min(10,item.q+1);else cart.push({id:selectedProduct.id,s:selectedSize,q:1});saveCart();updateCount();closeAll();openCart()}

function renderCart(){
  updateCount();const total=subtotal();$("#cTitle").innerHTML=`Winkelmand <span id="cartSubCount">${cartCount()?`(${cartCount()})`:""}</span>`;
  if(!cart.length){$("#cBody").innerHTML='<div class="cart-empty"><strong>Een frisse start.</strong>Je winkelmand is nog leeg. De essentials wachten op je.</div>';$("#cFoot").innerHTML='<a class="btn" href="#shop" data-close>Ontdek de collectie</a>';return}
  $("#cBody").innerHTML=cart.map((item,index)=>{const p=products.find(x=>x.id===item.id);if(!p)return "";return `<div class="line"><div class="thumb">${productArt(p,true)}</div><div><div class="line-title">${escapeHtml(p.name)}</div><div class="line-meta">Maat ${escapeHtml(item.s)} · ${eur(p.price_cents)}</div><div class="qty"><button data-qty="-1" data-index="${index}" aria-label="Minder">−</button><span>${item.q}</span><button data-qty="1" data-index="${index}" aria-label="Meer">＋</button></div><br><button class="line-remove" data-remove="${index}">Verwijderen</button></div><div class="line-price">${eur(p.price_cents*item.q)}</div></div>`}).join("");
  const remainder=Math.max(0,10000-total);
  $("#cFoot").innerHTML=`<div class="cart-shipping">${shipping===0?"Je bestelling wordt gratis verzonden.":`Nog ${eur(remainder)} tot gratis verzending.`}</div><div class="ship"><i style="width:${Math.min(100,total/100)}%"></i></div><div class="row"><span>Subtotaal</span><span>${eur(total)}</span></div><div class="row"><span>Verzending</span><span>${shipping===0?"Gratis":eur(shipping)}</span></div><div class="row total"><span>Totaal</span><span>${eur(total+shipping)}</span></div>${paymentsReady?'<button class="btn" id="startCheckout" style="margin-top:12px">Bestellen via bankoverschrijving <span aria-hidden="true">&nbsp;↗</span></button>':'<button class="btn" disabled style="margin-top:12px">Afrekenen tijdelijk niet beschikbaar</button><p class="cart-note">Stel Supabase en je bankgegevens in Vercel in om bestellingen te activeren.</p>'}<button class="continue" data-close>Verder winkelen</button>`;
}
function openCart(){renderCart();$("#cart").classList.add("on");$("#cart").setAttribute("aria-hidden","false");$("#ov").classList.add("on")}
function closeAll(){$("#cart").classList.remove("on");$("#cart").setAttribute("aria-hidden","true");$("#modal").classList.remove("on");$("#ov").classList.remove("on")}

function checkout(){
  if(!dbReady||!paymentsReady)return;
  $("#cTitle").textContent="Jouw gegevens";
  $("#cBody").innerHTML=`<p class="checkout-intro">Vul je bezorggegevens in. Na het plaatsen ontvang je de betaalgegevens en een uniek betalingskenmerk.</p><form id="checkoutForm" class="form-grid" novalidate><div class="field full"><label for="customerName">Volledige naam</label><input id="customerName" autocomplete="name" maxlength="120" required></div><div class="field full"><label for="customerEmail">E-mailadres</label><input id="customerEmail" type="email" autocomplete="email" maxlength="254" required></div><div class="field full"><label for="street">Straat en huisnummer</label><input id="street" autocomplete="street-address" maxlength="180" required></div><div class="field"><label for="postalCode">Postcode</label><input id="postalCode" autocomplete="postal-code" maxlength="12" required></div><div class="field"><label for="city">Plaats</label><input id="city" autocomplete="address-level2" maxlength="100" required></div><div class="field full"><label for="country">Land</label><select id="country" required><option value="NL">Nederland</option><option value="BE">België</option></select></div><div id="checkoutError" class="error field full" role="alert"></div></form>`;
  const total=subtotal()+shipping;$("#cFoot").innerHTML=`<div class="row total"><span>Totaal</span><span>${eur(total)}</span></div><button class="btn" id="placeOrder" style="margin-top:12px">Bestelling plaatsen · ${eur(total)} ↗</button><button class="continue" id="backToCart">Terug naar winkelmand</button><p class="cart-note">Je betaalt handmatig via bankoverschrijving. Je bestelling blijft 48 uur voor je gereserveerd.</p>`;
}
async function placeOrder(){
  const form=$("#checkoutForm");if(!form.reportValidity())return;
  const button=$("#placeOrder");button.disabled=true;button.textContent="Bestelling opslaan…";$("#checkoutError").textContent="";
  const customer={name:$("#customerName").value.trim(),email:$("#customerEmail").value.trim(),street:$("#street").value.trim(),postal_code:$("#postalCode").value.trim(),city:$("#city").value.trim(),country:$("#country").value};
  try{const response=await fetch("/api/create-order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({customer,items:cart.map(({id,s,q})=>({product_id:id,size:s,quantity:q}))})});const data=await response.json();if(!response.ok)throw new Error(data.error||"De bestelling kon niet worden opgeslagen.");sessionStorage.setItem("sml-last-order",JSON.stringify(data));cart=[];saveCart();updateCount();location.assign(`/bedankt.html?order=${encodeURIComponent(data.orderNumber)}#token=${data.token}`)}catch(error){$("#checkoutError").textContent=error.message||"Er ging iets mis. Probeer het opnieuw.";button.disabled=false;button.textContent="Probeer opnieuw"}
}

$("#chips").addEventListener("click",e=>{const button=e.target.closest("[data-category]");if(button){category=button.dataset.category;renderChips();renderProducts()}});
$("#sort").addEventListener("change",renderProducts);$("#q").addEventListener("input",renderProducts);
$("#grid").addEventListener("click",e=>{const button=e.target.closest("[data-open]");if(button)openProduct(button.dataset.open)});
$("#openCart").addEventListener("click",openCart);
$("#mbox").addEventListener("click",e=>{const size=e.target.closest("[data-size]");if(size){selectedSize=size.dataset.size;document.querySelectorAll("#sz [data-size]").forEach(button=>button.setAttribute("aria-pressed",button===size));$("#sizeError").textContent=""}if(e.target.id==="addToCart")addToCart()});
$("#cart").addEventListener("click",e=>{const quantity=e.target.closest("[data-qty]");if(quantity){const item=cart[Number(quantity.dataset.index)];if(item){item.q+=Number(quantity.dataset.qty);if(item.q<1)cart.splice(Number(quantity.dataset.index),1);if(item.q>10)item.q=10;saveCart();renderCart()}return}const remove=e.target.closest("[data-remove]");if(remove){cart.splice(Number(remove.dataset.remove),1);saveCart();renderCart();return}if(e.target.id==="startCheckout")checkout();if(e.target.id==="placeOrder")placeOrder();if(e.target.id==="backToCart")renderCart()});
document.addEventListener("click",e=>{if(e.target.closest("[data-close]")||e.target===$("#ov")||e.target===$("#modal"))closeAll()});document.addEventListener("keydown",e=>{if(e.key==="Escape")closeAll()});

async function loadCatalog(){
  updateCount();renderChips();renderProducts();
  try{const response=await fetch("/api/products",{headers:{Accept:"application/json"}});if(!response.ok)throw new Error("catalog unavailable");const data=await response.json();if(Array.isArray(data.products)){products=data.products;dbReady=true;paymentsReady=Boolean(data.checkoutReady)}
    renderChips();renderProducts();updateDemo();if(cart.length)saveCart();
  }catch{dbReady=false;paymentsReady=false;updateDemo()}
}
loadCatalog();
