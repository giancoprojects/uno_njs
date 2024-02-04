function manageChat(data){
    //chat:Gino:Ciao sono un salame!
    //versione2: Il messaggio viene ricevuto in base64
    //esempio - Gino:49dfks34kf==
    let dataSplitted = data.split(":");
    let decodedMsg = atob(dataSplitted[1]); //Decodifico il messaggio base64
    let chatElem = document.getElementById("chatMessages");
    let textElem = document.createElement("p");
    let usernameElem = document.createElement("span");
    usernameElem.textContent = dataSplitted[0];
    textElem.insertAdjacentText("afterbegin", " : " + decodedMsg);
    textElem.insertAdjacentElement("afterbegin", usernameElem);
    // let text = "<p><span>"+dataSplitted[0]+"</span> : "+decodedMsg+"</p>";
    chatElem.insertAdjacentElement('beforeend', textElem);
}

function openChat(){
    let chatElem = document.getElementById("chat");
    chatElem.style.display="";
}
function closeChat(){
    let chatElem = document.getElementById("chat");
    chatElem.style.display="none";
}

document.getElementById("chatForm").addEventListener("submit", function(e){
    e.preventDefault();
    let chatInput = document.getElementById("chatMsg");
    if(chatInput.value === "") return;
    let encodedMsg = btoa(chatInput.value); //Invio il messaggio in base64.
    s.emit("chat", encodedMsg);
    chatInput.value = "";
});