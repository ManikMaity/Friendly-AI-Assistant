import "./style.css";
import { GoogleGenerativeAI } from "@google/generative-ai";
let apiKey;
let model;

function getAPIKey() {
  apiKey = localStorage.getItem("apiKey");
  if (apiKey == null){
    apiKey = prompt("Enter Gemini API key");
    localStorage.setItem("apiKey", apiKey);
  }
  console.log(apiKey, typeof apiKey);
  let genai = new GoogleGenerativeAI(apiKey);
  model = genai.getGenerativeModel({ model: "gemini-pro" });
}
getAPIKey();

const sentMessageBtn = document.querySelector(".msger-send-btn");
const messageInputArea = document.querySelector(".msger-input");
const errorMsg = document.querySelector(".errorMsg");
const chatsContainer = document.querySelector(".chats-container");


// function getResponse(msg){}-------------------------------------- UP TO THIS PART


function showError(txt = "") {
  errorMsg.parentElement.classList.add("show");
  errorMsg.textContent = txt;
}
function hideError() {
  errorMsg.textContent = "";
  errorMsg.parentElement.classList.remove("show");
}

function getTime() {
  const date = new Date();
  return `${date.toLocaleString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  })}`;
}

function makeMsgID() {
  const id = Math.floor(Math.random() * 1000000);
  return `user-${id}`;
}

function makeUserMessageHTML(msg) {
  return `<div class="msg right-msg ${makeMsgID()}">
  <div
   class="msg-img"
   style="background-image: url(./assets/user.png)"
  ></div>

  <div class="msg-bubble">
    <div class="msg-info">
      <div class="msg-info-name">User</div>
      <div class="msg-info-time">${getTime()}</div>
    </div>

    <div class="msg-text">
      ${msg}
    </div>
  </div>
</div>`;
}

function sendMessage(e) {
  e.preventDefault();
  const messageText = messageInputArea.value;
  if (messageText == "") {
    showError("Please enter your massage.");
    return;
  }
  hideError();
  const html = makeUserMessageHTML(messageText);
  chatsContainer.insertAdjacentHTML("beforeend", html);
  chatsContainer.scrollTop = chatsContainer.scrollHeight;
  messageInputArea.value = ``;
}

if (apiKey == ""){
  showError("Chat will not work, API key not given.");
}

sentMessageBtn.addEventListener("click", sendMessage);
