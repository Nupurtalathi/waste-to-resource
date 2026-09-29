const KEY_USERS='wtr_users_v2',KEY_SESSION='wtr_session_v2',KEY_LISTINGS='wtr_listings_v2';
let authMode='login',marketFilter='all',compareIds=[];

const $=id=>document.getElementById(id);
const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const getUsers=()=>JSON.parse(localStorage.getItem(KEY_USERS)||'[]');
const getListings=()=>JSON.parse(localStorage.getItem(KEY_LISTINGS)||'[]').map(x=>({
  ...x,status:x.status||'Available',grade:x.grade||'',purity:x.purity??null,buyer:x.buyer||'',buyerOffer:x.buyerOffer??null,
  sellerVerified:x.sellerVerified||'Unverified seller',buyerVerified:x.buyerVerified||'Unverified buyer',
  collectionDate:x.collectionDate||'',recovered:x.recovered??null,landfill:x.landfill??null,
  elements:x.elements||{Copper:0,Aluminium:0,Gold:0,Silver:0,Other:0}
}));
const session=()=>JSON.parse(localStorage.getItem(KEY_SESSION)||'null');
const saveListings=x=>localStorage.setItem(KEY_LISTINGS,JSON.stringify(x));
const saveUsers=x=>localStorage.setItem(KEY_USERS,JSON.stringify(x));

/* =========================================================
   INITIAL MARKETPLACE DATA
   ---------------------------------------------------------
   The first time the app is opened with an empty marketplace,
   create 10 realistic demo listings. These are normal listing
   records stored in localStorage, so every new listing added by
   a user is simply appended and all dashboard numbers/charts
   update from the combined dataset.
   ========================================================= */
function ensureDemoListings(){
  const existing=getListings();
  if(existing.length>0 || localStorage.getItem('wtr_demo_seed_v1')==='1') return;

  const demoUser={
    id:'demo-marketplace-user',
    name:'Verified Marketplace Partner',
    email:'demo@wasteresource.local'
  };

  const demo=[
    {
      title:'Mixed E-Waste Batch — Grade A', type:'waste', material:'E-waste',
      quantity:8.5, location:'Pune, Maharashtra', application:'Refurbishment and component recovery',
      price:620, buyerOffer:590, buyer:'EcoTech Recyclers', grade:'A', purity:92,
      status:'Available', recovered:7.6, landfill:0.9,
      elements:{Copper:18,Aluminium:12,Gold:0.08,Silver:0.35,Other:69.57},
      description:'Sorted electronic waste suitable for responsible recycling and material recovery.',
      createdAt:'2026-09-03T10:00:00+05:30'
    },
    {
      title:'PET Plastic Flakes — Clear', type:'waste', material:'Plastic',
      quantity:12, location:'Mumbai, Maharashtra', application:'Packaging and recycled PET production',
      price:72, buyerOffer:68, buyer:'RePoly Industries', grade:'A', purity:96,
      status:'Available', recovered:11.2, landfill:0.8,
      elements:{Copper:0,Aluminium:0,Gold:0,Silver:0,Other:100},
      description:'Washed and sorted clear PET flakes with low contamination.',
      createdAt:'2026-08-14T11:30:00+05:30'
    },
    {
      title:'Copper Scrap — Industrial Cable', type:'waste', material:'Copper',
      quantity:5.2, location:'Nashik, Maharashtra', application:'Copper recovery and cable manufacturing',
      price:710, buyerOffer:695, buyer:'MetalLoop Industries', grade:'A', purity:94,
      status:'Negotiating', recovered:5.0, landfill:0.2,
      elements:{Copper:94,Aluminium:2,Gold:0,Silver:0.2,Other:3.8},
      description:'Stripped industrial cable copper scrap ready for recovery.',
      createdAt:'2026-07-22T09:15:00+05:30'
    },
    {
      title:'Aluminium Scrap — Sheet & Profiles', type:'waste', material:'Aluminium',
      quantity:18, location:'Ahmedabad, Gujarat', application:'Secondary aluminium production',
      price:185, buyerOffer:178, buyer:'AluCycle Manufacturing', grade:'B', purity:91,
      status:'Available', recovered:16.8, landfill:1.2,
      elements:{Copper:1.5,Aluminium:91,Gold:0,Silver:0,Other:7.5},
      description:'Mixed aluminium sheets and profiles separated from industrial waste.',
      createdAt:'2026-06-10T14:20:00+05:30'
    },
    {
      title:'Steel Fabrication Scrap', type:'waste', material:'Steel',
      quantity:25, location:'Bengaluru, Karnataka', application:'Steel remelting and fabrication',
      price:48, buyerOffer:45, buyer:'GreenSteel Works', grade:'B', purity:88,
      status:'Available', recovered:23.4, landfill:1.6,
      elements:{Copper:1,Aluminium:1,Gold:0,Silver:0,Other:98},
      description:'Clean fabrication offcuts and mild-steel scrap.',
      createdAt:'2026-05-18T12:00:00+05:30'
    },
    {
      title:'Cardboard Bales — OCC', type:'waste', material:'Cardboard',
      quantity:9, location:'Delhi, NCR', application:'Paper and packaging production',
      price:24, buyerOffer:22, buyer:'Circular Paper Mills', grade:'A', purity:89,
      status:'Sold', recovered:8.2, landfill:0.8,
      elements:{Copper:0,Aluminium:0,Gold:0,Silver:0,Other:100},
      description:'Compacted old corrugated cardboard bales with low moisture.',
      createdAt:'2026-04-07T15:45:00+05:30'
    },
    {
      title:'Lithium Battery Scrap Requirement', type:'buyer', material:'Batteries',
      quantity:6, location:'Hyderabad, Telangana', application:'Battery material recovery',
      price:410, buyerOffer:430, buyer:'VoltCycle Energy', grade:'A', purity:85,
      status:'Available', recovered:null, landfill:null,
      elements:{Copper:8,Aluminium:10,Gold:0,Silver:0.2,Other:81.8},
      description:'Buyer requirement for sorted end-of-life lithium battery material.',
      createdAt:'2026-03-11T10:10:00+05:30'
    },
    {
      title:'Glass Bottle Scrap Requirement', type:'buyer', material:'Glass',
      quantity:14, location:'Chennai, Tamil Nadu', application:'Container glass manufacturing',
      price:18, buyerOffer:20, buyer:'ClearGlass Industries', grade:'B', purity:94,
      status:'Negotiating', recovered:null, landfill:null,
      elements:{Copper:0,Aluminium:0,Gold:0,Silver:0,Other:100},
      description:'Requirement for sorted and colour-separated post-consumer glass.',
      createdAt:'2026-02-16T13:25:00+05:30'
    },
    {
      title:'Textile Waste — Cotton Cutting Scrap', type:'waste', material:'Textile',
      quantity:7.5, location:'Surat, Gujarat', application:'Fiber recovery and recycled yarn',
      price:36, buyerOffer:33, buyer:'ReFiber Textiles', grade:'A', purity:90,
      status:'Available', recovered:6.9, landfill:0.6,
      elements:{Copper:0,Aluminium:0,Gold:0,Silver:0,Other:100},
      description:'Clean cotton cutting waste collected from garment production.',
      createdAt:'2026-01-21T11:40:00+05:30'
    },
    {
      title:'Lead-Free PCB Scrap Requirement', type:'buyer', material:'PCB',
      quantity:4, location:'Noida, Uttar Pradesh', application:'Precious and base metal recovery',
      price:540, buyerOffer:575, buyer:'Urban Metal Recovery', grade:'A', purity:87,
      status:'Available', recovered:null, landfill:null,
      elements:{Copper:24,Aluminium:5,Gold:0.12,Silver:0.8,Other:70.08},
      description:'Buyer seeking sorted printed circuit boards for certified recovery.',
      createdAt:'2025-12-12T16:05:00+05:30'
    }
  ].map((x,i)=>({
    id:'demo-listing-'+(i+1),
    ...x,
    sellerVerified:'Verified seller',
    buyerVerified:x.buyer?'Verified buyer':'Unverified buyer',
    collectionDate:'',
    capacity:x.type==='buyer'?x.quantity:null,
    postedBy:demoUser
  }));

  saveListings(demo);
  localStorage.setItem('wtr_demo_seed_v1','1');
}

function dateText(d){return new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}
function scrollToId(id){document.getElementById(id)?.scrollIntoView({behavior:'smooth'})}

document.querySelectorAll('#marketTabs button').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('#marketTabs button').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');marketFilter=b.dataset.filter;renderMarketplace();
});

function openAuth(mode='login'){authMode=mode;updateAuthUI();$('authOverlay').classList.remove('hidden')}
function closeAuth(){$('authOverlay').classList.add('hidden');$('authError').classList.add('hidden')}
function switchAuth(mode){authMode=mode;updateAuthUI()}
function updateAuthUI(){
  $('authTitle').textContent=authMode==='login'?'Welcome back':'Create your account';
  $('authSub').textContent=authMode==='login'?'Sign in to manage your listings.':'Create a profile before posting marketplace data.';
  $('authSubmit').textContent=authMode==='login'?'Login →':'Create account →';
  $('signupNameField').classList.toggle('hidden',authMode!=='signup');
  $('authName').required=authMode==='signup';
  $('authError').classList.add('hidden');
}
function submitAuth(e){
  e.preventDefault();
  const email=$('authEmail').value.trim().toLowerCase(),pw=$('authPassword').value;
  let users=getUsers();
  if(authMode==='signup'){
    const name=$('authName').value.trim();
    if(users.some(u=>u.email===email)){showAuthError('An account with this email already exists.');return}
    const user={id:uid(),name,email,password:pw,createdAt:new Date().toISOString()};
    users.push(user);saveUsers(users);localStorage.setItem(KEY_SESSION,JSON.stringify({id:user.id}));
    closeAuth();openDashboard();return;
  }
  const user=users.find(u=>u.email===email&&u.password===pw);
  if(!user){showAuthError('Email or password is incorrect.');return}
  localStorage.setItem(KEY_SESSION,JSON.stringify({id:user.id}));closeAuth();openDashboard();
}
function showAuthError(t){$('authError').textContent=t;$('authError').classList.remove('hidden')}

function currentUser(){const s=session();return s?getUsers().find(u=>u.id===s.id):null}
function openDashboard(){
  const u=currentUser();if(!u){openAuth('login');return}
  $('publicApp').style.display='none';$('dashboard').style.display='block';
  $('sideName').textContent=u.name;$('sideEmail').textContent=u.email;
  $('profileName').textContent=u.name;$('profileEmail').textContent=u.email;
  $('dashTitle').textContent='Welcome back, '+u.name.split(/\s+/)[0];
  $('avatar').textContent=u.name.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase();
  refreshDashboard();showPanel('overview');
}
function logout(){localStorage.removeItem(KEY_SESSION);$('dashboard').style.display='none';$('publicApp').style.display='block';renderMarketplace();window.scrollTo(0,0)}
function showPublic(){logout();scrollToId('market')}
function showPanel(panel){
  document.querySelectorAll('.sideNav button').forEach(b=>b.classList.toggle('active',b.dataset.panel===panel));
  document.querySelectorAll('.dashPanel').forEach(p=>p.classList.remove('active'));
  $('panel-'+panel).classList.add('active');
  $('dashTitle').textContent={overview:'Overview',waste:'My waste',buyers:'My buyer needs',post:'Create listing',profile:'Profile'}[panel];
  if(panel==='post'&&!$('editingId').value){resetListingForm()}
  refreshDashboard();
}
document.querySelectorAll('.sideNav button').forEach(b=>b.onclick=()=>showPanel(b.dataset.panel));

function openPost(type){showPanel('post');$('fType').value=type;toggleTypeFields()}
function toggleTypeFields(){
  const buyer=$('fType').value==='buyer';
  $('fTitle').placeholder=buyer?'e.g. Cement manufacturer seeking fly ash':'e.g. Fly ash available';
  $('fApplication').placeholder=buyer?'e.g. Cement / concrete production':'e.g. Cement, road fill, blocks';
}
function createListing(e){
  e.preventDefault();
  const u=currentUser();if(!u){openAuth('login');return}
  const editingId=$('editingId').value.trim(), type=$('fType').value;
  const item={
    id:editingId||uid(),type,title:$('fTitle').value.trim(),material:$('fMaterial').value.trim(),
    quantity:Number($('fQty').value)||null,location:$('fLocation').value.trim(),application:$('fApplication').value.trim(),
    price:Number($('fPrice').value)||null,buyerOffer:Number($('fBuyerOffer').value)||null,buyer:$('fBuyer').value.trim(),
    grade:$('fGrade').value,purity:Number($('fPurity').value)||null,collectionDate:$('fCollectionDate').value,status:$('fStatus').value,
    sellerVerified:$('fSellerVerified').value,buyerVerified:$('fBuyerVerified').value,recovered:Number($('fRecovered').value)||null,
    landfill:Number($('fLandfill').value)||null,capacity:Number($('fCapacity').value)||null,
    elements:{Copper:Number($('fCopper').value)||0,Aluminium:Number($('fAluminium').value)||0,Gold:Number($('fGold').value)||0,Silver:Number($('fSilver').value)||0,Other:Number($('fOther').value)||0},
    description:$('fDescription').value.trim(),postedBy:{id:u.id,name:u.name,email:u.email},createdAt:editingId?(getListings().find(x=>x.id===editingId)?.createdAt||new Date().toISOString()):new Date().toISOString(),updatedAt:new Date().toISOString()
  };
  let list=getListings();
  if(editingId){
    const index=list.findIndex(x=>x.id===editingId&&x.postedBy?.id===u.id);
    if(index<0){alert('You can only update your own listing.');return}
    list[index]=item;
  }else list.push(item);
  saveListings(list);resetListingForm();renderMarketplace();refreshDashboard();showPanel('overview');alert(editingId?'Listing updated successfully.':'Listing published successfully.');
}
function resetListingForm(){
  $('listingForm').reset();$('editingId').value='';$('listingSubmit').textContent='Publish listing →';toggleTypeFields();
}
function editListing(id){
  const u=currentUser(),x=getListings().find(v=>v.id===id);if(!u||!x||x.postedBy?.id!==u.id)return;
  showPanel('post');$('editingId').value=x.id;$('fType').value=x.type;$('fTitle').value=x.title||'';$('fMaterial').value=x.material||'';$('fQty').value=x.quantity??'';$('fLocation').value=x.location||'';$('fApplication').value=x.application||'';$('fPrice').value=x.price??'';$('fBuyerOffer').value=x.buyerOffer??'';$('fBuyer').value=x.buyer||'';$('fPurity').value=x.purity??'';$('fGrade').value=x.grade||'';$('fStatus').value=x.status||'Available';$('fCollectionDate').value=x.collectionDate||'';$('fSellerVerified').value=x.sellerVerified||'Unverified seller';$('fBuyerVerified').value=x.buyerVerified||'Unverified buyer';$('fRecovered').value=x.recovered??'';$('fLandfill').value=x.landfill??'';$('fCapacity').value=x.capacity??'';$('fCopper').value=x.elements?.Copper??'';$('fAluminium').value=x.elements?.Aluminium??'';$('fGold').value=x.elements?.Gold??'';$('fSilver').value=x.elements?.Silver??'';$('fOther').value=x.elements?.Other??'';$('fDescription').value=x.description||'';$('listingSubmit').textContent='Update listing ✓';toggleTypeFields();window.scrollTo({top:0,behavior:'smooth'});
}

function populateFilters(){
  const all=getListings();
  const fill=(id,values,placeholder)=>{
    const el=$(id);if(!el)return;
    const current=el.value;
    el.innerHTML=`<option value="">${placeholder}</option>`+values.sort((a,b)=>String(a).localeCompare(String(b))).map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
    el.value=values.includes(current)?current:'';
  };
  fill('filterMaterial',[...new Set(all.map(x=>x.material).filter(Boolean))],'All materials');
  fill('filterLocation',[...new Set(all.map(x=>x.location).filter(Boolean))],'All locations');
}
function renderMarketplace(){
  populateFilters();
  const q=$('search').value.trim().toLowerCase();
  let data=getListings().filter(x=>marketFilter==='all'||x.type===marketFilter);
  const material=$('filterMaterial')?.value||'',location=$('filterLocation')?.value||'';
  const qty=$('filterQty')?.value||'',price=$('filterPrice')?.value||'',purity=$('filterPurity')?.value||'';
  const element=$('filterElement')?.value||'',buyer=($('filterBuyer')?.value||'').toLowerCase();
  const seller=($('filterSeller')?.value||'').toLowerCase(),grade=$('filterGrade')?.value||'',status=$('filterStatus')?.value||'';
  if(q)data=data.filter(x=>[x.title,x.material,x.location,x.application,x.postedBy?.name,x.description,x.buyer].join(' ').toLowerCase().includes(q));
  if(material)data=data.filter(x=>x.material===material);
  if(location)data=data.filter(x=>x.location===location);
  if(qty)data=data.filter(x=>qty==='small'?(x.quantity||0)<=2:qty==='medium'?(x.quantity||0)>2&&(x.quantity||0)<=10:(x.quantity||0)>10);
  if(price)data=data.filter(x=>price==='low'?(x.price||0)<400:price==='mid'?(x.price||0)>=400&&(x.price||0)<=500:(x.price||0)>500);
  if(purity)data=data.filter(x=>(x.purity||0)>=Number(purity));
  if(element)data=data.filter(x=>(x.elements?.[element[0].toUpperCase()+element.slice(1)]||0)>0);
  if(buyer)data=data.filter(x=>(x.buyer||'').toLowerCase().includes(buyer));
  if(seller)data=data.filter(x=>(x.postedBy?.name||'').toLowerCase().includes(seller));
  if(grade)data=data.filter(x=>x.grade===grade);
  if(status)data=data.filter(x=>x.status===status);
  const sort=$('sort').value;
  data.sort((a,b)=>{
    if(sort==='purity')return (b.purity||0)-(a.purity||0);
    if(sort==='price')return (a.price||Infinity)-(b.price||Infinity);
    if(sort==='quantity')return (b.quantity||0)-(a.quantity||0);
    if(sort==='value')return ((b.quantity||0)*(b.price||0)*1000)-((a.quantity||0)*(a.price||0)*1000);
    if(sort==='offer')return (b.buyerOffer||0)-(a.buyerOffer||0);
    return new Date(b.createdAt)-new Date(a.createdAt);
  });
  $('listingGrid').innerHTML=data.length?data.map(cardHTML).join(''):emptyHTML();
  const all=getListings();
  $('heroCount').textContent=all.length;$('heroWaste').textContent=all.filter(x=>x.type==='waste').length;$('heroBuyers').textContent=all.filter(x=>x.type==='buyer').length;
  updateCompareTray();
}
function emptyHTML(){
 return `<div class="empty"><div class="icon">◌</div><b>No listings yet</b><p>There is no user-posted data matching this view.<br>Login to publish the first listing.</p><button class="btn small" onclick="openAuth('signup')">Create listing →</button></div>`;
}
function cardHTML(x){
  const isW=x.type==='waste', el=x.elements||{}, diff=x.price!=null&&x.buyerOffer!=null?x.buyerOffer-x.price:null;
  const value=(x.quantity||0)*(x.price||0)*1000;
  return `<article class="card listCard">
    <div style="display:flex;justify-content:space-between;gap:8px;align-items:center">
      <span class="tag ${isW?'waste':'buyer'}">${isW?'Waste available':'Buyer requirement'}</span>
      <label style="font-size:11px;color:var(--muted)"><input class="compareCheck" type="checkbox" ${compareIds.includes(x.id)?'checked':''} onchange="toggleCompare('${x.id}',this.checked)"> Compare</label>
    </div>
    <div class="listTitle">${esc(x.title)}</div>
    <div class="meta">
      <div>Waste material <b>${esc(x.material)}</b></div>
      <div>Posted by <b>${esc(x.postedBy?.name||'Unknown')}</b></div>
      <div>Buyer <b>${esc(x.buyer||'Not specified')}</b></div>
      <div>Location <b>${esc(x.location)}</b></div>
    </div>
    <div class="listStats">
      <div class="listStat"><small>Available quantity</small><b>${x.quantity??'—'} tons</b></div>
      <div class="listStat"><small>Expected price</small><b>${x.price!=null?'₹'+x.price+'/kg':'—'}</b></div>
      <div class="listStat"><small>Buyer offered price</small><b>${x.buyerOffer!=null?'₹'+x.buyerOffer+'/kg':'—'}</b></div>
      <div class="listStat"><small>Price difference</small><b>${diff==null?'—':(diff>=0?'+':'')+'₹'+diff+'/kg'}</b></div>
    </div>
    <div class="badgeRow">
      ${x.grade?`<span class="badge verified">Grade ${esc(x.grade)}</span>`:''}
      ${x.purity!=null?`<span class="badge verified">Purity ${x.purity}%</span>`:''}
      <span class="badge ${x.status==='Sold'?'sold':'status'}">${esc(x.status||'Available')}</span>
      <span class="badge verified">${esc(x.sellerVerified||'Unverified seller')}</span>
    </div>
    ${el.Copper||el.Aluminium||el.Gold||el.Silver?`<div class="elementMini">
      ${[['Copper',el.Copper],['Aluminium',el.Aluminium],['Gold',el.Gold]].filter(a=>a[1]>0).slice(0,3).map(a=>`<div class="elementMiniHead"><span>${a[0]}</span><b>${a[1]}%</b></div><div class="miniTrack"><div class="miniFill" style="width:${Math.min(100,a[1])}%"></div></div>`).join('')}
    </div>`:''}
    <div style="margin-top:10px;font-size:11px;color:var(--muted)">Environmental value: ${x.recovered??0} t recovered · ${x.landfill??0} t landfill avoided</div>
    <div class="cardBottom"><span style="font-size:12px;color:var(--muted)">${dateText(x.createdAt)}</span><div style="display:flex;gap:6px"><button class="btn secondary small" onclick="showDetail('${x.id}')">View details</button><button class="btn small" onclick="makeOffer('${x.id}')">Make offer</button></div></div>
  </article>`;
}
function showDetail(id){
  const x=getListings().find(v=>v.id===id);if(!x)return;
  const isW=x.type==='waste',el=x.elements||{},diff=x.price!=null&&x.buyerOffer!=null?x.buyerOffer-x.price:null;
  const value=(x.quantity||0)*(x.price||0)*1000;
  const avgPurity=getListings().filter(v=>v.purity!=null).reduce((a,v)=>a+v.purity,0)/(getListings().filter(v=>v.purity!=null).length||1);
  $('detailContent').innerHTML=`
    <div class="detailHero">
      <div><span class="tag ${isW?'waste':'buyer'}">${isW?'Waste available':'Buyer requirement'}</span><h2 style="margin:12px 0 5px">${esc(x.title)}</h2><p style="color:var(--muted)">Posted ${dateText(x.createdAt)} · ${esc(x.status||'Available')}</p>
      <div class="badgeRow"><span class="badge verified">${esc(x.sellerVerified||'Unverified seller')}</span><span class="badge verified">${esc(x.buyerVerified||'Unverified buyer')}</span>${x.grade?`<span class="badge status">Grade ${esc(x.grade)}</span>`:''}</div></div>
      <div class="detailKpis">
        <div class="detailKpi"><small>Quantity</small><b>${x.quantity??'—'} tons</b></div><div class="detailKpi"><small>Purity</small><b>${x.purity??'—'}%</b></div>
        <div class="detailKpi"><small>Seller price</small><b>₹${x.price??'—'}/kg</b></div><div class="detailKpi"><small>Buyer offer</small><b>₹${x.buyerOffer??'—'}/kg</b></div>
      </div>
    </div>
    <div class="detailSection"><div class="detailGrid">
      <div class="card"><small>Waste material</small><br><b>${esc(x.material)}</b></div><div class="card"><small>Seller</small><br><b>${esc(x.postedBy?.name)}</b></div>
      <div class="card"><small>Buyer</small><br><b>${esc(x.buyer||'Not specified')}</b></div><div class="card"><small>Location</small><br><b>${esc(x.location)}</b></div>
      <div class="card"><small>Estimated value</small><br><b>₹${value.toLocaleString('en-IN')}</b></div><div class="card"><small>Price difference</small><br><b>${diff==null?'—':(diff>=0?'+':'')+'₹'+diff+'/kg'}</b></div>
      <div class="card"><small>Collection date</small><br><b>${x.collectionDate||'Not specified'}</b></div><div class="card"><small>Environmental value</small><br><b>${x.recovered??0} t recovered · ${x.landfill??0} t avoided</b></div>
    </div></div>
    <div class="detailSection"><h3>Element Composition</h3><div class="chartBox"><div class="compositionList">
      ${[['Copper',el.Copper],['Aluminium',el.Aluminium],['Gold',el.Gold],['Silver',el.Silver],['Other',el.Other]].map(([n,v])=>`<div class="compRow"><b>${n}</b><div class="compTrack"><div class="compFill" style="width:${Math.min(100,v||0)}%"></div></div><span>${v||0}%</span></div>`).join('')}
    </div></div></div>
    <div class="detailSection compareGrid">
      <div class="chartBox"><h3>Price History</h3><div id="detailPriceChart"></div></div>
      <div class="chartBox"><h3>Buyer Comparison</h3><div id="detailBuyerChart"></div></div>
      <div class="chartBox"><h3>Material Composition</h3><p style="margin:0;color:var(--muted);font-size:11px">Element concentration breakdown</p><div id="detailPieChart"></div></div>
      <div class="chartBox"><h3>Quantity vs Price</h3><div id="detailScatterChart"></div></div>
    </div>
    <div class="insight"><b>💡 Smart Insight</b><div>${x.purity!=null?`This listing has <b>${x.purity}% purity</b>, ${Math.max(0,x.purity-avgPurity).toFixed(1)} percentage points above the current marketplace average. `:''}${diff!=null?`The current buyer offer is <b>₹${Math.abs(diff)}/kg ${diff<0?'below':'above'}</b> the seller expectation.`:'Add a buyer offer to calculate the negotiation gap.'}</div></div>
    <div class="formActions"><button class="btn secondary" onclick="closeDetail()">Close</button><button class="btn" onclick="makeOffer('${x.id}')">Contact / Make Offer →</button></div>`;
  $('detailOverlay').classList.remove('hidden');
  drawDetailCharts(x);
}
function closeDetail(){$('detailOverlay').classList.add('hidden')}



function svgLineChart(points,labels,unit=''){
  if(!points.length)return '<div class="chartEmpty"><div><div class="chartEmptyIcon">⌁</div><b>Trend starts after your first priced listing</b><span>Add listings over time to build the historical series.</span></div></div>';
  const W=760,H=250,p=42,max=Math.max(...points,1),min=Math.min(...points,0),range=max-min||1;
  const step=(W-2*p)/Math.max(1,points.length-1);
  const coords=points.map((v,i)=>{
    const x=p+i*step;
    const y=H-p-((v-min)/range)*(H-2*p);
    return [x,y];
  });
  const pts=coords.map(([x,y])=>`${x},${y}`).join(' ');
  const area=`${p},${H-p} ${pts} ${W-p},${H-p}`;
  return `<svg class="svgChart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <defs>
      <linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#596ff0" stop-opacity=".20"/>
        <stop offset="100%" stop-color="#596ff0" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <line x1="${p}" y1="${H-p}" x2="${W-p}" y2="${H-p}" stroke="#e4e9f1"/>
    <polygon points="${area}" fill="url(#trendFill)"/>
    <polyline points="${pts}" fill="none" stroke="#596ff0" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    ${coords.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="5" fill="#fff" stroke="#596ff0" stroke-width="3"/>
      <text x="${x}" y="${Math.max(16,y-12)}" text-anchor="middle" font-size="10" font-weight="700" fill="#52617a">${unit}${Number(points[i]).toFixed(0)}</text>`).join('')}
  </svg><div class="chartLabels">${labels.map(esc).map(x=>`<span>${x}</span>`).join('')}</div>`;
}
function horizontalBars(data,unit='',maxOverride=null){
  // Kept as a compatibility wrapper: all dashboard calls now render vertical columns.
  return verticalBars(data,unit,maxOverride,'blue');
}
function chartEmptyHtml(title='No data yet',message='Real listing records will appear here.'){
  return `<div class="emptyVisual"><div class="chartEmpty"><div><div class="chartEmptyIcon">▥</div><b>${esc(title)}</b><span>${esc(message)}</span></div></div></div>`;
}
function verticalBars(data,unit='',maxOverride=null,tone='blue'){
  if(!data.length)return chartEmptyHtml();
  const sorted=data.slice(0,8), max=maxOverride||Math.max(...sorted.map(x=>Number(x[1])||0),1);
  const toneClass=tone==='green'?'green':tone==='purple'?'purple':tone==='orange'?'orange':'';
  return `<div class="visualChart">${sorted.map(([n,v])=>{
    const num=Number(v)||0, pct=Math.max(num>0?4:0,Math.min(100,(num/max)*100));
    const display=num.toFixed(num%1?1:0);
    return `<div class="vBarItem"><div class="vBarValue">${esc(unit)}${display}</div><div class="vBarTrack"><div class="vBarFill ${toneClass}" style="height:${pct}%"></div></div><div class="vBarLabel" title="${esc(n)}">${esc(n)}</div></div>`;
  }).join('')}</div>`;
}
function pieChart(data,totalLabel='Total',centerTotal=null){
  if(!data.length)return chartEmptyHtml();
  const rows=data.filter(([,v])=>Number(v)>0).slice(0,6);
  if(!rows.length)return chartEmptyHtml();
  const total=rows.reduce((s,[,v])=>s+Number(v),0);
  const cx=100,cy=100,r=72,circ=2*Math.PI*r;
  const colors=['#536dfe','#16c7b2','#9b6cff','#ff9b5b','#4d9de0','#ef6f6c'];
  let offset=0;
  const arcs=rows.map(([name,value],i)=>{
    const len=circ*(Number(value)/total),dash=`${len} ${circ-len}`,arc=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${colors[i%colors.length]}" stroke-width="25" stroke-linecap="butt" stroke-dasharray="${dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})"></circle>`;
    offset+=len;return arc;
  }).join('');
  const shownTotal=centerTotal??total;
  return `<div class="pieArea"><svg class="pieSvg" viewBox="0 0 200 200" aria-label="Pie chart"><circle cx="100" cy="100" r="72" fill="none" stroke="#edf0f5" stroke-width="25"></circle>${arcs}<circle cx="100" cy="100" r="51" fill="#fff"></circle><text x="100" y="96" text-anchor="middle" class="pieCenterValue">${Number(shownTotal).toLocaleString('en-IN')}</text><text x="100" y="112" text-anchor="middle" class="pieCenterLabel">${esc(totalLabel)}</text></svg><div class="pieLegend">${rows.map(([name,value],i)=>`<div class="pieLegendItem"><i style="background:${colors[i%colors.length]}"></i><span>${esc(name)}</span><b>${Number(value).toFixed(Number(value)%1?1:0)}</b></div>`).join('')}</div></div>`;
}
function stackedVerticalBars(data){
  if(!data.length)return chartEmptyHtml('No demand/supply data yet','Add waste and buyer listings after login.');
  const rows=data.slice(0,7),max=Math.max(...rows.map(([,v])=>Math.max(v.s,v.d)),1);
  return `<div class="stackChart">${rows.map(([name,v])=>{const s=Number(v.s)||0,d=Number(v.d)||0;return `<div class="stackItem"><div class="stackValue">${s.toFixed(1)}t / ${d.toFixed(1)}t</div><div class="stackTrack"><div class="stackSupply" style="height:${Math.max(s?3:0,(s/max)*100)}%"></div><div class="stackDemand" style="height:${Math.max(d?3:0,(d/max)*100)}%"></div></div><div class="stackLabel" title="${esc(name)}">${esc(name)}</div></div>`}).join('')}</div><div class="chartLegendRow"><span><i class="chartLegendDot"></i>Supply</span><span><i class="chartLegendDot orange"></i>Demand</span></div>`;
}
function monthKey(date){
  const d=new Date(date);
  if(Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}
function monthLabel(key){
  const [y,m]=key.split('-').map(Number);
  return new Date(y,m-1,1).toLocaleDateString('en-IN',{month:'short',year:'numeric'});
}
function renderDashboardAnalytics(){
  const all=getListings(),
        waste=all.filter(x=>x.type==='waste'),
        buyers=all.filter(x=>x.type==='buyer');

  $('statAll').textContent=all.length;
  $('statWaste').textContent=waste.length;
  $('statBuyer').textContent=buyers.length;
  $('statTransactions').textContent=all.filter(x=>x.status==='Sold').length;

  const totalTons=waste.reduce((s,x)=>s+(Number(x.quantity)||0),0);
  const priced=waste.filter(x=>Number(x.price)>0);
  const avgPrice=priced.length?priced.reduce((s,x)=>s+Number(x.price),0)/priced.length:0;
  const recovered=all.reduce((s,x)=>s+(Number(x.recovered)||0),0);
  $('dashTotalTons').textContent=`${totalTons.toFixed(totalTons%1?1:0)} t`;
  $('dashAvgPrice').textContent=avgPrice?`₹${avgPrice.toFixed(0)}/kg`:'₹0/kg';
  $('dashRecovered').textContent=`${recovered.toFixed(recovered%1?1:0)} t`;
  const latest=all.slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))[0];
  $('dashUpdated').textContent=latest?dateText(latest.createdAt):'—';

  /* Historical price trend:
     Uses actual listing creation dates and keeps year + month, so Sep 2025
     and Sep 2026 are separate periods. No synthetic/fake values are added. */
  const byMonth={};
  priced.forEach(x=>{
    const k=monthKey(x.createdAt);
    if(!k)return;
    if(!byMonth[k])byMonth[k]=[];
    byMonth[k].push(Number(x.price));
  });
  const monthKeys=Object.keys(byMonth).sort().slice(-8);
  const monthVals=monthKeys.map(k=>{
    const values=byMonth[k];
    return values.reduce((a,b)=>a+b,0)/values.length;
  });
  $('dashPriceTrend').innerHTML=svgLineChart(
    monthVals,
    monthKeys.map(monthLabel),
    '₹'
  ) + (monthKeys.length ? `<div class="trendNote"><span style="display:flex;align-items:center;gap:8px"><i class="trendDot"></i>Based only on posted waste listings</span><b>${monthKeys.length} month${monthKeys.length===1?'':'s'} tracked</b></div>` : '');

  const cats={};
  waste.forEach(x=>{const k=x.material||'Unspecified';cats[k]=(cats[k]||0)+1});
  $('dashCategory').innerHTML=pieChart(
    Object.entries(cats).sort((a,b)=>b[1]-a[1]),
    'Listings',
    waste.length
  );

  const elTotals={Copper:0,Aluminium:0,Gold:0,Silver:0,Other:0},elCounts={};
  waste.forEach(x=>Object.keys(elTotals).forEach(k=>{
    if(Number(x.elements?.[k])>0){
      elTotals[k]+=Number(x.elements[k]);
      elCounts[k]=(elCounts[k]||0)+1;
    }
  }));
  const elData=Object.entries(elTotals)
    .map(([k,v])=>[k,elCounts[k]?v/elCounts[k]:0])
    .filter(x=>x[1]>0);
  $('dashComposition').innerHTML=pieChart(elData,'Avg. %',null);

  const bv={};
  all.forEach(x=>{
    if(x.buyer){
      bv[x.buyer]=(bv[x.buyer]||0)+(Number(x.quantity)||0);
    }
  });
  $('dashBuyers').innerHTML=verticalBars(
    Object.entries(bv).sort((a,b)=>b[1]-a[1]),
    't',
    null,
    'orange'
  );

  const demand={};
  buyers.forEach(x=>{
    const k=x.material||'Unspecified';
    if(!demand[k])demand[k]={s:0,d:0};
    demand[k].d += Number(x.quantity)||Number(x.capacity)||0;
  });
  waste.forEach(x=>{
    const k=x.material||'Unspecified';
    if(!demand[k])demand[k]={s:0,d:0};
    demand[k].s += Number(x.quantity)||0;
  });
  $('dashDemand').innerHTML=Object.entries(demand).length
    ? stackedVerticalBars(Object.entries(demand).sort((a,b)=>(b[1].s+b[1].d)-(a[1].s+a[1].d)))
    : chartEmptyHtml('No demand/supply data yet','Add waste and buyer listings after login.');

  const mp={};
  waste.forEach(x=>{
    if(Number(x.price)>0){
      const k=x.material||'Unspecified';
      if(!mp[k])mp[k]=[];
      mp[k].push(Number(x.price));
    }
  });
  $('dashMaterialPrice').innerHTML=verticalBars(
    Object.entries(mp)
      .map(([k,v])=>[k,v.reduce((a,b)=>a+b,0)/v.length])
      .sort((a,b)=>b[1]-a[1]),
    '₹',
    null,
    'purple'
  );

  const loc={};
  waste.forEach(x=>{
    const k=x.location||'Unspecified';
    loc[k]=(loc[k]||0)+(Number(x.quantity)||0);
  });
  $('dashLocations').innerHTML=verticalBars(
    Object.entries(loc).sort((a,b)=>b[1]-a[1]),
    't',
    null,
    'green'
  );

  const recent=all.slice()
    .sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))
    .slice(0,6);
  $('dashRecent').innerHTML=recent.length
    ? recent.map(x=>rowHTML(x)).join('')
    : '<div class="chartEmpty"><div><b>No recent activity</b><span>Your posted records will appear here automatically.</span></div></div>';
}
function toggleCompare(id,checked){
  if(checked&&!compareIds.includes(id)){if(compareIds.length>=2){alert('Select up to two listings to compare.');renderMarketplace();return}compareIds.push(id)}
  if(!checked)compareIds=compareIds.filter(x=>x!==id);
  updateCompareTray();
}
function updateCompareTray(){
  const tray=$('compareTray');if(!tray)return;
  tray.classList.toggle('show',compareIds.length>0);
  $('compareNames').innerHTML=compareIds.map(id=>{const x=getListings().find(v=>v.id===id);return x?`<span class="compareChip">${esc(x.title)}</span>`:''}).join('');
}
function clearCompare(){compareIds=[];updateCompareTray();renderMarketplace()}
function openComparison(){
  if(compareIds.length!==2){alert('Select exactly two listings to compare.');return}
  const [a,b]=compareIds.map(id=>getListings().find(x=>x.id===id));
  const val=x=>(x.quantity||0)*(x.price||0)*1000;
  const metrics=[
    ['Quantity',`${a.quantity??'—'} tons`,`${b.quantity??'—'} tons`],
    ['Purity',`${a.purity??'—'}%`,`${b.purity??'—'}%`],
    ['Copper',`${a.elements?.Copper||0}%`,`${b.elements?.Copper||0}%`],
    ['Aluminium',`${a.elements?.Aluminium||0}%`,`${b.elements?.Aluminium||0}%`],
    ['Price',`₹${a.price??'—'}/kg`,`₹${b.price??'—'}/kg`],
    ['Buyer',a.buyer||'—',b.buyer||'—'],['Location',a.location||'—',b.location||'—'],
    ['Estimated value',`₹${val(a).toLocaleString('en-IN')}`,`₹${val(b).toLocaleString('en-IN')}`]
  ];
  $('detailContent').innerHTML=`<div class="kicker">COMPARISON</div><h2>Listing comparison</h2><p style="color:var(--muted)">Illustrative comparison of price, purity, and material quantity between two listings.</p>
  <div class="compareTableWrap"><table class="compareTable"><thead><tr><th>Metric</th><th>${esc(a.title)}</th><th>${esc(b.title)}</th></tr></thead><tbody>${metrics.map(r=>`<tr><td><b>${r[0]}</b></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td></tr>`).join('')}</tbody></table></div>
  <div class="compareGrid"><div class="chartBox"><h3>Price / kg</h3>${svgCompareBars(a.price||0,b.price||0,'₹')}</div><div class="chartBox"><h3>Purity %</h3>${svgCompareBars(a.purity||0,b.purity||0,'%')}</div><div class="chartBox"><h3>Quantity tons</h3>${svgCompareBars(a.quantity||0,b.quantity||0,'t')}</div><div class="chartBox"><h3>Estimated value</h3>${svgCompareBars(val(a),val(b),'₹')}</div></div>
  <div class="formActions"><button class="btn secondary" onclick="closeDetail()">Close</button></div>`;
  $('detailOverlay').classList.remove('hidden');
}
function svgCompareBars(a,b,unit){
  const max=Math.max(a,b,1),scale=v=>Math.max(5,(v/max)*100);
  return `<div style="display:grid;gap:14px;padding:25px 5px"><div><b>Listing A</b><div class="miniTrack" style="height:18px;margin-top:5px"><div class="miniFill" style="width:${scale(a)}%"></div></div><small>${unit}${Number(a).toLocaleString('en-IN')}</small></div><div><b>Listing B</b><div class="miniTrack" style="height:18px;margin-top:5px"><div class="miniFill" style="width:${scale(b)}%"></div></div><small>${unit}${Number(b).toLocaleString('en-IN')}</small></div></div>`;
}
function makeOffer(id){
  const x=getListings().find(v=>v.id===id);if(!x)return;
  const offer=prompt(`Enter your offer for ${x.title} (₹/kg):`,x.buyerOffer||x.price||'');
  if(offer===null)return;
  x.buyerOffer=Number(offer)||x.buyerOffer;x.status='Negotiating';saveListings(getListings().map(v=>v.id===id?x:v));
  closeDetail();renderMarketplace();refreshDashboard();
}
function drawDetailCharts(x){
  const prices=getListings().filter(v=>v.material===x.material&&v.price).slice(-6).map(v=>v.price);
  const labels=prices.map((_,i)=>`M${i+1}`);
  $('detailPriceChart').innerHTML=svgLineChart(prices,labels,'₹');
  $('detailBuyerChart').innerHTML=svgCompareBars(x.price||0,x.buyerOffer||0,'₹');
  $('detailPieChart').innerHTML=pieChart(Object.entries(x.elements||{}).filter(([,v])=>v>0),'%',null);
  const peers=getListings().filter(v=>v.material===x.material&&v.quantity&&v.price).slice(-6);
  $('detailScatterChart').innerHTML=peers.length?`<div class="locationBars">${peers.map(v=>`<div class="locationRow"><b>${v.quantity}t</b><div class="locationTrack"><div class="locationFill" style="width:${Math.min(100,(v.price/Math.max(...peers.map(p=>p.price)))*100)}%"></div></div><span>₹${v.price}</span></div>`).join('')}</div>`:'<div class="chartEmpty"><div><b>No comparable quantity/price records</b></div></div>';
}
function renderAnalytics(){
  const all=getListings();
  const waste=all.filter(x=>x.type==='waste').length;
  const buyer=all.filter(x=>x.type==='buyer').length;
  const total=all.length;

  /*
    The old version stopped here when #listingDonut was not present.
    The redesigned dashboard does not use that old donut element, so
    returning here prevented ALL dashboard charts from rendering.
  */
  const donut=$('listingDonut');

  if(donut){
    if(!total){
      donut.innerHTML='<div class="chartEmpty"><div><div class="chartEmptyIcon">◔</div><b>Waiting for real marketplace data</b><span>Create a waste or buyer listing to activate this chart.</span></div></div>';
    }else{
      const vals=[waste,buyer];
      const labels=['Waste available','Buyer requirements'];
      const colors=['#159a78','#d98235'];
      const r=78,c=2*Math.PI*r,cx=115,cy=115;
      let offset=0,circles='';

      vals.forEach((v,i)=>{
        const len=c*(v/total);
        const dash=`${len} ${c-len}`;
        circles+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${colors[i]}" stroke-width="24" stroke-linecap="round" stroke-dasharray="${dash}" stroke-dashoffset="${-offset}" transform="rotate(-90 ${cx} ${cy})"></circle>`;
        offset+=len;
      });

      donut.innerHTML=`<div class="chartWrap"><svg class="donutSvg" viewBox="0 0 230 230"><circle cx="115" cy="115" r="78" fill="none" stroke="#e9f1ee" stroke-width="24"></circle>${circles}</svg><div class="donutCenter"><strong>${total}</strong><span>Total listings</span></div></div><div class="legend">${labels.map((l,i)=>`<div class="legendItem"><i class="legendDot" style="background:${colors[i]}"></i><span>${l}</span><b>${vals[i]}</b></div>`).join('')}</div>`;
    }
  }

  // Always render the new dashboard analytics.
  renderDashboardAnalytics();
}
window.addEventListener('storage',e=>{
  if(e.key===KEY_LISTINGS){
    renderMarketplace();
    if(currentUser()) refreshDashboard();
  }
});

function refreshDashboard(){
  const u=currentUser();if(!u)return;
  const mine=getListings().filter(x=>x.postedBy?.id===u.id),w=mine.filter(x=>x.type==='waste'),b=mine.filter(x=>x.type==='buyer');
  renderAnalytics();
  $('recentMine').innerHTML=mine.slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5).map(rowHTML).join('')||'<div class="empty" style="margin-top:12px;padding:35px 15px">You have not posted anything yet.</div>';
  $('myWaste').innerHTML=w.length?w.map(rowHTML).join(''):'<div class="empty" style="margin-top:15px">No waste listings yet.</div>';
  $('myBuyer').innerHTML=b.length?b.map(rowHTML).join(''):'<div class="empty" style="margin-top:15px">No buyer requirements yet.</div>';
}
function rowHTML(x){
 return `<div class="recordRow"><div><h4>${esc(x.title)}</h4><p>${esc(x.material)} · ${esc(x.location)} · ${dateText(x.createdAt)}</p></div><div style="display:flex;gap:7px"><button class="btn secondary small" onclick="showDetail('${x.id}')">View</button><button class="btn small" onclick="editListing('${x.id}')">Edit</button><button class="btn danger small" onclick="deleteListing('${x.id}')">Delete</button></div></div>`;
}
function deleteListing(id){
 if(!confirm('Delete this listing?'))return;
 saveListings(getListings().filter(x=>x.id!==id));refreshDashboard();renderMarketplace();
}

$('authOverlay').addEventListener('click',e=>{if(e.target.id==='authOverlay')closeAuth()});
$('detailOverlay').addEventListener('click',e=>{if(e.target.id==='detailOverlay')closeDetail()});

/* IMPORTANT: seed the 10 default marketplace listings before rendering. */
ensureDemoListings();

renderMarketplace();
if(session()&&currentUser())openDashboard();
