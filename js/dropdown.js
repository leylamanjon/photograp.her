(function(){var drop=document.querySelector('.drop');if(!drop)return;var b=drop.querySelector('button');
function set(o){drop.classList.toggle('is-open',o);b.setAttribute('aria-expanded',String(o));}
b.addEventListener('click',function(e){e.stopPropagation();set(!drop.classList.contains('is-open'));});
drop.addEventListener('keydown',function(e){if(e.key==='Escape'&&drop.classList.contains('is-open')){e.stopPropagation();set(false);b.focus();}});
drop.addEventListener('focusout',function(e){if(e.relatedTarget&&!drop.contains(e.relatedTarget))set(false);});
document.addEventListener('click',function(e){if(!drop.contains(e.target))set(false);});
window.addEventListener('hashchange',function(){set(false);});
drop.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){set(false);});});
window.addEventListener('scroll',function(){if(drop.classList.contains('is-open'))set(false);},{passive:true});
})();
