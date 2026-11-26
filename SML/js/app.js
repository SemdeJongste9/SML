let C=[];try{C=JSON.parse(localStorage.getItem("sml-custom")||"[]")}catch(e){}
C.forEach(c=>P.push(c));
const saveC=()=>{try{localStorage.setItem("sml-custom",JSON.stringify(C))}catch(e){alert("Opslag vol. Gebruik kleinere foto’s of verwijder een artikel.")}};
const SH={tee:'<path d="M60 30 85 22Q100 42 115 22L140 30 180 70 158 92 142 80V215H58V80L42 92 20 70Z"/>',
hoodie:'<path d="M58 34 82 24Q100 50 118 24L142 34 186 100 164 214 142 208V215H58V208L36 214 14 100Z"/><path class="s" d="M80 24Q100-6 120 24Q100 52 80 24Z"/><path class="s" d="M72 150H128V185H72Z"/>',
pants:'<path d="M62 20H138L152 222H110L100 92 90 222H48Z"/><path class="s" d="M62 20H138V34H62Z"/>',
shorts:'<path d="M60 40H140L156 160H110L100 96 90 160H44Z"/><path class="s" d="M60 40H140V54H60Z"/>',
jacket:'<path d="M58 34 84 22 100 44 116 22 142 34 184 70 170 200H146V218H54V200H30L16 70Z"/><path class="s" d="M98 44H102V218H98Z"/>',
cap:'<path d="M40 150Q36 80 100 78Q164 80 160 150Z"/><path class="s" d="M150 140Q196 138 196 158L100 156Z"/>'};
const svg=(t,c)=>t.startsWith("data:")?'<img src="'+t+'" alt="" style="width:100%;height:100%;object-fit:cover">':`<svg viewBox="0 0 200 240" role="img" aria-label="${t}"><style>.g path{fill:${c}}.g .s{fill:rgba(0,0,0,.28)}</style><g class="g">${SH[t]}</g></svg>`;
const eur=n=>"€"+n.toFixed(2).replace(".",",");
const $=s=>document.querySelector(s);
let cat="Alles",cart=[];
try{cart=JSON.parse(localStorage.getItem("sml-cart")||"[]")}catch(e){}
const save=()=>{try{localStorage.setItem("sml-cart",JSON.stringify(cart))}catch(e){}};

function chips(){const cs=["Alles",...new Set(P.map(p=>p.c))];
 $("#chips").innerHTML=cs.map(c=>`<button class="chip" aria-pressed="${c===cat}" data-c="${c}">${c}</button>`).join("");}
function grid(){let l=P.filter(p=>(cat==="Alles"||p.c===cat)&&p.n.toLowerCase().includes($("#q").value.toLowerCase()));const s=$("#sort").value;
 if(s==="a")l.sort((a,b)=>a.p-b.p);if(s==="d")l.sort((a,b)=>b.p-a.p);
 $("#grid").innerHTML=l.map(p=>`<button class="card" data-id="${p.id}"><div class="pic">${p.tag?`<span class="tag">${p.tag}</span>`:""}${svg(p.t,p.col)}</div><div class="t"><div><div class="n">${p.n}</div><div class="c">${p.c}</div></div><div>${eur(p.p)}</div></div></button>`).join("");}
$("#chips").onclick=e=>{const b=e.target.closest("[data-c]");if(b){cat=b.dataset.c;chips();grid()}};
$("#sort").onchange=grid;$("#q").oninput=grid;
$("#grid").onclick=e=>{const b=e.target.closest("[data-id]");if(b)openP(+b.dataset.id)};

let sel=null,size=null;
function openP(id){sel=P.find(p=>p.id===id);size=null;
 $("#mbox").innerHTML=`<div class="big">${svg(sel.t,sel.col)}</div><div class="mi"><button class="x" data-close aria-label="Sluiten">×</button><h2>${sel.n}</h2><div class="c" style="color:var(--mute)">${sel.c}</div><div class="tot" style="margin:10px 0">${eur(sel.p)}</div>
 <div style="font-weight:600">Kies je maat</div><div class="sz" id="sz">${["S","M","L","XL"].map(s=>`<button aria-pressed="false" data-s="${s}">${s}</button>`).join("")}</div><div class="err" id="serr"></div>
 <button class="btn" id="add" style="width:100%">In winkelmand</button><div class="msg" id="msg" role="status"></div>
 <ul class="det">${sel.d.map(x=>`<li>${x}</li>`).join("")}</ul></div>`;
 $("#modal").classList.add("on");$("#ov").classList.add("on");}
$("#mbox").onclick=e=>{const s=e.target.closest("[data-s]");
 if(s){size=s.dataset.s;document.querySelectorAll("#sz button").forEach(b=>b.setAttribute("aria-pressed",b===s));$("#serr").textContent="";return}
 if(e.target.id==="add"){if(!size){$("#serr").textContent="Kies eerst een maat.";return}
  const k=sel.id+size,f=cart.find(i=>i.k===k);f?f.q++:cart.push({k,id:sel.id,s:size,q:1});save();upd();
  closeAll();openCart();}};

const tot=()=>cart.reduce((a,i)=>a+P.find(p=>p.id===i.id).p*i.q,0);
function upd(){$("#cnt").textContent=cart.reduce((a,i)=>a+i.q,0);}
function showCart(){const T=tot();$("#cTitle").textContent="Winkelmand";
 if(!cart.length){$("#cBody").innerHTML='<p>Je winkelmand is leeg. Kies een maat bij een product om te beginnen.</p>';$("#cFoot").innerHTML="";return}
 $("#cBody").innerHTML=cart.map(i=>{const p=P.find(x=>x.id===i.id);return`<div class="line"><button class="th" data-p="${p.id}" aria-label="Bekijk ${p.n}" style="border:0;padding:0">${svg(p.t,p.col)}</button><div><button data-p="${p.id}" style="background:none;border:0;padding:0;font-weight:600;text-align:left">${p.n}</button><div class="c" style="color:var(--mute)">Maat ${i.s}</div><div class="qty"><button data-q="-1" data-k="${i.k}" aria-label="Minder">−</button><span>${i.q}</span><button data-q="1" data-k="${i.k}" aria-label="Meer">+</button></div></div><div>${eur(p.p*i.q)}</div></div>`}).join("");
 const r=Math.max(0,100-T);
 $("#cFoot").innerHTML=`<div>${r>0?`Nog ${eur(r)} tot gratis verzending`:"Je krijgt gratis verzending"}</div><div class="ship"><i style="width:${Math.min(100,T)}%"></i></div><div class="row"><span>Subtotaal</span><span>${eur(T)}</span></div><div class="row"><span>Verzending</span><span>${r>0?eur(4.95):"Gratis"}</span></div><div class="row tot"><span>Totaal</span><span>${eur(T+(r>0?4.95:0))}</span></div><button class="btn" id="go" style="width:100%;margin-top:10px">Afrekenen</button><button class="chip" data-close style="width:100%;margin-top:8px">Verder winkelen</button>`;}
function checkout(){const T=tot()+(tot()<100?4.95:0);$("#cTitle").textContent="Afrekenen";
 $("#cBody").innerHTML=`<form id="f" novalidate><label for="nm">Volledige naam</label><input id="nm" autocomplete="name"><label for="em">E-mailadres</label><input id="em" type="email" autocomplete="email"><label for="ad">Straat en huisnummer</label><input id="ad" autocomplete="street-address"><div class="two"><div><label for="pc">Postcode</label><input id="pc" autocomplete="postal-code"></div><div><label for="pl">Plaats</label><input id="pl" autocomplete="address-level2"></div></div><p style="margin:14px 0 0"><b>Betalen via bankoverschrijving.</b> Na je bestelling krijg je van ons de betaalgegevens. We verzenden zodra je betaling binnen is.</p><div class="err" id="ferr" role="alert"></div></form>`;
 $("#cFoot").innerHTML=`<div class="row tot"><span>Totaal</span><span>${eur(T)}</span></div><button class="btn" id="pay" style="width:100%;margin-top:10px">Bestelling plaatsen (${eur(T)})</button><button class="chip" id="back" style="width:100%;margin-top:8px">Terug naar winkelmand</button>`;}
function pay(){const v=id=>$("#"+id).value.trim();
 if(!v("nm")||!/^\S+@\S+\.\S+$/.test(v("em"))||!v("ad")||!/^\d{4}\s?[A-Za-z]{2}$/.test(v("pc"))||!v("pl")){$("#ferr").textContent="Controleer je gegevens. Vul alle velden in met een geldig e-mailadres en postcode (bijvoorbeeld 2511 AB).";return}
 const no="SML-"+Math.floor(100000+Math.random()*900000);
 const T=tot()+(tot()<100?4.95:0);
 const txt="Bestelling "+no+"\n\n"+cart.map(i=>{const p=P.find(x=>x.id===i.id);return i.q+"x "+p.n+" (maat "+i.s+") - "+eur(p.p*i.q)}).join("\n")+"\n\nTotaal incl. verzending: "+eur(T)+"\n\nNaam: "+v("nm")+"\nE-mail: "+v("em")+"\nAdres: "+v("ad")+", "+v("pc")+" "+v("pl")+"\nBetaling: bankoverschrijving";
 const mail="mailto:semdj2009@gmail.com?subject="+encodeURIComponent("Bestelling "+no)+"&body="+encodeURIComponent(txt);
 cart=[];save();upd();
 $("#cTitle").textContent="Laatste stap";$("#cBody").innerHTML=`<p class="tot">Bestelling ${no} is klaar om te versturen.</p><p>Je bestelling is nog niet verstuurd. Klik op de knop hieronder en verstuur de e-mail die opent. Daarna sturen we je de betaalgegevens om over te maken.</p><a class="btn" href="${mail}" target="_blank" rel="noopener" style="display:block;text-align:center">Verstuur bestelling per e-mail</a><p style="color:var(--mute);font-size:14px">Opent de e-mail niet? Kopieer dan onderstaande tekst en mail die naar semdj2009@gmail.com.</p><pre id="ot" style="white-space:pre-wrap;font:inherit;font-size:14px;background:var(--surf);padding:10px"></pre>`;
 $("#ot").textContent=txt;$("#cFoot").innerHTML='<button class="btn" data-close style="width:100%">Verder winkelen</button>';}
$("#cart").onclick=e=>{const pp=e.target.closest("[data-p]");if(pp){closeAll();openP(+pp.dataset.p);return}const q=e.target.closest("[data-q]");
 if(q){const i=cart.find(x=>x.k===q.dataset.k);i.q+=+q.dataset.q;if(i.q<1)cart=cart.filter(x=>x!==i);save();upd();showCart();return}
 if(e.target.id==="go")checkout();if(e.target.id==="back")showCart();if(e.target.id==="pay")pay();};
function openCart(){showCart();$("#cart").classList.add("on");$("#cart").setAttribute("aria-hidden","false");$("#ov").classList.add("on")}
function closeAll(){$("#cart").classList.remove("on");$("#cart").setAttribute("aria-hidden","true");$("#modal").classList.remove("on");$("#ov").classList.remove("on")}
$("#openCart").onclick=openCart;
document.addEventListener("click",e=>{if(e.target.closest("[data-close]")||e.target===$("#ov")||e.target===$("#modal"))closeAll()});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeAll()});
function openAdmin(){const cs=[...new Set(P.map(p=>p.c))];
 $("#mbox").innerHTML=`<div class="mi" style="grid-column:1/-1"><button class="x" data-close aria-label="Sluiten">×</button><h2>Beheer</h2><p style="color:var(--mute)">Voeg je eigen artikelen met foto toe. In deze versie blijven ze alleen in jouw browser bewaard.</p><div class="two"><div><label for="an">Naam</label><input id="an"></div><div><label for="ap">Prijs (€)</label><input id="ap" type="number" min="0" step="0.01"></div></div><div class="two"><div><label for="ac">Categorie</label><input id="ac" list="cl"><datalist id="cl">${cs.map(c=>`<option value="${c}">`).join("")}</datalist></div><div><label for="af">Foto</label><input id="af" type="file" accept="image/*"></div></div><label for="ade">Omschrijving</label><input id="ade"><div class="err" id="aerr" role="alert"></div><button class="btn" id="asave" style="margin-top:10px">Artikel opslaan</button><h3>Eigen artikelen</h3><div id="alist"></div></div>`;
 adminList();$("#modal").classList.add("on");$("#ov").classList.add("on");}
function adminList(){$("#alist").innerHTML=C.length?C.map(c=>`<div class="row"><span>${c.n.replace(/</g,"&lt;")} (${eur(c.p)})</span><button class="chip" data-del="${c.id}">Verwijderen</button></div>`).join(""):"<p style='color:var(--mute)'>Nog geen eigen artikelen.</p>";}
$("#adm").onclick=openAdmin;
$("#mbox").addEventListener("click",e=>{const d=e.target.closest("[data-del]");
 if(d){const id=+d.dataset.del;C=C.filter(c=>c.id!==id);const i=P.findIndex(p=>p.id===id);if(i>-1)P.splice(i,1);saveC();adminList();chips();grid();return}
 if(e.target.id!=="asave")return;
 const n=$("#an").value.trim(),p=parseFloat($("#ap").value),c=$("#ac").value.trim()||"Overig",f=$("#af").files[0];
 if(!n||!(p>=0)||!f){$("#aerr").textContent="Vul naam, prijs en foto in.";return}
 const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const s=Math.min(1,800/Math.max(im.width,im.height)),cv=document.createElement("canvas");cv.width=im.width*s;cv.height=im.height*s;cv.getContext("2d").drawImage(im,0,0,cv.width,cv.height);
  const o={id:Date.now(),n,c,p,t:cv.toDataURL("image/jpeg",.8),col:"#000",d:[$("#ade").value.trim()||"Eigen artikel"],tag:"Nieuw"};
  C.push(o);P.push(o);saveC();chips();grid();openAdmin();};im.src=r.result};r.readAsDataURL(f);});
chips();grid();upd();
