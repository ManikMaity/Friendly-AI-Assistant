import "./style.css";
import { GoogleGenerativeAI } from "@google/generative-ai";



let apiKey;
let model;

function getAPIKey() {
  apiKey = JSON.parse(localStorage.getItem("apiKey"));
  if (apiKey == null || apiKey == ""){
    apiKey = prompt("Enter Gemini API key");
    localStorage.setItem("apiKey", JSON.stringify(apiKey));
  }
  let genai = new GoogleGenerativeAI(apiKey);
  model = genai.getGenerativeModel({ model: "gemini-pro" });
}

getAPIKey();

const sentMessageBtn = document.querySelector(".msger-send-btn");
const messageInputArea = document.querySelector(".msger-input");
const errorMsg = document.querySelector(".errorMsg");
const chatsContainer = document.querySelector(".chats-container");

function convertMarkdownToHTML(markdownText) {
  markdownText = markdownText.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  markdownText = markdownText.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  markdownText = markdownText.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  markdownText = markdownText.replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>');
  markdownText = markdownText.replace(/\*(.*)\*/g, '<em>$1</em>');
  markdownText = markdownText.replace(/^\s*-\s(.*)$/gim, '<ul><li>$1</li></ul>');
  markdownText = markdownText.replace(/\n/g, '<br>');
  return markdownText;
}

let chatHistory =  [
  {
    role: "user",
    parts: [{ text: "Act as a friendly assistant of user who give answer in short and concise manner. User don't like answer exceeding 2 to 3 lines paragraphs. So you should give answer within 2 to 3 lines paragraphs. For each answer keep this in mind and then give reply in 2 to 3 line paragraphs .  ok?" }],
  },
  {
    role: "model",
    parts: [{ text: "Absolutely, got it! I'm here to help. Just let me know what you need assistance with." }],
  },
  {
    role: "user",
    parts: [{ text: "who is narendra modi" }],
  },
  {
    role: "model",
    parts: [{ text: "Narendra Modi is the Prime Minister of India, serving since May 2014. He's a prominent political figure known for his policies, leadership, and influence on Indian politics." }],
  },
];

function updateChatHistory(role = "", msg = ""){
  const chatItemObj = {
    role : role,
    parts: [{ text: msg }],
  }
  chatHistory.push(chatItemObj);
}


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
  return `${id}`;
}

function makeUserMessageHTML(msg) {
  return `<div class="msg right-msg user-${makeMsgID()}">
  <div
   class="msg-img"
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


function makeAIMessageHTML(id){
  return `<div class="msg left-msg ai-${id}">
  <div
   class="msg-img"
  ></div>

  <div class="msg-bubble">
    <div class="msg-info">
      <div class="msg-info-name">Assistant</div>
      <div class="msg-info-time">${getTime()}</div>
    </div>

    <div class="loader show"></div>
    <div class="msg-text hide">
    </div>
  </div>
</div>
`;
}

async function generateAIMessage (ele, userMsg = ""){
  const aiMessageEle = ele.querySelector(".msg-text");
  const loaderEle = ele.querySelector(".loader");
  let text;
  try{
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 200,
      },
    });
  
    const result = await chat.sendMessage(userMsg);
    const response = await result.response;
    text = response.text();
    if (text == ""){
      chatHistory[chatHistory.length - 1]?.parts.push({ text: "Apologies, but The response exceeds the maximum token limit of 200 set by Manik (the developer)." })
      console.log(chatHistory);
      text = "Apologies, but The response exceeds the maximum token limit of 200 set by Manik (the developer).";
    }
  }
  catch(err){
    text = "Plase check your api key or internet connection and re-enter gemini api key. Page will reload in 4 sec.";
    localStorage.removeItem("apiKey");
    console.log(model);
    setTimeout(() => {
      window.location.reload();
    }, 6000)
  }
  
  aiMessageEle.innerHTML = convertMarkdownToHTML(text);
  console.log(text);
  aiMessageEle.classList.remove("hide");
  loaderEle.classList.remove("show");

}



async function getResponse(userMsg){
  const aiMsgID = makeMsgID();
  const html = makeAIMessageHTML(aiMsgID);
  chatsContainer.insertAdjacentHTML("beforeend", html);
  chatsContainer.scrollTop = chatsContainer.scrollHeight;
  const aiChatEle = document.querySelector(`.ai-${aiMsgID}`);
  await generateAIMessage(aiChatEle, userMsg);
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
  setTimeout(()=> {
    getResponse(messageText);
  }, 1000)
}



if (apiKey == null || apiKey == ""){
  showError("Chat will not work, API key not given.");
}

sentMessageBtn.addEventListener("click", sendMessage);
