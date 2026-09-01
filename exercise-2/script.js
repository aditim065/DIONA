document.querySelectorAll('[data-exclusive]').forEach(group=>{
  group.addEventListener('change',event=>{
    if(event.target.type!=='checkbox'||!event.target.checked)return;
    group.querySelectorAll('input[type="checkbox"]').forEach(box=>{if(box!==event.target)box.checked=false});
  });
});

document.querySelectorAll('[data-toggle]').forEach(box=>{
  const target=document.getElementById(box.dataset.toggle);
  const sync=()=>{if(!target)return;target.disabled=!box.checked;if(target.disabled)target.value=''};
  box.addEventListener('change',sync);sync();
});

const pain=document.querySelector('.pain-grid');
for(let n=1;n<=10;n++){
  const label=document.createElement('label');
  label.innerHTML=`<input type="checkbox" aria-label="Pain level ${n}"><span>${n}</span>`;
  pain.appendChild(label);
}
