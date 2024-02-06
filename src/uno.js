let player = require("./player.js");
let cards = require("./cards.js");
let hosted_games = [];

class uno_game{
    constructor(size, owner){
        this.size = size;
        this.owner = owner;
        this.id = this.generate_code();
        this.gameState = "waiting";
        this.currentTurn = null;
        this.turnTimestamp = null;
        this.isClockwiseTurn = true;
        this.players = [];
        this.gameDeck = [];
        this.usedDeck = [];
        this.gwSched = null;
        this.igSched = null;
        console.log("game creato con successo.");
        console.log("game id:" + this.id);
        hosted_games.push(this);
    }

    generate_code(){
        let rd = Math.floor(Math.random() * 90000) + 10000;
        return rd.toString();
    }

    add_player(username, unique_id, httpSession){
        let p = player.create_player(username, unique_id, this.id, httpSession);
        this.players.push(p);
        this.sendSocketMsgToAll("gw", "plAdd:" + username + ":" + this.size + ":" + this.getStringPlayerList());
        //console.log(this.players[0]);
        if(this.players.length == this.size) this.announceGameStart();
    }
    remove_player(player){
        console.log("giocatore rimosso.");
        if(player.httpSession != null) player.httpSession.destroy();
        console.log("Player rimasti: " + this.players.length);
        if(this.gameState === "waiting" || this.gameState === "starting"){
            this.players.splice(this.players.indexOf(player), 1);
            this.sendSocketMsgToAll("gw", "plRemove:" + player.username + ":" + this.size + ":" + this.getStringPlayerList());
            if(this.players.length < this.size && this.gwSched !== null) this.abortGameStarting();
            if(this.players.length === 0){
                this.removeGame();
                return;
            }
            return;
        }
        let plTurn = this.getPlayerTurn();
        this.players.splice(this.players.indexOf(player), 1);
        // let plIndex = this.players.indexOf(player);
        // this.players[plIndex] = null;
        this.sendSocketMsgToAll("ig", "plRemove:" + player.username);
        if(this.players.length === 1){
            console.log("condizione announcegamewinner");
            this.announceGameWinner(this.players[0]);
            return;
        }
        if(this.players.length <= 0){
            console.log("condizione dimensione 0");
            this.removeGame();
        }
        if(plTurn === player){
            console.log("CONDIZIONE REMOVE PLAYER DURANTE TURNO VERIFICATA");
            this.setCurrentTurn(0);
        }
    }

    announceGameStart(){
        this.gameState = "starting";
        this.sendSocketMsgToAll("gw", "gameStarting");
        this.gwSched = setTimeout(() =>{
            this.startGame();
        }, 1000 * 10);
        console.log("Sto avviando il gioco..");
    }

    announceGameWinner(player){
        clearTimeout(this.igSched);
        this.sendSocketMsgToAll("ig", "winner:" + player.username);
        this.igSched = setTimeout(() =>{
            this.removeGame();
        }, 1000 * 10);
    }

    abortGameStarting(){
        clearTimeout(this.gwSched);
        this.gwSched = null;
        this.gameState = "waiting";
        this.sendSocketMsgToAll("gw", "abortGameStarting");
    }

    startGame(){
        console.log("GAME AVVIATO.");
        this.gwSched = null;
        this.gameState = "started";
        this.generateGameDeck();
        this.spreadCards();
        this.players.forEach(pl => {
            this.setupTable(pl);
        });
        this.putCardOnTable(0, this.gameDeck);
        this.setCurrentTurn(null);
    }

    //GENERA IL MAZZO
    generateGameDeck(){
        let default_deck = [...cards.getDefaultDeck()];
        //La sintassi qui sopra serve per copiare un array non per riferimento ma per valore.
        //quindi qualunque cosa si modifica, non va a modificare l'array originale da culi
        //l'abbiamo preso.
        while(default_deck.length > 0){
            let random = Math.floor(Math.random() * default_deck.length);
            this.gameDeck.push(default_deck[random]);
            default_deck.splice(random, 1);
        }
        //for(let i = 0; i < 1000; i++) this.shuffleCards();
        console.log("[Uno.js] Dimensione default deck: " + default_deck.length);
        console.log("[Uno.js] Dimensione ingame deck: " + this.gameDeck.length);
    }

    // shuffleCards(){
    //     let temp_deck = [...this.gameDeck];
    //     this.gameDeck = [];
    //     while(temp_deck.length > 0){
    //         let random = Math.floor(Math.random() * temp_deck.length);
    //         this.gameDeck.push(temp_deck[random]);
    //         temp_deck.splice(random, 1);
    //     }
    // }

    shuffleUsedDeck(){
        let topCard = this.usedDeck[0];
        this.usedDeck.splice(0, 1);
        let temp_deck = [...this.usedDeck];
        this.usedDeck = [];
        this.usedDeck.push(topCard);
        while(temp_deck.length > 0){
            let random = Math.floor(Math.random() * temp_deck.length);
            this.gameDeck.push(temp_deck[random]);
            temp_deck.splice(random, 1);
        }
    }

    //DISTRIBUISCE LE CARTE AI GIOCATORI
    spreadCards(){
        this.players.forEach(pl => {
            while(pl.deck.length < 7){
                pl.deck.push(this.gameDeck[0]);
                this.gameDeck.splice(0, 1);
            }
            console.log("[Uno.js] Carte " + pl.username + ": " + pl.deck.length);
        });
        console.log("[Uno.js] Dimensione ingame deck post spread: " + this.gameDeck.length);
    }

    //METTE UNA CARTA SUL TAVOLO
    putCardOnTable(index, deck){
        if(deck[index].valore === "cambioColore" || deck[index].valore === "+4"){
            if(deck[index].colore == null){
                let colors = ["giallo", "verde", "rosso", "blu"];
                let rand = Math.floor(Math.random() * colors.length);
                deck[index].colore = colors[rand];
            }
        }
        this.usedDeck.unshift(deck[index]);
        deck.splice(index, 1);
        this.sendSocketMsgToAll("ig",
            "cardOnTable:" + this.usedDeck[0].valore + "_" + this.usedDeck[0].colore);
    }


    placeCard(player, cardId, color){
        if(player !== this.getPlayerTurn()) return "Non è il tuo turno.";
        let cardFound = false;
        let cardIndex = null;
        for(let i = 0; i < player.deck.length; i++){
            if(player.deck[i].id === cardId){
                cardFound = true;
                cardIndex = i;
                break;
            }
        }
        if(!cardFound) return "La carta non è stata trovata.";
        let card = player.deck[cardIndex];
        console.log(color);
        if(color != null){
            console.log("colore trovato della carta: " + color);
            if(card.valore !== "cambioColore" && card.valore !== "+4")
                return "La carta selezionata non è speciale.";
            let colors = ["verde", "giallo", "rosso", "blu"];
            let colorFound = false;
            for(let i = 0; i < colors.length; i++){
                if(color === colors[i]){
                    colorFound = true;
                    break;
                }
            }
            if(!colorFound) return "Il colore scelto non è valido";
            card.colore = color;
        }
        let cardOnTable = this.usedDeck[0];
        if(card.colore !== cardOnTable.colore && card.valore !== cardOnTable.valore
            && card.valore !== "+4" && card.valore !== "cambioColore") return "Non puoi piazzare questa carta.";
        player.pickedCard = false;
        this.sendPickStatus(player);
        this.putCardOnTable(cardIndex, player.deck);
        if(player.deck.length === 0){
            this.sendSocketMsgToAll("ig", "removeCard:" + player.username);
            this.announceGameWinner(player);
            return "ok";
        }
        if(card.valore === "cambioGiro")
        {
            if(this.players.length === 2) this.setCurrentTurn(0);
            else{
                this.isClockwiseTurn = !this.isClockwiseTurn;
                this.setCurrentTurn(1);
            }
        }
        else{
            if(card.valore === "stop") this.setCurrentTurn(2);
            else this.setCurrentTurn(1);
        }
        if(card.valore === "+4") this.addCardToPlayer(this.getPlayerTurn(), 4);
        if(card.valore === "+2") this.addCardToPlayer(this.getPlayerTurn(), 2);
        this.sendSocketMsgToAll("ig", "removeCard:" + player.username);
        return "ok";
    }


    pickCard(player){
        if(player !== this.getPlayerTurn()) return "Non è il tuo turno.";
        if(player.pickedCard){
            this.setCurrentTurn(1);
            player.pickedCard = false;
            this.sendPickStatus(player);
        }
        else {
            player.pickedCard = true;
            this.sendPickStatus(player);
            this.addCardToPlayer(player, 1);
            this.setCurrentTurn(0);
        }
        return "ok";
    }

    sendPickStatus(player){
        let currPl = this.getPlayerTurn();
        if(currPl !== player){
            player.socketSession.emit("ig", "pickStatus:wait");
            return;
        }
        player.socketSession.emit("ig", "pickStatus:" + player.pickedCard);
    }

    addCardToPlayer(player, quantity){
        for(let i = 0; i < quantity; i++){
            if(this.gameDeck.length === 0) this.shuffleUsedDeck();
            let card = this.gameDeck[0];
            player.deck.push(card);
            this.gameDeck.splice(0, 1);
            player.socketSession.emit("ig", "addCard:" + player.username + ":"
                + card.id + "_" + card.valore + "_" + card.colore);
            for(let j = 0; j < this.players.length; j++){
                if(this.players[j] === player) continue;
                this.players[j].socketSession.emit("ig", "addCard:" + player.username);
            }
        }
    }

    //INVIO DATI TAVOLO
    setupTable(pl){
        pl.socketSession.emit("ig", "tableSize:" + this.size);
        //setupPlayer:main:<username>:<carte>
        let socketMsg = "setupPlayer:main:" + pl.username;
        pl.deck.forEach(card => {
            socketMsg += ":" + card.id + "_" + card.valore + "_" + card.colore;
        });
        pl.socketSession.emit("ig", socketMsg);

        let i = this.players.indexOf(pl);
        let counter = 0;
        console.log("ORDINE GIOCATORI PER: " + pl.username);
        while(counter <= this.players.length - 1){
            i++;
            if(i >= this.players.length) i = 0;
            if(this.players[i] === pl) break;
            //counter++;
            pl.socketSession.emit(
                "ig", "setupPlayer:other:" + this.players[i].username + ":" + this.players[i].deck.length);
            console.log(this.players[i].username);
        }
        pl.socketSession.emit("ig", "showTable");
        if(this.usedDeck.length !== 0){
            pl.socketSession.emit("ig", "cardOnTable:" + this.usedDeck[0].valore + "_" + this.usedDeck[0].colore);
        }
        if(this.currentTurn !== null)
            pl.socketSession.emit("ig","currentTurn:"+this.getPlayerTurn().username+":"+this.turnTimestamp);
        this.sendPickStatus(pl);
        console.log("WHILE TERMINATO");
    }

    setCurrentTurn(numOfSkips){
        console.log("setTurn chiamato.");
        if(this.igSched !== null) clearTimeout(this.igSched);
        let prevPl = this.getPlayerTurn();
        if(numOfSkips === null) this.currentTurn = 0;
        else{
            if(this.isClockwiseTurn){
                for(let i = 1; i <= numOfSkips; i++){
                    if(this.currentTurn + 1 >= this.players.length) this.currentTurn = 0;
                    else this.currentTurn += 1;
                }
            }
            else{
                for(let i = 1; i <= numOfSkips; i++){
                    if(this.currentTurn - 1 < 0) this.currentTurn = this.players.length - 1;
                    else this.currentTurn -= 1;
                }
            }
        }
        if(this.getPlayerTurn() == null){
            this.setCurrentTurn(1);
            return;
        }
        let currentPl = this.getPlayerTurn();
        if(prevPl != null && prevPl !== currentPl){
            prevPl.pickedCard = false;
            this.sendPickStatus(prevPl);
        }
        console.log(this.currentTurn);
        this.turnTimestamp = Math.floor(Date.now() / 1000) + 30;
        this.igSched = setTimeout(() =>{
            this.setCurrentTurn(1);
        }, 1000 * 30);
        this.sendSocketMsgToAll("ig","currentTurn:"+this.getPlayerTurn().username+":"+this.turnTimestamp);
        this.sendPickStatus(this.getPlayerTurn());
    }

    getPlayerTurn(){
        return this.players[this.currentTurn];
    }

    sendGameInfo(socket){
        if(this.gameState === "waiting" || this.gameState === "starting"){
            let plList = this.getStringPlayerList();
            socket.emit("gw", "init:" + this.id + ":" + this.size + ":" + this.gameState + ":" + plList);
        }
        if(this.gameState === "started"){
            let pl = this.getPlayerByUsername(socket.data.username);
            this.setupTable(pl);
        }
    }

    getStringPlayerList(){
        let plList = "";
        for(let i = 0; i < this.players.length; i++){
            if(i == this.players.length - 1)  plList += this.players[i].username;
            else plList += this.players[i].username + "|";
        }
        return plList;    
    }

    sendSocketMsgToAll(prefix, args){
        for(let i = 0; i < this.players.length; i++){
            let p = this.players[i].socketSession;
            if(p != null) p.emit(prefix, args);
        }
    }

    getPlayerByUsername(username){
        for(let i = 0; i < this.players.length; i++){
            if(this.players[i].username === username) return this.players[i];
        }
        return null;
    }

    removeGame(){
        clearTimeout(this.gwSched);
        clearTimeout(this.igSched);
        for(let i = 0; i < this.players.length; i++){
            this.players[i].socketSession.disconnect();
            this.players[i].httpSession.destroy();
            clearTimeout(this.players[i].removeSched);
        }
        let gameIndex = hosted_games.indexOf(this);
        hosted_games.splice(gameIndex, 1);
        console.log("Gioco rimosso - " + this.id);
    }
}
let create_game = (size, username) =>{
    return new uno_game(size, username);
}

function getGameById(id){
    for(let i = 0; i < hosted_games.length; i++){
        if(hosted_games[i].id === id){
            console.log("getGameById trovato");
            return hosted_games[i];
        } 
    }
    return null;
}

function getHostedGamesLength(){
    return hosted_games.length;
}


/*module.exports = {
    create_game,
    getGameById
}*/
exports.create_game = create_game;
exports.getGameById = getGameById;
exports.getHostedGamesLength = getHostedGamesLength;