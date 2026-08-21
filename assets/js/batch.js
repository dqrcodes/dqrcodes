
document.addEventListener('DOMContentLoaded',()=>{
 const file=$('#csvFile'), text=$('#csvText'), table=$('#batchTable'), progress=$('#batchProgress'), results=$('#batchResults');
 let rows=[];
 function parse(){
  const raw=text.value.trim(); if(!raw)return [];
  const lines=raw.split(/\r?\n/).filter(Boolean); const headers=lines.shift().split(',').map(x=>x.trim().toLowerCase());
  const ni=Math.max(0,headers.indexOf('name')), ui=Math.max(0,headers.indexOf('url'));
  return lines.map((line,i)=>{const cells=line.split(',');return {name:cells[ni]||`QR ${i+1}`,url:cells[ui]||cells[0]||''}});
 }
 function render(){
  rows=parse(); table.innerHTML=rows.length?rows.map((r,i)=>`<tr><td>${i+1}</td><td>${escapeHtml(r.name)}</td><td class="text-break">${escapeHtml(r.url)}</td><td class="${/^https?:\/\//i.test(r.url)?'text-success':'text-danger'}">${/^https?:\/\//i.test(r.url)?'Valid':'Invalid URL'}</td></tr>`).join(''):'<tr><td colspan="4" class="text-center muted py-4">Add CSV rows to preview.</td></tr>';
 }
 text.oninput=render;
 file.onchange=()=>{
  const f=file.files?.[0];if(!f)return;
  if(f.size>5*1024*1024){toast('CSV must be under 5 MB.','warning');return}
  const r=new FileReader();r.onload=()=>{text.value=r.result;render()};r.readAsText(f);
 };
 $('#generateBatch').onclick=async()=>{
  rows=parse(); if(!rows.length){toast('Add at least one row.','warning');return}
  results.innerHTML='';progress.style.width='0%';progress.textContent='0%';
  for(let i=0;i<rows.length;i++){
   const r=rows[i]; const valid=/^https?:\/\/.+/i.test(r.url);
   await new Promise(res=>setTimeout(res,30));
   const id='batch-'+Date.now()+'-'+i;
   if(valid){QRHistory.save({id,title:r.name,type:'url',typeName:'URL',category:'Basic & Web',data:r.url,style:{},createdAt:new Date().toISOString()});results.insertAdjacentHTML('beforeend',`<div class="alert alert-success py-2 mb-2">✓ ${escapeHtml(r.name)} generated and saved locally.</div>`)}
   else results.insertAdjacentHTML('beforeend',`<div class="alert alert-danger py-2 mb-2">✕ ${escapeHtml(r.name)} skipped: invalid URL.</div>`);
   const pct=Math.round((i+1)/rows.length*100);progress.style.width=pct+'%';progress.textContent=pct+'%';
  }
  toast('Batch generation completed.','success');
 };
 render();
});
