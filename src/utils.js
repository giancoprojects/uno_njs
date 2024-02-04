const fs = require('fs');

let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
let badChars = "!@#$%&*()'+,-./:;<=>?[]^`{|} ";
let deckAssets = [];


function generateRandomString(length){
    let rdmStr = "";
    for(let i = 0; i < length; i++){
        let rdmIndex = Math.floor(Math.random() * chars.length);
        rdmStr += chars.charAt(rdmIndex);
    }
    return rdmStr;
}

function badUsername(username){
    for(let i = 0; i < chars.length; i++){
        if(username.includes(badChars[i])) return true;
    }
    return false;
}

function generateDeckAssets(){
    let fPath = "./public/imgs/deck";
    fs.readdir(fPath, (err, files) => {
        if (err) {
            console.error('Errore durante la lettura della cartella:', err);
            return;
        }
        files.forEach(f => {
            deckAssets.push(f);
        });
    }); 
}

function sendDeckAssets(){
    return deckAssets;
}

exports.generateRandomString = generateRandomString;
exports.badUsername = badUsername;
exports.generateDeckAssets = generateDeckAssets;
exports.sendDeckAssets = sendDeckAssets;