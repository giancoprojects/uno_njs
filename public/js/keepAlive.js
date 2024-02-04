function ka(){
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status !== 200) {
                console.log("Errore rilevato.")
                sendNotification("brown","Connessione non riuscita.");
                return;
            }
            if(this.responseText === "null"){
                console.log("[K.A] Impossibile aggiornare il k.a (Sessione non presente.)");
                return;
            }
            if(this.responseText.includes("error")){
                console.log("[K.A] Errore rilevato: " + this.responseText.split(":")[1]);
                return;
            }
            console.log("[K.A] KeepAlive aggiornato.");
            setTimeout(ka, 1000 * 10);
        }
    };
    xhttp.open("GET", "/uno/keepAlive");
    xhttp.send();
}
ka();