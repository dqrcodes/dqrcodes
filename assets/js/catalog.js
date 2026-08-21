
document.addEventListener('DOMContentLoaded',()=>{
 const grid=$('#typeGrid'), search=$('#catalogSearch'), chips=$('#categoryChips'), count=$('#resultCount');
 let category='';
 const cats=[...new Set(QR_TYPES.map(x=>x.category))];
 chips.innerHTML=`<button class="btn btn-sm btn-primary rounded-pill" data-cat="">All</button>`+cats.map(c=>`<button class="btn btn-sm btn-outline-secondary rounded-pill" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('');
 function render(){
   const q=search.value.toLowerCase();
   const list=QR_TYPES.filter(t=>(!category||t.category===category)&&(t.name+' '+t.category+' '+t.description+' '+t.keywords.join(' ')).toLowerCase().includes(q));
   count.textContent=`${list.length} result${list.length===1?'':'s'}`;
   grid.innerHTML=list.map(t=>`<div class="col-sm-6 col-lg-4 col-xl-3"><div class="card-pro type-card" data-open="${t.id}">
     <div class="d-flex justify-content-between align-items-start"><div class="icon-box"><i class="bi ${t.icon}"></i></div>${t.popular?'<span class="badge badge-soft rounded-pill">Popular</span>':''}</div>
     <h6 class="fw-bold mt-3 mb-1">${escapeHtml(t.name)}</h6><div class="small muted mb-3">${escapeHtml(t.category)}</div><p class="small muted mb-4">${escapeHtml(t.description)}</p>
     <button class="btn btn-sm btn-primary w-100">Create QR</button>
   </div></div>`).join('') || `<div class="col-12"><div class="empty card-pro">No QR types match your search.</div></div>`;
   $$('[data-open]').forEach(el=>el.addEventListener('click',()=>location.href='generator.html?type='+encodeURIComponent(el.dataset.open)));
 }
 chips.addEventListener('click',e=>{const b=e.target.closest('[data-cat]');if(!b)return;category=b.dataset.cat;$$('[data-cat]',chips).forEach(x=>x.classList.toggle('btn-primary',x===b));$$('[data-cat]',chips).forEach(x=>x.classList.toggle('btn-outline-secondary',x!==b));render()});
 search.addEventListener('input',render);
 const q=new URLSearchParams(location.search).get('q');if(q)search.value=q;
 render();
});
