(function(){
'use strict';

/* ======================================================================
   HERRAMIENTAS INTERNAS 
   ====================================================================== */
var $ = function(s,c){return (c||document).querySelector(s)};
var $$ = function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
/* Protección: muestra los textos de la base de datos tal cual, sin riesgos */
function esc(v){ if(v===null||v===undefined) return ''; return String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
/* Protección: solo acepta enlaces de fotos seguros */
function safeUrl(u){ if(!u) return '#'; var s=String(u).trim(); return (/^https?:\/\//i.test(s)||/^\.{0,2}\//.test(s)) ? esc(s) : '#'; }
/* Crea el enlace de WhatsApp con un mensaje ya escrito */
function waLink(msg){ return 'https://wa.me/'+WA_NUMBER+(msg?'?text='+encodeURIComponent(msg):''); }
function icon(id,cls){ return '<svg class="icon'+(cls?' '+cls:'')+'" aria-hidden="true"><use href="#'+id+'"/></svg>'; }
/* Quita acentos para que el buscador encuentre lo mismo con o sin acento */
function norm(s){ return (s||'').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9 ]/g,' '); }
function money(n){ return '$'+Number(n||0).toLocaleString('es-MX',{minimumFractionDigits:2,maximumFractionDigits:2}); }

/* Los botones de WhatsApp toman el mensaje escrito en su data-wa (en index.html) */
$$('[data-wa]').forEach(function(a){ a.href = waLink(a.getAttribute('data-wa')); });
/* Año actual en el pie de página */
$('#year').textContent = new Date().getFullYear();

/* ======================================================================
   MENÚ: se pone blanco al bajar, abre el menú del celular
   y marca la sección que e usuario esta viendp
   ====================================================================== */
var header = $('#header');
function onScroll(){ header.classList.toggle('scrolled', window.scrollY > 10); }
window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

var menu = $('#mobileMenu'), menuBtn = $('#menuBtn');
function setMenu(open){
  menu.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
  if(open) $('#menuClose').focus(); else menuBtn.focus({preventScroll:true});
}
menuBtn.addEventListener('click', function(){ setMenu(true); });
$('#menuClose').addEventListener('click', function(){ setMenu(false); });
$$('[data-close]', menu).forEach(function(a){ a.addEventListener('click', function(){ setMenu(false); }); });
document.addEventListener('keydown', function(e){ if(e.key==='Escape' && menu.classList.contains('open')) setMenu(false); });

/* Marca en el menú la sección que se está viendo */
var navLinks = $$('.nav a');
var spy = new IntersectionObserver(function(entries){
  entries.forEach(function(en){
    if(en.isIntersecting){ navLinks.forEach(function(a){ a.classList.toggle('active', a.getAttribute('href')==='#'+en.target.id); }); }
  });
},{rootMargin:'-45% 0px -50% 0px'});
['servicios','precios','proceso','seguimiento','opiniones','nosotros','contacto'].forEach(function(id){ var el=document.getElementById(id); if(el) spy.observe(el); });

/* ======================================================================
   SERVICIOS: crea las tarjetas de equipos (con la lista DEVICES de datos.js)
   y hace funcionar los botones de filtro
   ====================================================================== */
var devBox = $('#devices');
devBox.innerHTML = DEVICES.map(function(d){
  var media = d.img
    ? '<img src="img/'+d.img+'.webp" alt="'+esc(d.n)+'" loading="lazy" width="720" height="480">'
    : '<div class="misc-art" role="img" aria-label="Otros equipos">'+icon('i-speaker')+icon('i-monitor')+icon('i-projector')+icon('i-headphones')+icon('i-plug')+icon('i-tv')+'</div>';
  return '<a class="device" data-c="'+d.c+'" href="'+waLink('Hola DuctiTech, quiero cotizar una reparación de: '+d.n+'. La falla es: ')+'" target="_blank" rel="noopener">'+
    '<div class="device-media"><span class="device-tag">'+CAT_LABEL[d.c]+'</span>'+media+'</div>'+
    '<div class="device-body"><h3>'+esc(d.n)+'</h3><p>'+esc(d.d)+'</p><span class="device-link">Cotizar '+icon('i-arrow-right')+'</span></div></a>';
}).join('');
$$('#deviceFilters .chip').forEach(function(ch){
  ch.addEventListener('click', function(){
    var f = ch.getAttribute('data-f');
    $$('#deviceFilters .chip').forEach(function(c){ c.setAttribute('aria-selected', c===ch); });
    $$('.device', devBox).forEach(function(d){ d.hidden = !(f==='all' || d.getAttribute('data-c')===f); });
  });
});

/* ======================================================================
   PRECIOS: botones de marca, buscador y tarjetas de precio
   (usa la lista CATALOG de datos.js)
   ====================================================================== */
var brandTabs = $('#brandTabs'), grid = $('#priceGrid'), gal = $('#gallery'), search = $('#catalogSearch'), searchBox = $('#searchBox');
var current = 'xbox';   /* marca que aparece primero */
brandTabs.innerHTML = Object.keys(CATALOG).map(function(k){
  return '<button class="chip" role="tab" data-b="'+k+'" aria-selected="'+(k===current)+'">'+CATALOG[k].label+' <span class="count">'+CATALOG[k].items.length+'</span></button>';
}).join('');

/* Arma una tarjeta de precio */
function cardHTML(it, brandKey){
  var b = CATALOG[brandKey];
  var media = it.img
    ? '<img src="img/'+it.img+'.webp" alt="'+esc(it.n)+'" loading="lazy" width="640" height="427">'
    : '<span class="monogram">'+esc(it.m||it.n.slice(0,4))+'</span>';
  var price = it.p ? '<span class="price-tag">$'+it.p+'<small>MXN</small></span>' : '<span class="price-tag quote">Cotización</span>';
  var msg = 'Hola DuctiTech, quiero agendar el mantenimiento de mi '+it.n+(it.p?' (precio de referencia $'+it.p+')':'')+'.';
  return '<article class="price-card b-'+brandKey+'">'+
    '<div class="price-media"><span class="brand-dot">'+b.label+'</span>'+media+price+'</div>'+
    '<div class="price-body"><h3>'+esc(it.n)+'</h3>'+
    '<span class="warranty">'+icon('i-shield-check')+' Garantía '+(it.w||'3 meses')+'</span>'+
    '<p>'+esc(it.d||GENERIC)+'</p>'+
    '<a class="btn btn-sm" href="'+waLink(msg)+'" target="_blank" rel="noopener">'+icon('b-whatsapp')+' '+(it.p?'Agendar':'Cotizar')+'</a></div></article>';
}
function renderGallery(key){
  var g = key ? CATALOG[key].gallery : [];
  gal.style.display = g.length ? '' : 'none';
  gal.innerHTML = g.map(function(x){ return '<button type="button" data-lb="img/'+x[0]+'.webp" data-cap="'+esc(x[1])+'"><img src="img/'+x[0]+'.webp" alt="'+esc(x[1])+'" loading="lazy"><span>'+esc(x[1])+'</span></button>'; }).join('');
}
/* Muestra el catálogo. Si alguien escribe en el buscador, busca en todas las marcas */
function renderCatalog(){
  var q = norm(search.value).trim();
  searchBox.classList.toggle('has-value', !!q);
  var html = '';
  if(q){
    var words = q.split(/\s+/);
    Object.keys(CATALOG).forEach(function(k){
      CATALOG[k].items.forEach(function(it){
        var hay = norm(it.n+' '+(it.k||'')+' '+CATALOG[k].label+' '+k);
        if(words.every(function(w){ return hay.indexOf(w)!==-1; })) html += cardHTML(it,k);
      });
    });
    renderGallery(null);
    $$('.chip',brandTabs).forEach(function(c){ c.setAttribute('aria-selected','false'); });
    if(!html){
      html = '<div class="empty"><strong>No encontramos “'+esc(search.value)+'” en el catálogo.</strong><br>Seguramente también podemos repararlo. Pregúntanos sin compromiso.<br>'+
        '<a class="btn btn-wa" href="'+waLink('Hola DuctiTech, ¿reparan '+search.value+'?')+'" target="_blank" rel="noopener">'+icon('b-whatsapp')+' Preguntar por WhatsApp</a></div>';
    }
  } else {
    $$('.chip',brandTabs).forEach(function(c){ c.setAttribute('aria-selected', c.getAttribute('data-b')===current); });
    renderGallery(current);
    html = CATALOG[current].items.map(function(it){ return cardHTML(it,current); }).join('');
  }
  grid.innerHTML = html;
}
brandTabs.addEventListener('click', function(e){
  var b = e.target.closest('[data-b]'); if(!b) return;
  current = b.getAttribute('data-b'); search.value=''; renderCatalog();
});
search.addEventListener('input', renderCatalog);
$('#searchClear').addEventListener('click', function(){ search.value=''; renderCatalog(); search.focus(); });
/* Enlace directo a una marca: index.html#playstation */
var hashBrand = location.hash.replace('#','');
if(CATALOG[hashBrand]){ current = hashBrand; setTimeout(function(){ document.getElementById('precios').scrollIntoView(); },50); }
renderCatalog();

/* ======================================================================
   VISOR DE FOTOS: al tocar una foto se abre en grande
   ====================================================================== */
var lb = $('#lightbox');
document.addEventListener('click', function(e){
  var t = e.target.closest('[data-lb]'); if(!t) return;
  $('#lbImg').src = t.getAttribute('data-lb'); $('#lbImg').alt = t.getAttribute('data-cap')||'';
  $('#lbCap').textContent = t.getAttribute('data-cap')||'';
  if(lb.showModal) lb.showModal(); else window.open(t.getAttribute('data-lb'),'_blank');
});
$('#lbClose').addEventListener('click', function(){ lb.close(); });
lb.addEventListener('click', function(e){ if(e.target===lb) lb.close(); });

/* ======================================================================
   OPINIONES: carrusel de reseñas (flechas, deslizar con el dedo
   y avance automático). Usa la lista REVIEWS de datos.js
   ====================================================================== */
var rev = $('#reviews');
rev.innerHTML = REVIEWS.map(function(r,i){
  var init = r.n.split(/\s+/).slice(0,2).map(function(p){return p.charAt(0);}).join('');
  var long = r.t.length > 330;   /* las reseñas largas se recortan con "Leer completa" */
  return '<article class="review"><div class="stars" aria-label="5 de 5 estrellas">'+icon('i-star')+icon('i-star')+icon('i-star')+icon('i-star')+icon('i-star')+'</div>'+
    '<blockquote class="'+(long?'clamp':'')+'" id="rv'+i+'">'+esc(r.t)+'</blockquote>'+
    (long?'<button class="more" data-rv="rv'+i+'" aria-expanded="false">Leer completa</button>':'')+
    '<div class="reviewer"><span class="avatar" aria-hidden="true">'+esc(init)+'</span><div><strong>'+esc(r.n)+'</strong><span>'+icon('b-google')+' Reseña en Google</span></div></div></article>';
}).join('');
rev.addEventListener('click', function(e){
  var b = e.target.closest('[data-rv]'); if(!b) return;
  var q = document.getElementById(b.getAttribute('data-rv'));
  var closed = q.classList.toggle('clamp');
  b.textContent = closed ? 'Leer completa' : 'Mostrar menos';
  b.setAttribute('aria-expanded', !closed);
});
function revStep(dir){
  var card = rev.querySelector('.review'); if(!card) return;
  var w = card.getBoundingClientRect().width + 20;
  var max = rev.scrollWidth - rev.clientWidth - 4;
  if(dir>0 && rev.scrollLeft >= max) rev.scrollTo({left:0,behavior:'smooth'});
  else rev.scrollBy({left:dir*w,behavior:'smooth'});
}
$('#revPrev').addEventListener('click', function(){ revStep(-1); });
$('#revNext').addEventListener('click', function(){ revStep(1); });
rev.addEventListener('keydown', function(e){ if(e.key==='ArrowRight') revStep(1); if(e.key==='ArrowLeft') revStep(-1); });
var revTimer = null, reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function revStart(){ if(!reduce && !revTimer) revTimer = setInterval(function(){ revStep(1); }, 6500); }  /* cambia cada 6.5 segundos (6500) */
function revStop(){ clearInterval(revTimer); revTimer = null; }
['mouseenter','focusin','touchstart'].forEach(function(ev){ rev.addEventListener(ev, revStop, {passive:true}); });
rev.addEventListener('mouseleave', revStart);
document.addEventListener('visibilitychange', function(){ document.hidden ? revStop() : revStart(); });

/* El carrusel y el mapa solo se activan cuando la persona llega a esa parte (la página carga más rápido) */
var mapFrame = $('.map iframe');
var lazy = new IntersectionObserver(function(entries){
  entries.forEach(function(en){
    if(!en.isIntersecting) return;
    if(en.target.id==='opiniones') revStart();
    if(en.target===mapFrame) mapFrame.src = mapFrame.getAttribute('data-src');
    lazy.unobserve(en.target);
  });
},{rootMargin:'200px'});
lazy.observe($('#opiniones')); lazy.observe(mapFrame);

/* ======================================================================
   SEGUIMIENTO: revisa el folio y el NIP, busca la orden
   en la base de datos y muestra el resultado
   ====================================================================== */
var form = $('#trackForm'), fFolio = $('#folio'), fNip = $('#nip'), btn = $('#trackBtn'), msg = $('#formMsg'), out = $('#result');
var failed = 0, lastFolio = '';
/* Pasos de la línea de tiempo de la orden (en orden) */
var STEPS = [
  {k:'recibido', l:'Recibido', i:'i-inbox'},
  {k:'diagnostico', l:'Diagnóstico', i:'i-scan-search'},
  {k:'reparacion', l:'Reparación', i:'i-wrench'},
  {k:'listo', l:'Listo', i:'i-circle-check'},
  {k:'entregado', l:'Entregado', i:'i-package-check'}
];
/* Traduce el estado guardado en el sistema (ej. "En reparación") a un paso de la línea */
function statusInfo(raw){
  var s = (raw || 'Recibido').toString(), l = s.toLowerCase(), m = 'recibido';
  if(/entreg/.test(l)) m='entregado'; else if(/listo|termin|complet/.test(l)) m='listo'; else if(/repara/.test(l)) m='reparacion'; else if(/diagn/.test(l)) m='diagnostico';
  return {m:m, label:s.charAt(0).toUpperCase()+s.slice(1), idx:STEPS.map(function(x){return x.k;}).indexOf(m)};
}
/* Evita que las fechas salgan con un día de diferencia */
function toDate(v){ var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v)); return m ? new Date(+m[1],m[2]-1,+m[3]) : new Date(v); }
/* Privacidad: el nombre se muestra como "Juan P. L." y del teléfono solo los últimos 4 dígitos */
function cleanName(n){ return n ? n.replace(/^-\s*/,'').trim() : n; }
function maskName(n){ var c=cleanName(n); if(!c) return 'Cliente'; var p=c.split(/\s+/).filter(Boolean); return p[0]+(p.length>1?' '+p.slice(1).map(function(x){return x.charAt(0).toUpperCase()+'.';}).join(' '):''); }
function maskPhone(p){ if(!p) return 'No registrado'; var d=String(p).replace(/\D/g,''); return d.length<4?'••••':'•••• •• '+d.slice(-4); }
function payMethod(m){ if(!m) return 'No especificado'; return ({card:'Tarjeta',transfer:'Transferencia',cash:'Efectivo'})[m.toLowerCase()] || m; }
function showMsg(text, type){ msg.className = 'form-msg show '+(type||'error'); msg.innerHTML = icon(type==='wait'?'i-hourglass':'i-shield-alert')+'<span>'+text+'</span>'; }
function hideMsg(){ msg.className = 'form-msg'; msg.innerHTML=''; }
function setLoading(on){ btn.disabled = on; btn.innerHTML = on ? icon('i-loader-circle','spinner')+' Consultando…' : icon('i-search')+' Consultar estado'; }

fNip.addEventListener('input', function(){ this.value = this.value.replace(/\D/g,'').slice(0,4); this.removeAttribute('aria-invalid'); });
fFolio.addEventListener('input', function(){ this.value = this.value.toUpperCase().replace(/\s+/g,''); this.removeAttribute('aria-invalid'); });
$('#nipToggle').addEventListener('click', function(){ var s = fNip.type==='password'; fNip.type = s?'text':'password'; this.textContent = s?'Ocultar':'Ver'; this.setAttribute('aria-label', s?'Ocultar NIP':'Mostrar NIP'); });

/* Si alguien se equivoca de NIP 3 veces, tiene que esperar unos segundos antes de volver a intentar */
function cooldown(seconds){
  var left = seconds; fNip.disabled = true; btn.disabled = true;
  showMsg('Demasiados intentos. Espera <b id="cd">'+left+'</b> s e inténtalo de nuevo.','wait');
  var t = setInterval(function(){
    left--; var el = $('#cd'); if(el) el.textContent = left;
    if(left<=0){ clearInterval(t); fNip.disabled=false; btn.disabled=false; hideMsg(); fNip.focus(); }
  },1000);
}

/* Pregunta a la base de datos por la orden */
async function consultar(prefix, number, nip){
  var r = await fetch(SUPABASE_URL+'/rest/v1/rpc/consultar_orden',{method:'POST',headers:{'apikey':SUPABASE_ANON_KEY,'Authorization':'Bearer '+SUPABASE_ANON_KEY,'Content-Type':'application/json'},body:JSON.stringify({folio_prefix:prefix,folio_number:number,nip:nip})});
  if(!r.ok) throw new Error('HTTP '+r.status);
  return r.json();
}

form.addEventListener('submit', async function(e){
  e.preventDefault(); hideMsg();
  var folio = fFolio.value.trim().toUpperCase(), nip = fNip.value.trim();
  if(folio !== lastFolio){ failed = 0; lastFolio = folio; }
  var parts = folio.split('-');
  if(!folio){ fFolio.setAttribute('aria-invalid','true'); fFolio.focus(); return showMsg('Escribe tu número de folio.'); }
  if(parts.length!==2 || !parts[0] || isNaN(parseInt(parts[1],10))){ fFolio.setAttribute('aria-invalid','true'); fFolio.focus(); return showMsg('El folio debe tener el formato PREFIJO-NÚMERO, por ejemplo TV-12345.'); }
  if(!/^\d{4}$/.test(nip)){ fNip.setAttribute('aria-invalid','true'); fNip.focus(); return showMsg('El NIP debe tener exactamente 4 dígitos.'); }
  setLoading(true);
  try{
    var data = await consultar(parts[0], parseInt(parts[1],10), nip);
    if(!data || data.error || !data.orden){
      failed++;
      setLoading(false);
      fNip.value=''; fNip.setAttribute('aria-invalid','true');
      if(failed>=3) return cooldown(Math.min(5*(failed-2),20));
      fNip.focus();
      return showMsg(esc((data && data.error) || 'No encontramos una orden con ese folio y NIP. Revisa los datos e intenta de nuevo.'));
    }
    failed = 0; setLoading(false);
    renderOrder(folio, data);
    if(history.replaceState){ var u = new URL(location.href); u.searchParams.set('folio', folio); history.replaceState(null,'',u.toString()); }
  }catch(err){
    console.error(err); setLoading(false);
    showMsg('No pudimos conectar con el sistema. Revisa tu conexión o escríbenos por WhatsApp.');
  }
});

/* Muestra la orden encontrada: estado, datos, artículos, pagos y fotos */
function renderOrder(folio, data){
  var o = data.orden || {}, sv = data.servicios || [], im = data.imagenes || [], pg = data.pagos || [];
  /* Si hay varios artículos, el estado general es el del más atrasado */
  var idx = sv.length ? Math.min.apply(null, sv.map(function(s){ return statusInfo(s.status).idx; })) : 0;
  var fecha = o.order_date ? toDate(o.order_date).toLocaleDateString('es-MX',{year:'numeric',month:'short',day:'numeric'}) : 'No registrada';
  var total = (o.total_amount!==null && o.total_amount!==undefined) ? money(o.total_amount) : 'Pendiente';
  var tl = STEPS.map(function(s,i){
    var cls = i<idx || (i===idx && idx===STEPS.length-1) ? 'done' : (i===idx ? 'now' : '');
    return '<div class="tl '+cls+'"><span class="dot">'+icon(i<idx?'i-check':s.i)+'</span>'+s.l+'</div>';
  }).join('');
  var items = sv.length ? '<div class="items">'+sv.map(function(s){
    var st = statusInfo(s.status);
    return '<div class="item"><div><strong>Artículo #'+esc(s.article_id||'N/A')+(Number(s.quantity)>1?' (×'+esc(s.quantity)+')':'')+'</strong><span>'+esc(s.falla_principal||'Falla no especificada')+'</span></div><span class="badge '+st.m+'">'+esc(st.label)+'</span></div>';
  }).join('')+'</div>' : '<p class="muted-line">'+icon('i-info')+' No hay artículos registrados en esta orden.</p>';
  var saldo = Number(data.saldo||0);
  var pays = '<div class="money"><div><span>Monto total</span><strong>'+esc(total)+'</strong></div><div class="paid"><span>Pagado</span><strong>'+money(data.total_pagado)+'</strong></div><div class="'+(saldo>0?'due':'paid')+'"><span>Saldo pendiente</span><strong>'+money(saldo)+'</strong></div></div>'+
    (pg.length ? '<ul class="pay-list">'+pg.map(function(p){ return '<li><span>'+esc(toDate(p.payment_date).toLocaleDateString('es-MX'))+', '+esc(payMethod(p.payment_method))+'</span><b>'+money(p.amount)+'</b></li>'; }).join('')+'</ul>' : '<p class="muted-line" style="margin-top:12px">'+icon('i-info')+' Aún no hay pagos registrados.</p>');
  var photos = im.length ? '<div class="photos">'+im.map(function(x,i){ return '<button type="button" data-lb="'+safeUrl(x.image_url)+'" data-cap="Foto '+(i+1)+' del servicio"><img src="'+safeUrl(x.image_url)+'" alt="Foto '+(i+1)+' del servicio" loading="lazy"></button>'; }).join('')+'</div>' : '<p class="muted-line">'+icon('i-image')+' Este servicio aún no tiene fotos.</p>';

  out.innerHTML = '<div class="order">'+
    '<div class="order-head"><div><small>Orden</small><h3>'+esc(folio)+'</h3></div><span class="verified">'+icon('i-lock')+' Verificado</span></div>'+
    '<div class="order-sec"><h4>'+icon('i-navigation')+' Estado</h4><div class="timeline">'+tl+'</div></div>'+
    '<div class="order-sec"><div class="kv"><div><span>Cliente</span><strong>'+esc(maskName(o.client_name))+'</strong></div><div><span>Teléfono</span><strong>'+esc(maskPhone(o.client_telephone))+'</strong></div><div><span>Equipo</span><strong>'+esc(o.article_type_name||'No especificado')+'</strong></div><div><span>Ingreso</span><strong>'+esc(fecha)+'</strong></div></div></div>'+
    '<div class="order-sec"><h4>'+icon('i-wrench')+' Artículos ('+sv.length+')</h4>'+items+'</div>'+
    '<div class="order-sec"><h4>'+icon('i-coins')+' Pagos</h4>'+pays+'</div>'+
    '<div class="order-sec"><h4>'+icon('i-image')+' Fotos del servicio</h4>'+photos+'</div>'+
    '<div class="order-sec order-foot"><a class="btn btn-wa btn-sm" href="'+waLink('Hola DuctiTech, tengo una duda sobre mi orden '+folio+'.')+'" target="_blank" rel="noopener">'+icon('b-whatsapp')+' Preguntar por esta orden</a><button type="button" class="btn btn-sm" id="newQuery">'+icon('i-search')+' Consultar otro folio</button></div>'+
  '</div>';
  out.classList.add('show');
  $('#newQuery').addEventListener('click', function(){ out.classList.remove('show'); out.innerHTML=''; fFolio.value=''; fNip.value=''; fFolio.focus(); form.scrollIntoView({behavior:'smooth',block:'center'}); });
  out.scrollIntoView({behavior:'smooth', block:'start'});
}

/* Si el enlace trae ?folio=TV-12345, el folio se escribe solo */
var qp = new URLSearchParams(location.search).get('folio');
if(qp){ fFolio.value = qp.toUpperCase(); setTimeout(function(){ document.getElementById('seguimiento').scrollIntoView(); fNip.focus({preventScroll:true}); }, 60); }
})();
