/** Like API + LocalStorage Fallback **/
const API_BASE = window.location.origin;
const likeIds = ['project:youtube','project:cctm','project:ppr','cert:dls','cert:dls1','cert:dls2','cert:dls3','cert:dls4',];

/** Update hero counters */
function updateHeroCounters(data){
  const projects = likeIds.filter(id=>id.startsWith('project:')).reduce((s,id)=>s+(data[id]||0),0);
  const certs = likeIds.filter(id=>id.startsWith('cert:')).reduce((s,id)=>s+(data[id]||0),0);
  const total = projects + certs;

  document.getElementById('counter-projects').textContent = projects;
  document.getElementById('counter-certs').textContent = certs;
  document.getElementById('counter-total').textContent = total;
}

/** Load likes */
async function loadLikes(){
  try{
    const res = await fetch(API_BASE + '/api/likes',{cache:'no-store'});
    if(!res.ok) throw new Error('API not available');
    const json = await res.json();

    likeIds.forEach(id=>{
      const span = document.getElementById('like-'+id);
      if(span) span.textContent = json[id] || 0;
    });

    updateHeroCounters(json);
    return json;

  } catch(e){
    // fallback localStorage
    const local = JSON.parse(localStorage.getItem('likes') || '{}');

    likeIds.forEach(id=>{
      const span = document.getElementById('like-'+id);
      if(span) span.textContent = local[id] || 0;
    });

    updateHeroCounters(local);
    return local;
  }
}

/** Send Like */
async function sendLike(id,btn){
  try{
    const res = await fetch(API_BASE + '/api/like',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({id})
    });
    if(!res.ok) throw new Error('API not available');
    const json = await res.json();

    document.getElementById('like-'+id).textContent = json[id] || 0;
    updateHeroCounters(json);

  } catch(e){
    // fallback localStorage
    const local = JSON.parse(localStorage.getItem('likes') || '{}');
    local[id] = (local[id]||0) + 1;
    localStorage.setItem('likes',JSON.stringify(local));

    document.getElementById('like-'+id).textContent = local[id];
    updateHeroCounters(local);
  }

  // ✅ Button style update
  btn.classList.add("liked","bg-red-500","text-white");
  btn.innerText = "♥ Liked";
  localStorage.setItem(`liked-${id}`,"true");
}

/** DOM Load */
document.addEventListener('DOMContentLoaded', async ()=>{
  // Load counts
  await loadLikes();

  // Restore like states
  document.querySelectorAll('.like-btn').forEach(btn=>{
    const key = btn.dataset.like;
    if(localStorage.getItem(`liked-${key}`)==="true"){
      btn.classList.add("liked","bg-red-500","text-white");
      btn.innerText = "♥ Liked";
    }

    btn.addEventListener('click', ()=>{
      if(!btn.classList.contains("liked")){
        sendLike(key,btn);
      }
    });
  });

  // === Video Controls ===
  const video = document.getElementById('bgVideo');
  const toggle = document.getElementById('toggleVideo');
  if(toggle && video){
    toggle.addEventListener('click',()=>{
      if(video.paused){ video.play(); toggle.textContent="Pause"; }
      else { video.pause(); toggle.textContent="Play"; }
    });
  }

  // === Gallery Modal ===
  const openBtn=document.getElementById("openGallery");
  const closeBtn=document.getElementById("closeGallery");
  const modal=document.getElementById("galleryModal");

  const fullscreenViewer=document.getElementById("fullscreenViewer");
  const fullscreenImg=document.getElementById("fullscreenImg");
  const closeViewer=document.getElementById("closeViewer");
  const prevBtn=document.getElementById("prevPhoto");
  const nextBtn=document.getElementById("nextPhoto");

  let images=[],currentIndex=0;

  if(openBtn && modal){
    openBtn.addEventListener("click",()=>{
      modal.classList.remove("hidden");
      images=Array.from(document.querySelectorAll(".gallery-img"));
    });
  }
  if(closeBtn) closeBtn.addEventListener("click",()=>modal.classList.add("hidden"));

  document.addEventListener("click",(e)=>{
    if(e.target.classList.contains("gallery-img")){
      currentIndex=images.indexOf(e.target);
      showImage(currentIndex);
    }
  });
  function showImage(index){
    fullscreenImg.src=images[index].src;
    fullscreenViewer.classList.remove("hidden");
  }
  if(nextBtn) nextBtn.addEventListener("click",()=>{
    currentIndex=(currentIndex+1)%images.length;
    showImage(currentIndex);
  });
  if(prevBtn) prevBtn.addEventListener("click",()=>{
    currentIndex=(currentIndex-1+images.length)%images.length;
    showImage(currentIndex);
  });
  if(closeViewer) closeViewer.addEventListener("click",()=>fullscreenViewer.classList.add("hidden"));
  document.addEventListener("keydown",(e)=>{
    if(e.key==="Escape") fullscreenViewer.classList.add("hidden");
    if(e.key==="ArrowRight"){currentIndex=(currentIndex+1)%images.length; showImage(currentIndex);}
    if(e.key==="ArrowLeft"){currentIndex=(currentIndex-1+images.length)%images.length; showImage(currentIndex);}
  });

  // === Marquee ===
  const marquee=document.getElementById("marquee");
  const content=document.getElementById("marquee-content");
  const duplicate=document.getElementById("marquee-content-duplicate");
  if(marquee && content && duplicate){
    duplicate.innerHTML=content.innerHTML;
    let x=0;
    function animate(){
      x-=1;
      if(Math.abs(x)>=content.scrollWidth){x=0;}
      marquee.style.transform=`translateX(${x}px)`;
      requestAnimationFrame(animate);
    }
    animate();
  }

  // === Contact Form ===
  const form=document.getElementById('contactForm');
  if(form){
    form.addEventListener('submit',(e)=>{
      e.preventDefault();
      const name=document.getElementById('name').value||'Anonymous';
      const email=document.getElementById('email').value||'It was optional';
      const mobile=document.getElementById('mobile').value||'No mobile number provided';
      const message=document.getElementById('message').value;

      if(mobile && mobile!=='No mobile number provided' && !/^\d+$/.test(mobile)){
        alert('Mobile number must contain only digits!');
        return;
      }
      if(!message){ alert('Please enter a message!'); return; }

      alert(`Message from: ${name}\nEmail: ${email}\nMobile: ${mobile}\nMessage: ${message}`);
      console.log({name,email,mobile,message});
      form.reset();
    });
  }
});


 const form = document.getElementById("contactForm");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    let data = {
      name: document.getElementById("name").value,
      message: document.getElementById("message").value,
      secret: "MY_SECRET_123" // 🔑 wahi secret key jo Apps Script me dala tha
    };

    let response = await fetch("https://script.google.com/macros/s/AKfycby7NTrxuEEjEjkOb_m36nHW-B89ox5b7pmvP-nBrfOOJWravNft38vPPPqClD0Y1VGo/exec", {
      method: "POST",
      body: JSON.stringify(data),
    });

    let text = await response.text();
    alert("Server response: " + text);
  });