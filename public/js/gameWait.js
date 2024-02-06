function manageGameWait(data) {
    if (data.includes('init')) {
        setupMenu(data);
        return;
    }
    if(data.includes('plAdd')){
        addPlayer(data);
        return;
    }
    if(data.includes('plRemove')){
        removePlayer(data);
        return;
    }
    if(data.includes('gameStarting')){
        setGameStarting();
        return;
    }
    if(data.includes('abortGameStarting')){
        abortGameStarting();
        return;
    }
}

function setupMenu(data) {
    console.log(data);
    // 0 da escludere.
    //init:12345:4:waiting|Pino|gino|lino
    console.log("Imposto menu gameWait");
    let dataSpliced = data.split(":");
    document.getElementById("gwCode").innerHTML = dataSpliced[1];
    document.getElementById("gwLink").innerHTML = document.location.href + "entra?code=" + dataSpliced[1];
    if(dataSpliced[3] === "waiting") abortGameStarting();
    else setGameStarting();
    let players = dataSpliced[4].split("|");
    let plElem = document.getElementById("gwPlayers");
    plElem.insertAdjacentHTML("afterbegin","<h2>Giocatori: " + players.length + "/" + dataSpliced[2] +"</h2>");
    for(let i = 0; i < players.length; i++){
        plElem.insertAdjacentHTML("beforeend", "<p>" + players[i] + "</p>");
    }
}


function addPlayer(data){
    //plAdd:Gino:4:Lino|pino|Gino
    //0 da escludere.
    let dataSplitted = data.split(":");
    sendNotification("green" , dataSplitted[1] + " è entrato in partita!");
    let players = dataSplitted[3].split("|");
    let plElem = document.getElementById("gwPlayers");
    plElem.innerHTML = "";
    plElem.insertAdjacentHTML("afterbegin","<h2>Giocatori: " + players.length + "/" + dataSplitted[2] +"</h2>");
    for(let i = 0; i < players.length; i++){
        plElem.insertAdjacentHTML("beforeend", "<p>" + players[i] + "</p>");
    }
}
function removePlayer(data){
    //plRemove:Gino:4:Lino|pino
    //0 da escludere;
    let dataSplitted = data.split(":");
    sendNotification("brown" , dataSplitted[1] + " è uscito dalla partita!");
    let players = dataSplitted[3].split("|");
    let plElem = document.getElementById("gwPlayers");
    plElem.innerHTML = "";
    plElem.insertAdjacentHTML("afterbegin","<h2>Giocatori: " + players.length + "/" + dataSplitted[2] +"</h2>");
    for(let i = 0; i < players.length; i++){
        plElem.insertAdjacentHTML("beforeend", "<p>" + players[i] + "</p>");
    }
}
function updatePlayerList(pl_list){
    //Formato pl_list: Gino|Lino|Pino
}

function setGameStarting(){
    let elem = document.getElementById("gwState");
    elem.style.color = "green";
    elem.innerHTML = "Avvio partita tra 10 secondi..";
}

function abortGameStarting(){
    let elem = document.getElementById("gwState");
    elem.style.color = "coral";
    elem.innerHTML = "In attesa giocatori..";
}