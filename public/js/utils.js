let firstInteraction = false;
function sendNotification(color, message){
    if(document.getElementsByClassName("notification")[0] != null)
        document.getElementsByClassName("notification")[0].remove();
    let msg = '<div class="notification" style="background:' + color + '"><h3>Attenzione</h3><p>' + message + '</p></div>';
    document.getElementById("body").insertAdjacentHTML("afterbegin", msg);
    setTimeout(function(){
        let elem = document.getElementsByClassName("notification")[0];
        if(elem != null) elem.remove();
    }, 5000);
}
function openSettings(){
    document.getElementById("settings").removeAttribute("class");
}

function closeSettings(){
    document.getElementById("settings").classList.add("closed");
}

function setFirstInteraction(){
    firstInteraction = true;
    document.getElementById("firstDiv").classList.add("closed");
    playMusic();
}


function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}