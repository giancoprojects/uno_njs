/*let wsUrl;
let ws;*/
let s;

function init(){
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status !== 200) {
                console.log("Errore rilevato.")
                sendNotification("brown","Connessione non riuscita.");
                return;
            }
            console.log("Richiesta avvenuta con successo.");
            sendNotification("green","Connessione avvenuta con successo.");
            init_new_socket(this.responseText);
        }
    };
    xhttp.open("GET", "/api?q=usrInfo");
    xhttp.send();
}

/*function initSocket(param){
    if (window.location.protocol === "http:") wsUrl = "ws://";
    else wsUrl = "wss://";
    ws = new WebSocket(wsUrl + window.location.host + window.location.pathname + "/apiSocket");
    ws.onclose = function (e) {
        console.log(e.code);
        sendNotification("brown", "Connessione con il socket non riuscita. Riprova più tardi.");
    }

    ws.onopen = function () {
        console.log("connessione aperta.");
        console.log("parametri da inviare: " + param);
        ws.send("usrInfo:" + param);
    }

    ws.onmessage = function (e) {
        console.log("Messaggio ricevuto: "+e.data);
        if (e.data === "login:success") {
            console.log("Login accettato.");
            ws.send("gameInfo");
            return;
        }
        if(e.data.includes("gw")){
            manageGameWait(e.data);
            return;
        }
        if(e.data.includes("chat")){
            manageChat(e.data);
            return;
        }
        if(e.data.includes("ig")){
            manageGame(e.data);
            return;
        }
    }
}*/

function init_new_socket(param){
    s = io();
    s.on('connect', () =>{
        console.log("connesso al socket");
        console.log("invio dei parametri.");
        s.emit("usrInfo", param);
    });

    s.on('disconnect', () =>{
        console.log("sei stato disconnesso dal socket.");
        sendNotification("brown", "Sei stato disconnesso dal socket.");
    })

    s.on('error', (arg) =>{
        sendNotification("brown", arg);
    });

    s.on('login:success', () =>{
        console.log("login con il socket avvenuto con successo.");
        sendNotification("green", "Connessione con il socket avvenuta con successo!");
        s.emit("gameInfo");
    });

    s.on("gw", (arg) =>{
        manageGameWait(arg);
    })

    s.on("ig", (arg) =>{
        console.log(arg);
        manageGame(arg);
    })

    s.on("chat", (arg) =>{
        manageChat(arg);
    })

}
init();