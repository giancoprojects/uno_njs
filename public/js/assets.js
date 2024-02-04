let assetsNames = [];

function getAssets(){
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status !== 200) {
                console.log("Errore rilevato.")
                sendNotification("brown","Download degli assets non riuscito.");
                return;
            }
            console.log("Lista di assets ricevuta con successo.");
            assetsNames = JSON.parse(this.responseText);
            downloadAssetsNew(0);
        }
    };
    xhttp.open("GET", "/api?q=deckAssets");
    xhttp.send();
}

function downloadAssets(files){
    let status = document.getElementById("assetsStatus");
    files.forEach(f => {
        let img = new Image();
        img.src = "imgs/deck/" + f;
        img.onload = () =>{
            console.log(img.src + "caricato.");
        }
        status.innerText = img.src;
    });
    status.style.color = "green";
    status.innerText = "Download completato!";
    setTimeout(() =>{
        document.getElementById("assetsDownloader").outerHTML = "";
    }, 5000);
}

function downloadAssetsNew(index){
    let status = document.getElementById("assetsStatus");
    if(index === assetsNames.length){
        status.style.color = "green";
        status.innerText = "Download completato!";
        setTimeout(() =>{
            document.getElementById("assetsDownloader").outerHTML = "";
        }, 5000);
        return;
    }
    let img = new Image();
    img.src = "imgs/deck/" + assetsNames[index];
    status.innerText = img.src;
    img.onload = () =>{
        downloadAssetsNew(index + 1);
    };
}

getAssets();