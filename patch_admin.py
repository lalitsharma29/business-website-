import re

with open(r'admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

new_script = r"""<script>
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAdmin()) return;
  await loadStats();
  await renderDesignCards();
  await renderBookings('all');
  await renderUsers();
  setupDragDrop();
  updateStorageBar();
});

function updateStorageBar() {
  const bar = document.getElementById('storageBar');
  if (bar) {
    bar.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;padding:4px 0;">
        <span style="font-size:1.6rem;">&#x2601;&#xFE0F;</span>
        <div style="flex:1;">
          <div style="font-weight:700;color:var(--maroon-dark);font-size:0.9rem;">MongoDB Cloud Storage &ndash; <span style="color:#27ae60;">Unlimited Images!</span></div>
          <div style="font-size:0.75rem;color:var(--text-light);margin-top:2px;">Images stored in MongoDB GridFS. No browser storage limits. Upload as many as you want!</div>
        </div>
        <span style="background:rgba(39,174,96,0.12);color:#27ae60;padding:5px 14px;border-radius:20px;font-size:0.78rem;font-weight:700;white-space:nowrap;">&#x2705; Cloud Connected</span>
      </div>`;
  }
}

// ===== NAVIGATION =====
function showTab(name, el) {
  ['overview','upload','designs','bookings','users'].forEach(t => {
    const tab = document.getElementById('tab-'+t);
    if(tab) tab.style.display='none';
  });
  document.getElementById('tab-'+name).style.display='block';
  const titles={overview:'Overview',upload:'Add New Design',designs:'Manage Designs',bookings:'Bookings',users:'Customers'};
  document.getElementById('panelTitle').textContent = titles[name]||'';
  document.querySelectorAll('.sidebar-nav a').forEach(a=>a.classList.remove('active'));
  if(el) el.classList.add('active');
}

// ===== STATS =====
async function loadStats() {
  try {
    const stats = await getStats();
    document.getElementById('totalDesigns').textContent    = stats.totalDesigns;
    document.getElementById('totalBookings').textContent   = stats.totalBookings;
    document.getElementById('pendingBookings').textContent = stats.pendingBookings;
    document.getElementById('totalUsers').textContent      = stats.totalUsers;
    const bookings = await getBookings();
    const recent = [...bookings].slice(0,5);
    document.getElementById('recentBookings').innerHTML = recent.length ? recent.map(b=>`
      <tr><td><strong>${b.name}</strong></td><td>${b.service}</td><td>${b.date||'&mdash;'}</td>
      <td><a href="tel:${b.phone}" style="color:var(--maroon);font-weight:600;">${b.phone}</a></td>
      <td><span class="badge badge-${b.status}">${b.status}</span></td></tr>`).join('') :
      '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-light);">No bookings yet.</td></tr>';
  } catch(e) { console.error('loadStats error:', e); }
}

// ===== IMAGE UPLOAD =====
let uploadedImageFile = null;
let uploadedImageData = null;
let editImageFile     = null;
let editImageData     = null;

function setupDragDrop() {
  const zone=document.getElementById('uploadZone');
  if(!zone) return;
  zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('drag-over');});
  zone.addEventListener('dragleave',()=>zone.classList.remove('drag-over'));
  zone.addEventListener('drop',e=>{
    e.preventDefault(); zone.classList.remove('drag-over');
    const file=e.dataTransfer.files[0];
    if(file&&file.type.startsWith('image/')) processImageFile(file,'imgPreview',false);
  });
}

function handleImageSelect(e) {
  const file=e.target.files[0];
  if(file) processImageFile(file,'imgPreview',false);
}
function handleEditImage(e) {
  const file=e.target.files[0];
  if(file) processImageFile(file,'eImgPreview',true);
}

async function processImageFile(file, previewId, isEdit=false) {
  if(file.size>20*1024*1024){ showToast('Image too large! Max 20MB.','error'); return; }
  const reader=new FileReader();
  reader.onload=async(ev)=>{
    try{
      showToast('Preparing image...','success');
      const compressed=await compressImage(ev.target.result,1200,0.82);
      const kb=Math.round(compressed.length*0.75/1024);
      if(isEdit){ editImageData=compressed; editImageFile=dataURLtoFile(compressed,'edit.jpg'); }
      else      { uploadedImageData=compressed; uploadedImageFile=dataURLtoFile(compressed,'upload.jpg'); }
      const prev=document.getElementById(previewId);
      prev.src=compressed; prev.style.display='block';
      showToast('Image ready ('+kb+' KB) - will upload to MongoDB','success');
    }catch(err){ showToast('Could not process image.','error'); }
  };
  reader.readAsDataURL(file);
}

function showUrlPreview() {
  const url=document.getElementById('dImageUrl').value;
  if(url){
    const p=document.getElementById('imgPreview'); p.src=url; p.style.display='block';
    uploadedImageData=null; uploadedImageFile=null;
  }
}

function resetUploadForm() {
  document.getElementById('addDesignForm').reset();
  document.getElementById('dImageUrl').value='';
  const p=document.getElementById('imgPreview'); p.src=''; p.style.display='none';
  uploadedImageData=null; uploadedImageFile=null;
  document.getElementById('imageFileInput').value='';
}

async function submitNewDesign(e) {
  e.preventDefault();
  const btn=e.target.querySelector('button[type="submit"]');
  if(btn){btn.disabled=true;btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Saving to MongoDB...';}
  try {
    const urlVal=document.getElementById('dImageUrl').value;
    const design={
      name:     document.getElementById('dName').value,
      category: document.getElementById('dCat').value,
      price:    parseInt(document.getElementById('dPrice').value),
      desc:     document.getElementById('dDesc').value,
      imageUrl: urlVal||'',
      serial:   document.getElementById('dSerial').value||''
    };
    await addDesign(design, uploadedImageFile);
    showToast('Design saved to MongoDB!','success');
    resetUploadForm(); await loadStats(); await renderDesignCards(); updateStorageBar();
  } catch(err){ showToast('Error: '+err.message,'error'); }
  finally{ if(btn){btn.disabled=false;btn.innerHTML='<i class="fas fa-save"></i> Save Design to Catalog';} }
}

// ===== DESIGN CARDS =====
async function renderDesignCards() {
  const grid=document.getElementById('designManageGrid');
  const badge=document.getElementById('designCountBadge');
  if(!grid) return;
  grid.innerHTML='<p style="color:var(--text-light);padding:20px;text-align:center;"><i class="fas fa-spinner fa-spin"></i> Loading from MongoDB...</p>';
  try {
    const designs=await getDesigns();
    if(badge) badge.textContent='('+designs.length+' total)';
    grid.innerHTML=designs.length ? designs.map(d=>`
      <div class="design-manage-card">
        <span class="design-card-badge">${d.category}</span>
        <img src="${d.image||'assets/images/bridal_mehndi_1.png'}" alt="${d.name}"
          onerror="this.src='assets/images/bridal_mehndi_1.png'" loading="lazy" />
        <div class="design-card-body">
          <span class="design-card-serial">${d.serial}</span>
          <div class="design-card-name">${d.name}</div>
          <div class="price-edit-wrap">
            <span class="price-display" id="pd-${d.id||d._id}" onclick="startPriceEdit('${d.id||d._id}')" title="Click to edit price">Rs.${Number(d.price).toLocaleString()}</span>
            <input class="price-input" id="pi-${d.id||d._id}" type="number" value="${d.price}" min="0" />
            <button class="price-save-btn" id="ps-${d.id||d._id}" onclick="savePriceEdit('${d.id||d._id}')">&#x2713;</button>
          </div>
          <div class="design-card-actions">
            <button class="dca-btn dca-edit" onclick="openEditModal('${d.id||d._id}')"><i class="fas fa-edit"></i> Edit</button>
            <button class="dca-btn dca-del"  onclick="removeDesign('${d.id||d._id}')"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>`).join('') : '<p style="color:var(--text-light);padding:30px;text-align:center;">No designs yet. Add your first one!</p>';
  } catch(e){ grid.innerHTML='<p style="color:#e74c3c;padding:20px;text-align:center;">Could not load designs. Check backend connection.</p>'; }
}

// ===== INLINE PRICE EDITING =====
function startPriceEdit(id) {
  document.getElementById('pd-'+id).style.display='none';
  const pi=document.getElementById('pi-'+id); pi.style.display='inline-block'; pi.focus();
  document.getElementById('ps-'+id).style.display='inline-block';
  pi.onkeydown=e=>{if(e.key==='Enter')savePriceEdit(id);if(e.key==='Escape')cancelPriceEdit(id);};
}
async function savePriceEdit(id) {
  const newPrice=parseInt(document.getElementById('pi-'+id).value);
  if(isNaN(newPrice)||newPrice<0) return;
  await updateDesignPrice(id, newPrice);
  cancelPriceEdit(id);
  document.getElementById('pd-'+id).textContent='Rs.'+newPrice.toLocaleString();
  showToast('Price updated to Rs.'+newPrice.toLocaleString(),'success');
}
function cancelPriceEdit(id) {
  document.getElementById('pd-'+id).style.display='';
  document.getElementById('pi-'+id).style.display='none';
  document.getElementById('ps-'+id).style.display='none';
}
async function removeDesign(id) {
  if(!confirm('Delete this design from MongoDB?')) return;
  await deleteDesign(id); await renderDesignCards(); await loadStats(); showToast('Design deleted.');
}

// ===== EDIT MODAL =====
async function openEditModal(id) {
  editImageData=null; editImageFile=null;
  const designs=await getDesigns();
  const d=designs.find(x=>String(x.id||x._id)===String(id)); if(!d) return;
  document.getElementById('eId').value=String(d.id||d._id);
  document.getElementById('eName').value=d.name;
  document.getElementById('eCat').value=d.category;
  document.getElementById('ePrice').value=d.price;
  document.getElementById('eSerial').value=d.serial||'';
  document.getElementById('eDesc').value=d.desc||'';
  document.getElementById('eImageUrl').value=d.imageUrl||'';
  const prev=document.getElementById('eImgPreview');
  prev.src=d.image||''; prev.style.display=d.image?'block':'none';
  document.getElementById('editModal').classList.add('active');
}
function closeEditModal(){document.getElementById('editModal').classList.remove('active'); editImageData=null; editImageFile=null;}
async function saveEditForm(e) {
  e.preventDefault();
  const btn=e.target.querySelector('button[type="submit"]');
  if(btn){btn.disabled=true;btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Saving...';}
  const id=document.getElementById('eId').value;
  try {
    await updateDesign(id,{
      name:     document.getElementById('eName').value,
      category: document.getElementById('eCat').value,
      price:    parseInt(document.getElementById('ePrice').value),
      serial:   document.getElementById('eSerial').value,
      desc:     document.getElementById('eDesc').value,
      imageUrl: document.getElementById('eImageUrl').value
    }, editImageFile);
    showToast('Design updated!','success');
    closeEditModal(); await renderDesignCards();
  } catch(err){ showToast('Error: '+err.message,'error'); }
  finally{ if(btn){btn.disabled=false;btn.innerHTML='<i class="fas fa-save"></i> Save Changes';} }
}

// ===== BOOKINGS =====
async function renderBookings(filter) {
  const tbody=document.getElementById('bookingsTable'); if(!tbody) return;
  tbody.innerHTML='<tr><td colspan="8" style="text-align:center;padding:20px;"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';
  let bookings=await getBookings();
  if(filter!=='all') bookings=bookings.filter(b=>b.status===filter);
  tbody.innerHTML=bookings.length ? bookings.map(b=>`
    <tr><td>${b.name}</td><td><a href="tel:${b.phone}">${b.phone}</a></td>
    <td>${b.service}</td><td>${b.design||'&mdash;'}</td>
    <td>${b.date||'&mdash;'}<br/><small>${b.time||''}</small></td>
    <td style="font-size:0.75rem;">${b.address||'&mdash;'}</td>
    <td><span class="badge badge-${b.status}">${b.status}</span></td>
    <td><div class="action-btns">
      ${b.status==='pending'?`<button class="action-btn confirm" onclick="confirmBooking('${b.id||b._id}')" title="Confirm"><i class="fas fa-check"></i></button>`:''}
      <button class="action-btn delete" onclick="delBooking('${b.id||b._id}')" title="Delete"><i class="fas fa-trash"></i></button>
    </div></td></tr>`).join('') :
    '<tr><td colspan="8" style="text-align:center;padding:28px;color:var(--text-light);">No bookings found.</td></tr>';
}
function filterBookings(f,el){
  document.querySelectorAll('.admin-tab').forEach(t=>t.classList.remove('active'));
  if(el)el.classList.add('active'); renderBookings(f);
}
async function confirmBooking(id){await updateBookingStatus(id,'confirmed'); await renderBookings('all'); await loadStats(); showToast('Booking confirmed!','success');}
async function delBooking(id){if(!confirm('Delete this booking?'))return; await deleteBooking(id); await renderBookings('all'); await loadStats(); showToast('Booking deleted.');}

// ===== USERS =====
async function renderUsers(){
  const tbody=document.getElementById('usersTable'); if(!tbody) return;
  const users=await getUsers();
  tbody.innerHTML=users.length ? users.map(u=>`
    <tr><td>${u.name}</td><td>${u.phone}</td>
    <td>${new Date(u.createdAt).toLocaleDateString('en-IN')}</td></tr>`).join('') :
    '<tr><td colspan="3" style="text-align:center;padding:28px;color:var(--text-light);">No registered visitors yet.</td></tr>';
}

function requireAdmin(){const u=getCurrentUser();if(!u||u.role!=='admin'){window.location.href='login.html';return false;}return true;}
</script>
</body>
</html>"""

# Find the opening <script> tag after catalog.js and replace everything from there to end
pattern = r'<script>\s*\ndocument\.addEventListener\(\'DOMContentLoaded\',.*?</html>'
result = re.sub(pattern, new_script, content, flags=re.DOTALL)

if result == content:
    # Try alternate approach: find line number of inline script start
    lines = content.split('\n')
    start_idx = None
    for i, line in enumerate(lines):
        if '<script>' in line and i > 310:  # after the external scripts
            start_idx = i
            break
    if start_idx is not None:
        # Keep everything up to (not including) the inline script
        new_content = '\n'.join(lines[:start_idx]) + '\n' + new_script
        with open(r'admin.html', 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Patched admin.html via line-split at line {start_idx+1}")
    else:
        print("ERROR: Could not find inline script start")
else:
    with open(r'admin.html', 'w', encoding='utf-8') as f:
        f.write(result)
    print("Patched admin.html via regex")
