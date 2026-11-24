(function(){if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;var o=Array.prototype.slice.call(document.querySelectorAll(".band-photo .ph, .ph.bleed"));o.forEach(function(n){n.classList.add("plx")});var i=!1;function c(){i=!1;var n=innerHeight,s=innerWidth<700?.14:.24;o.forEach(function(a){var e=a.getBoundingClientRect();if(!(e.height===0||e.bottom<-50||e.top>n+50)){var r=(e.top+e.height/2-n/2)/(n/2+e.height/2);r=Math.max(-1,Math.min(1,r)),a.style.setProperty("--py",(-r*e.height*s).toFixed(1)+"px")}})}function t(){i||(i=!0,requestAnimationFrame(c))}addEventListener("scroll",t,{passive:!0}),addEventListener("resize",t),addEventListener("hashchange",function(){setTimeout(t,300)}),addEventListener("popstate",function(){setTimeout(t,300)}),document.addEventListener("click",function(){setTimeout(t,400)}),t()})();

/* Fotos en su proporción real: home (selección de proyectos), detalle de proyecto y grilla de proyectos */
(function(){
var css=".view .rhy .fig .ph[data-ar],.view .gal-stack .fig .ph[data-ar],.view .rows--grid .row .ph[data-ar]{aspect-ratio:var(--ar)!important;height:auto!important;min-height:0!important;flex:none!important}"
+".view .proyecto .feature[data-ar]{height:auto;aspect-ratio:var(--ar)}"
+".view .proyecto .feature[data-ar] .caps,.view .proyecto .feature[data-ar] .feature__title{max-width:100%}"
+".view .g2:has(.proyecto .feature[data-ar]){align-items:start}"
+".view .rhy{align-items:start}"
+"@media(min-width:901px){.view .rhy[data-just]{grid-template-columns:var(--cols)!important;align-items:start}.view .rhy[data-just] .fig:nth-child(n){margin-top:0!important}}";
var st=document.createElement("style");st.setAttribute("data-proporcion","");st.textContent=css;document.head.appendChild(st);
var link=document.querySelector('link[rel=stylesheet][href*="styles"]');
var base=link?link.href:location.href;
var cache={};
function urlOf(el){
  var cs=getComputedStyle(el),v=(cs.getPropertyValue("--foto-s")||cs.getPropertyValue("--foto")||"").trim();
  var m=/url\(\s*["']?([^"')]+)["']?\s*\)/.exec(v);
  if(!m)return null;
  try{return new URL(m[1],base).href}catch(e){return null}
}
function ratio(u){
  if(cache[u])return cache[u];
  cache[u]=new Promise(function(res){var i=new Image();i.onload=function(){res(i.naturalWidth&&i.naturalHeight?i.naturalWidth/i.naturalHeight:null)};i.onerror=function(){res(null)};i.src=u});
  return cache[u];
}
function apply(el){
  if(el.dataset.ar)return Promise.resolve(+el.dataset.ar);
  var u=urlOf(el);if(!u)return Promise.resolve(null);
  return ratio(u).then(function(r){
    if(r){var v=r.toFixed(4);el.dataset.ar=v;el.style.setProperty("--ar",v);}
    return r;
  });
}
function justify(g){
  var phs=Array.prototype.slice.call(g.querySelectorAll(".fig .ph"));
  if(g.dataset.just||phs.length<2||phs.length>3)return;
  var cls=g.className;
  if(!/rhy--(pair|widetall|trio)/.test(cls))return;
  var rs=phs.map(function(p){return +p.dataset.ar});
  if(rs.some(function(r){return !r}))return;
  g.style.setProperty("--cols",rs.map(function(r){return r.toFixed(3)+"fr"}).join(" "));
  g.dataset.just="1";
}
function run(){
  var els=document.querySelectorAll(".rhy .fig .ph[data-zoom],.rows--grid .row .ph,.proyecto .feature");
  Array.prototype.forEach.call(els,function(el){
    apply(el).then(function(){
      var g=el.closest&&el.closest(".rhy");
      if(g)justify(g);
    });
  });
}
function start(){run();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start);else start();
/* la grilla de proyectos cambia de lista a grilla: recalcula */
document.addEventListener("click",function(){setTimeout(run,50)});
})();

/* Header estable: no cambia de alto al hacer scroll (evita que el contenido salte) */
(function(){var h=document.querySelector(".header");if(!h)return;
var mo=new MutationObserver(function(){if(h.classList.contains("is-compact"))h.classList.remove("is-compact")});
mo.observe(h,{attributes:true,attributeFilter:["class"]});h.classList.remove("is-compact")})();

/* Testimonios ocultos por ahora (para volver a mostrarlos, borra este bloque) */
(function(){
var st=document.createElement("style");st.textContent="[data-oculto]{display:none!important}";document.head.appendChild(st);
Array.prototype.forEach.call(document.querySelectorAll(".testimonios"),function(t){
  var s=t.closest("section");if(!s)return;
  s.setAttribute("data-oculto","");
  var b=s.parentElement;
  if(b&&b.classList.contains("band")&&b.children.length===1)b.setAttribute("data-oculto","");
});
})();
