let ingame_music = new Audio("audio/ingame_music.mp3");
ingame_music.volume = 0.5;
ingame_music.loop = true;

let uno_audio = new Audio("audio/uno.mp3");
let card_audio = new Audio("audio/card.mp3");

let musicEnabled, audioEnabled;

function setup(){
    let settingsAudioElem = document.getElementById("settings_audio");
    let settingsMusicElem = document.getElementById("settings_music");
    if(getCookie("settings_audio") === "") {
        settingsAudioElem.classList.add("enabled");
        audioEnabled = true;
    } else{
        let val = getCookie("settings_audio");
        settingsAudioElem.classList.add(val);
        audioEnabled = (val === "enabled");
    }
    if(getCookie("settings_music") === ""){
        settingsMusicElem.classList.add("enabled");
        musicEnabled = true;
    } else{
        let val = getCookie("settings_music");
        settingsMusicElem.classList.add(val);
        musicEnabled = (val === "enabled");
    }
    // let checkPromise = new Audio().play();
    // if(checkPromise !== undefined){
    //     console.log("[Audio] Condizione diverso da undefined verificato.");
    //     checkPromise.then(_ =>{
    //         console.log("[Audio] Prima interazione impostata.");
    //         firstInteraction = true;
    //         playMusic();
    //     }).catch(error =>{
    //         console.log("[Audio] Prima interazione necessaria per abilitare l'audio.");
    //         document.onclick = () =>{
    //             console.log("[Audio] Prima interazione ricevuta tramite click.");
    //             firstInteraction = true;
    //             playMusic();
    //             document.onclick = null;
    //         }
    //     });
    //     firstInteraction = true;
    //     playMusic();
    // }
}

function toggleAudio(){
    let settingsAudioElem = document.getElementById("settings_audio");
    if(audioEnabled){
        settingsAudioElem.classList.remove("enabled");
        settingsAudioElem.classList.add("disabled");
        setCookie("settings_audio", "disabled", 365);
        audioEnabled = false;
    } else{
        settingsAudioElem.classList.remove("disabled");
        settingsAudioElem.classList.add("enabled");
        setCookie("settings_audio", "enabled", 365);
        audioEnabled = true;
    }
}

function toggleMusic(){
    let settingsMusicElem = document.getElementById("settings_music");
    if(musicEnabled){
        settingsMusicElem.classList.remove("enabled");
        settingsMusicElem.classList.add("disabled");
        setCookie("settings_music", "disabled", 365);
        musicEnabled = false;
        stopMusic();
    } else{
        settingsMusicElem.classList.remove("disabled");
        settingsMusicElem.classList.add("enabled");
        setCookie("settings_music", "enabled", 365);
        musicEnabled = true;
        playMusic();
    }
}

function playMusic(){
    if(musicEnabled) ingame_music.play();
}

function stopMusic(){
    if(!musicEnabled) ingame_music.pause();
}

function playUnoAudio(){
    if(firstInteraction && audioEnabled){
        uno_audio.currentTime = 0;
        uno_audio.play();
    }
}

function playCardAudio(){
    if(firstInteraction && audioEnabled){
        card_audio.currentTime = 0;
        card_audio.play();
    }
}

setup();
