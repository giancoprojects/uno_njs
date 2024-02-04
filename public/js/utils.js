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

function blockCardAction(c){
    let elem = document.createElement("p");
    elem.classList.add("cardAction");
    elem.innerText = "🚫";
    c.divComponent.insertAdjacentElement('afterbegin', elem);
    // setTimeout(() =>{
    //     elem.outerHTML = "";
    // }, 2000);

}