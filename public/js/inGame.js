let players = [];
let gameSize = 0;
let turnSched = null;
let playerTurn = null;
let cardOnTable = null;

class mainPlayer{
    constructor(username, cards){
        this.username = username;
        this.cards = cards;
        console.log("Nome main player: " + username);
        console.log("Carte player");
        cards.forEach(c => {
            console.log(c);
        });
        players.push(this);
        this.setupBox();
        this.setupCards();
        this.disableAllCards();
    }

    setupBox(){
        document.getElementsByName("pl0_box")[0]
            .setAttribute('id', this.username + "_box");
        document.getElementsByName("pl0_username")[0]
            .setAttribute('id', this.username + "_username");
        document.getElementsByName("pl0_username")[0].innerHTML = 
        '<i class="fa-solid fa-user"></i> ' + this.username;
        document.getElementById("cardPicker").addEventListener("click", () =>{
            this.sendPick();
        })
    }
    setupCards(){
        //struttura carta: <id>_<valore>_<colore>
        document.getElementsByName("pl0_cards")[0]
            .setAttribute('id', this.username + "_cards");
        this.cards.forEach(c => {
            c.createDivComponent();
            document.getElementById(this.username + "_cards")
                .insertAdjacentElement("afterbegin", c.divComponent);
        });
        if(this.cards.length === 1) setLastCardState(this);
    }

    addCard(card){
        card.createDivComponent();
        document.getElementById(this.username + "_cards")
            .insertAdjacentElement("afterbegin", card.divComponent);
        this.cards.push(card);
        if(playerTurn === this) this.updateCardChoices();
        if(this.cards.length > 1) removeLastCardState(this);
    }
    updateCardChoices(){
        this.cards.forEach(c =>{
            if(c.colore !== cardOnTable.colore && c.valore !== cardOnTable.valore
                && c.valore !== "cambioColore" && c.valore !== "+4"){
                c.divComponent.classList.add("disable");
            } else c.divComponent.classList.remove("disable");
        });
    }
    disableAllCards(){
        this.cards.forEach(c =>{
            c.divComponent.classList.add("disable");
        });
    }

    sendPick(){
        if(playerTurn !== this) return;
        s.emit("pickCard", (r) =>{
            if(r !== "ok"){
                sendNotification("saddlebrown",
                    r + " Per qualsiasi problema, prova a ricaricare la pagina.");
            }
        })
    }
}


class otherPlayer{
    constructor(username, totalCards){
        console.log("setup Otherplayer avviato");
        this.username = username;
        this.totalCards = totalCards;
        this.cards = [];
        players.push(this);
        this.setupBox();
        this.setupCards();
    }
    setupBox(){
        let plIndex;
        if(gameSize === 2) plIndex = 2;
        else plIndex = players.indexOf(this);
        console.log(plIndex);
        document.getElementsByName("pl"+plIndex+"_box")[0]
            .setAttribute("id", this.username+"_box");
        document.getElementsByName("pl" +plIndex+"_username")[0]
            .setAttribute("id", this.username + "_username");
        document.getElementsByName("pl"+plIndex+ "_username")[0].innerHTML = 
        '<i class="fa-solid fa-user"></i> ' + this.username;
    }
    setupCards(){
        let plIndex;
        if(gameSize === 2) plIndex = 2;
        else plIndex = players.indexOf(this);
        let plCards = document.getElementsByName("pl"+plIndex+"_cards")[0];
        plCards.setAttribute('id', this.username + "_cards");
        for(let i = 1; i <= this.totalCards; i++) this.addCard();
        if(this.cards.length === 1) setLastCardState(this);
    }

    createCardDiv(){
        let cardDiv = document.createElement("div");
        let imgElem = document.createElement("img");
        cardDiv.setAttribute("class", "bCard");
        imgElem.setAttribute("src", "imgs/deck/unoback.png");
        cardDiv.appendChild(imgElem);
        return cardDiv;
    }
    addCard(){
        let card = this.createCardDiv();
        this.cards.unshift(card);
        document.getElementById(this.username + "_cards").insertAdjacentElement('afterbegin', card);
        if(this.cards.length > 1) removeLastCardState(this);
    }
    removeCard(){
        console.log("Prima: " + this.cards.length);
        this.cards[0].outerHTML = "";
        this.cards.splice(0, 1);
        console.log("Dopo: " + this.cards.length);
        if(this.cards.length === 1) setLastCardState(this);
    }
}

class card{
    constructor(id, valore, colore, isUserCard){
        this.id = id;
        this.valore = valore;
        this.colore = colore;
        this.isUserCard = isUserCard;
        this.divComponent = null;
    }

    createDivComponent(){
        let cardImg = document.createElement("img");
        let cardDiv = document.createElement("div");
        let cardColor = this.colore === "null" ? "" : this.colore;
        cardDiv.setAttribute("class", "card");
        cardImg.setAttribute("src", "imgs/deck/" + this.valore + cardColor + ".png");
        cardDiv.appendChild(cardImg);
        if(this.isUserCard){
            cardDiv.classList.add("player");
            cardDiv.addEventListener("click", () =>{
                if(playerTurn instanceof otherPlayer) return;
                if(this.colore !== cardOnTable.colore && this.valore !== cardOnTable.valore
                    && this.valore !== "cambioColore" && this.valore !== "+4") return;
                if(this.valore === "cambioColore" || this.valore === "+4"){
                    openChooseColor(this.valore, this.id , (r) =>{
                        if(r !== "ok"){
                            sendNotification("saddlebrown",
                                r + " Per qualsiasi problema, prova a ricaricare la pagina.");
                            return;
                        }
                        this.removeCard();
                        closeChooseColor();
                    });
                    return;
                }
                s.emit("placeCard", this.id, (r) =>{
                    console.log("placeCard - " + r);
                    if(r !== "ok"){
                        sendNotification("saddlebrown",
                            r + " Per qualsiasi problema, prova a ricaricare la pagina.");
                        return;
                    }
                    this.removeCard();
                });
            });
        }
        this.divComponent = cardDiv;
    }

    removeCard(){
        this.divComponent.outerHTML = "";
        let cardIndex = players[0].cards.indexOf(this);
        players[0].cards.splice(cardIndex, 1);
        if(players[0].cards.length === 1) setLastCardState(players[0]);
    }

}


function manageGame(data){
    if(data.includes("tableSize")){
        setTableSize(data);
        return;
    }
    if(data.includes("setupPlayer")){
        setupPlayer(data);
        return;
    }
    if(data.includes("startAnim")){
        startAnimation();
        return;
    }
    if(data.includes("showTable")){
        showTable();
        return;
    }
    if(data.includes("currentTurn")){
        manageTurn(data);
        return;
    }
    if(data.includes("cardOnTable")){
        setCardOnTable(data);
        return;
    }
    if(data.includes("removeCard")){
        removeCard(data);
        return;
    }
    if(data.includes("addCard")){
        manageAddCard(data);
        return;
    }
    if(data.includes("pickStatus")){
        managePick(data);
        return;
    }
    if(data.includes("winner")){
        setWinner(data);
        return;
    }
    if(data.includes("plRemove")){
        removePlayerIG(data);
    }
}

function setupPlayer(data){
    //QUI CI SONO DUE TIPI DI SETUP PLAYER:
    //setupPlayer:main <- giocatore principale;
    //setupPlayer:other <- altri giocatori;
    //Il primo controllo da fare è controllare se il giocatore è main o other
    //Indice di controllo: 1
    let dataSpliced = data.split(":");
    if(dataSpliced[1] === "main"){
        /*
            Nel caso in cui il giocatore è main:
            setupPlayer:main:<username>:<boolean>:<carta1>:<carta2> ecc...
            Struttura carta: <id>_<valore>_<colore>
            Indice username: 2;
            Indice inizio carte: 3;
        */
       let cards = [];
       for(let i = 3; i < dataSpliced.length; i++){
        let cardSplit = dataSpliced[i].split("_"); //Splitto la struttura carta
        cards.push(new card(cardSplit[0], cardSplit[1], cardSplit[2], true));
       }
       new mainPlayer(dataSpliced[2], cards);
    }
    /*
            Nel caso in cui il giocatore è other:
            setupPlayer:other:<username><n.carte>
            indice username : 2
            indice n.carte : 3
    */
    else new otherPlayer(dataSpliced[2], dataSpliced[3]);
}

function removePlayerIG(data){
    let dataSplitted = data.split(":");
    sendNotification("brown", dataSplitted[1] + " è uscito dalla partita!");
    document.getElementById(dataSplitted[1] + "_cards")
        .innerHTML = "<h2 style='color:brown'>Disconnesso</h2>";
    let plIndex = players.indexOf(getPlayerByUsername(dataSplitted[1]));
    players.splice(plIndex, 1);
}

function setTableSize(data){
    setMusic("ingame");
    let dataSplitted = data.split(":");
    gameSize = parseInt(dataSplitted[1]); //convertire stringa in integer.
    if(gameSize === 2){
        document.getElementsByName("pl1_box")[0].style.display = "none";
        document.getElementsByName("pl3_box")[0].style.display = "none";
    }
}

function setCardOnTable(data){
    let dataSplitted = data.split(":");
    let cardSplit = dataSplitted[1].split("_");
    //Formato carta: <valore><colore>
    let c = new card(null, cardSplit[0], cardSplit[1], false);
    c.createDivComponent();
    let randomRotation = Math.random() * 20 - 10;
    c.divComponent.style.rotate = randomRotation + "deg";
    c.divComponent.style.position = "absolute";
    c.divComponent.style.transform = "translate(-100%, -50%)";
    document.getElementById("cardsTable").insertAdjacentElement("beforeend", c.divComponent);
    cardOnTable = c;
    playCardAudio();
}

function removeCard(data){
    //removeCard:<username>
    let dataSplitted = data.split(":");
    let pl = getPlayerByUsername(dataSplitted[1]);
    if(pl instanceof mainPlayer) return;
    pl.removeCard();
}

function manageAddCard(data){
    //addCard:<username>[carta];
    let dataSplitted = data.split(":");
    let pl = getPlayerByUsername(dataSplitted[1]);
    if(pl instanceof mainPlayer){
        let cardSplitted = dataSplitted[2].split("_");
        pl.addCard(new card(cardSplitted[0], cardSplitted[1], cardSplitted[2], true));
        return;
    }
    pl.addCard();
}

function managePick(data){
    //pickStatus:<stato>
    let dataSplitted = data.split(":");
    let elem = document.getElementById("cardPicker_status");
    switch (dataSplitted[1]){
        case "wait":
            elem.innerText = "Attendi il prossimo turno";
            break;
        case "true":
            elem.innerText = "Salta turno";
            break;
        case "false":
            elem.innerText = "Pesca una carta";
            break;
        default:
            elem.innerText = "n/A";
            break;
    }
}


function showTable(){
    document.getElementById("gameWait").style.display = "none";
    document.getElementById("gameTable").removeAttribute("style");
}

function manageTurn(data){
    if(playerTurn !== null) stopPlayerTurn(playerTurn);
    let dataSplitted = data.split(":");
    let pl = getPlayerByUsername(dataSplitted[1]);
    //Formato: currentTurn:<username>:<timestamp>
    //Indice username: 1;
    //Indice timestamp: 2;
    startPlayerTurn(pl, dataSplitted[2]);
}

function startPlayerTurn(player, timestamp){
    playerTurn = player;
    let timerElem = document.createElement("p");
    timerElem.setAttribute("id", player.username + "_timer");

    let usernameElem = document.getElementById(player.username + "_username");
    usernameElem.insertAdjacentElement('beforeend', timerElem);
    usernameElem.classList.add("usrTurn");

    if(player instanceof mainPlayer){
        // document.getElementById(player.username + "_cards")
        //     .classList.remove("disable");
        player.updateCardChoices();
    }

    turnSched = setInterval(() =>{
        let currentTimestamp = Math.floor(Date.now() / 1000);
        if(currentTimestamp >= timestamp){
            stopPlayerTurn(player);
            return;
        }
        timerElem.innerHTML = timestamp - currentTimestamp + "s";
    }, 1000);
}

function stopPlayerTurn(player){
    document.getElementById(player.username + "_username")
        .classList.remove("usrTurn");
    document.getElementById(player.username + "_timer").outerHTML = "";
    if(player instanceof  mainPlayer){
        // document.getElementById(player.username + "_cards")
        //     .classList.add("disable");
        player.disableAllCards();
    }
    clearInterval(turnSched);
    playerTurn = null;
    turnSched = null;
}

function startAnimation(){

}

function openChooseColor(value, id, callback){
    let colors = ["verde", "giallo", "rosso", "blu"];
    colors.forEach(color =>{
        let cardDiv = document.createElement("div");
        cardDiv.setAttribute("class", "card player");
        let cardImg = document.createElement("img");
        cardImg.src = "/imgs/deck/" + value + color + ".png";
        cardDiv.insertAdjacentElement("afterbegin", cardImg);
        cardDiv.onclick = () =>{
            s.emit("placeCard", id+":"+color, (r) =>{
                callback(r);
            })
            console.log("click 1");
            console.log("click 2");
        };
        document.getElementById("colorChooser_cards")
            .insertAdjacentElement("beforeend", cardDiv);
    });
    document.getElementById("colorChooser").removeAttribute("style");
}

function closeChooseColor(){
    document.getElementById("colorChooser").style.display = "none";
    document.getElementById("colorChooser_cards").innerHTML = "";
}

function setLastCardState(player){
    let usernameDiv = document.getElementById(player.username + "_username");
    let img = document.createElement("img");
    img.setAttribute("id", player.username + "_lastCard");
    img.src = "/imgs/logo.png";
    img.classList.add("lastCard");
    usernameDiv.insertAdjacentElement("afterbegin", img);
    playUnoAudio();
}

function removeLastCardState(player){
    let img = document.getElementById(player.username + "_lastCard");
    if(img != null) img.outerHTML = "";
}

function setWinner(data){
    let dataSplitted = data.split(":");
    let boxes = document.getElementsByClassName("box");
    let winnerBox = document.getElementById(dataSplitted[1] + "_box");
    for(let i = 0; i < boxes.length; i++) {
        if (boxes[i] !== winnerBox) boxes[i].style.display = "none";
    }
    document.body.style.backgroundColor = "black";
    winnerBox.setAttribute("class", "box winner");
    setTimeout(() => {
        document.getElementById("winner_username").innerText = dataSplitted[1];
        document.getElementById("winnerContainer").removeAttribute("style");
    }, 2000);
}

function getPlayerByUsername(username){
    for(let i = 0; i < players.length; i++){
        if(players[i].username === username) return players[i];
    }
}