let express = require('express');
let session = require('express-session');
let uno = require('./uno.js');
let cards = require('./cards.js');
let { createServer } = require("http");
const { connect } = require('http2');
let { Server } = require("socket.io");
let path = require('path');
let utils = require('./utils.js');


let app = express();
let httpServer = createServer(app);

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile); //installare con npm i --save ejs
app.set('view engine', 'html');

//GESTIRE LE SESSIONI
app.use(session({
    secret: "Zi7ylVv09U",
    resave: false,
    saveUninitialized: true,
}));

//PARSARE I PARAMETRI POST
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let io = new Server(httpServer);
io.on("connection", (socket) =>{

    socket.on("usrInfo", (arg) =>{
        //VALORI: <unique_id>:<username><cod_partita>
        if(arg == null) return;
        if(typeof arg != "string") return;
        console.log("parametri usrInfo ricevuti: " + arg);
        let splArgs = arg.split(":");
        let game = uno.getGameById(splArgs[2]);
        if(game === null){
            console.log("GAME NON TROVATO");
            socket.emit("error", "Game non trovato.");
            socket.disconnect(true);
            return;
        }
        let pl = game.getPlayerByUsername(splArgs[1]);
        if(pl === null){
            console.log("PLAYER NON TROVATO");
            socket.emit("error", "Player non trovato.");
            socket.disconnect(true);
            return;
        }
        if(pl.unique_id !== splArgs[0]){
            console.log("UNIQUE ID NON CORRISPONDENTE");
            socket.emit("error", "I dati inviati non corrispondono.");
            console.log("Dati prima della disconnessione: " + socket.data.username + ":" + socket.data.game_id);
            socket.disconnect(true);
            return;
        }
        if(pl.removeSched !== null){
            console.log("SCHEDULE REMOVE TROVATO. CANCELLO LO SCHEDULE.")
            clearTimeout(pl.removeSched);
        }
        pl.setSocketSession(socket);
        socket.data.game_id = splArgs[2];
        socket.data.username = splArgs[1];
        pl.socketSession.emit("login:success");
        console.log("LOGIN ACCETTATO");
    });

    socket.on("gameInfo", () =>{
        let game = uno.getGameById(socket.data.game_id);
        if(game === null){
            socket.emit("error", "gameInfo: Game non trovato.");
            socket.disconnect(true);
            return;
        }
        game.sendGameInfo(socket);
    });

    socket.on("placeCard", (arg, callback) =>{
        if(arg == null) return;
        if(typeof arg != "string") return;
        let game = uno.getGameById(socket.data.game_id);
        if(game === null){
            socket.emit("error", "Game non trovato.");
            socket.disconnect(true);
            return;
        }
        let pl = game.getPlayerByUsername(socket.data.username);
        if(pl === null){
            socket.emit("error", "Player non trovato.");
            socket.disconnect(true);
            return;
        }
        let argSplitted = arg.split(":");
        let color = null;
        if(argSplitted.length === 2) color = argSplitted[1];
        console.log(color);
        console.log(arg);
        if(callback != null) callback(game.placeCard(pl, parseInt(argSplitted[0]), color));
    });


    socket.on("pickCard", (callback) =>{
        let game = uno.getGameById(socket.data.game_id);
        if(game === null){
            socket.emit("error", "Game non trovato.");
            socket.disconnect(true);
            return;
        }
        let pl = game.getPlayerByUsername(socket.data.username);
        if(pl === null){
            socket.emit("error", "Player non trovato.");
            socket.disconnect(true);
            return;
        }
        if(callback != null) callback(game.pickCard(pl));
    });

    socket.on("chat", (arg) =>{
        if(arg == null) return;
        if(typeof arg != "string") return;
        console.log("Argomento passato in chat: " + arg);
        //if(arg !== String) return;
        let game = uno.getGameById(socket.data.game_id);
        if(game === null){
            socket.emit("error", "Game non trovato.");
            socket.disconnect(true);
            return;
        }
        let pl = game.getPlayerByUsername(socket.data.username);
        if(pl === null){
            socket.emit("error", "Player non trovato.");
            socket.disconnect(true);
            return;
        }
        game.sendSocketMsgToAll("chat", socket.data.username + ":" + arg);
    });

    socket.on("disconnect", () =>{
        console.log("utente disconnesso: " + socket.id);
        console.log(socket.data.game_id + ":" + socket.data.username);
        let game = uno.getGameById(socket.data.game_id);
        if(game === null) return;
        let pl = game.getPlayerByUsername(socket.data.username);
        if(pl === null) return;
        pl.schedulePlayerRemove(game);
    });
    console.log("utente connesso: " + socket.id);
});


app.route("/api")
    .get((req, resp) =>{
        if(req.query.q === "hostedGames"){
            resp.send(uno.getHostedGamesLength().toString());
            return;
        }

        if(!req.session.username || !req.session.game_id){
            console.log("utente non loggato");
            resp.sendStatus(401);
            return;
        }
        if(req.query.q === "usrInfo"){
            console.log("richiesta usrInfo ricevuta.");
            resp.send(req.session.unique_id + ":" + req.session.username + ":" + req.session.game_id);
            return;
        }
        if(req.query.q === "deckAssets"){
            console.log("richiesta deckAssets ricevuta.");
            resp.send(utils.sendDeckAssets());
            return;
        }
        console.log("nessun parametro inserito");
        resp.sendStatus(401);
    })
    .post((req, resp) =>{
        resp.send("POST non consentito.");
    })



app.route("/entra")
    .get((req, resp) =>{
        error = null;
        resp.render("entra", {error});
    })
    .post((req, resp) =>{
        error = null;
        if(!req.body.username || !req.body.code){
            error = "Username o codice non inserito.";
            resp.render("entra", {error});
            return;
        }
        if(utils.badUsername(req.body.username)){
            error = "Caratteri consentiti: Lettere/Numeri/Underscore.";
            resp.render("entra", {error});
            return;
        }
        let game = uno.getGameById(req.body.code);
        if(game === null){
            error = "Partita non trovata.";
            resp.render("entra", {error});
            return;
        }
        if(game.gameState !== "waiting"){
            error = "Partita iniziata.";
            resp.render("entra", {error});
            return;
        }
        if(game.getPlayerByUsername(req.body.username) !== null){
            error = "Username già in uso.";
            resp.render("entra", {error});
            return;
        }
        console.log("vengo eseguito");
        let u_id = utils.generateRandomString(10);
        req.session.username = req.body.username;
        req.session.game_id = game.id;
        req.session.unique_id = u_id;
        console.log(req.session.username + ":" + req.session.game_id);
        game.add_player(req.body.username, u_id, req.session);
        resp.redirect("/game");
    });

    

app.route("/game")
    .get((req, resp) =>{
        if(!req.session.username || !req.session.game_id){
            resp.redirect("/entra");
            return;
        }
        resp.render("game");
    })
    .post((req, resp) =>{
        resp.send("POST non consentito.");
    });

app.route("/crea")
    .get((req,resp) =>{
        error = null;
        resp.render("crea", {error});
    })
    .post((req, resp) =>{
        error = null;
        if(!req.body.username || !req.body.nGiocatori){
            error = "Compila i campi richiesti.";
            resp.render("crea", {error});
            return;
        }
        if(utils.badUsername(req.body.username)){
            error = "Caratteri consentiti: Lettere/Numeri/Underscore.";
            resp.render("crea", {error});
            return;
        }
        //QUI BISOGNA APPLICARE ULTERIORI CONTROLLI
        let u_id = utils.generateRandomString(10);
        game = uno.create_game(req.body.nGiocatori, req.body.username);
        req.session.unique_id = u_id;
        req.session.username = req.body.username;
        req.session.game_id = game.id;
        game.add_player(req.body.username, u_id, req.session);
        resp.redirect("/game");
    });



app.use(express.static("public"));
httpServer.listen(3000);
console.log("UNO GAME [NodeJS Edition]");
console.log("Made by: Giangio");
console.log("Per problemi: @Scioccolato <- Telegram");
cards.createDefaultDeck();
utils.generateDeckAssets();