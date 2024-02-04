let uno = require("./uno.js");

class player{
    constructor(username, unique_id, game_id, httpSession){
        this.username = username;
        this.unique_id = unique_id;
        this.game_id = game_id;
        this.httpSession = httpSession;
        this.socketSession = null;
        this.removeSched = null;
        this.deck = [];
        this.pickedCard = false;
    }
    setSocketSession(socket){
        if(this.socketSession != null) this.socketSession.disconnect(true);
        this.socketSession = socket;
    }
    schedulePlayerRemove(game){
        console.log("Programmato rimozione giocatore.");
        if(game === null) return;
        this.removeSched = setTimeout(() => {
            game.remove_player(this);
        }, 5000);
    }
}



let create_player = (username, unique_id, game_id, httpSession) =>{
    return new player(username, unique_id, game_id, httpSession);
}

/*module.exports = {
    create_player
}*/
exports.create_player = create_player;