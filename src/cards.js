let default_deck = [];


class Card{
    constructor(valore, colore, isSpecial){
        this.valore = valore;
        this.colore = colore;
        this.isSpecial = isSpecial;
        this.id = null;
    }
}

function createDefaultDeck(){
    let colors = ["verde", "giallo" , "rosso", "blu"];
    //CARTE NUMERICHE
    for(let i = 0; i < 10; i++){
        colors.forEach(c => {
            if(i !== 0) default_deck.push(new Card(i.toString(), c, false));
            default_deck.push(new Card(i.toString(), c, false));
        });
    }
    //CARTE STOP
    for(let i = 0; i < 2; i++){
        colors.forEach(c => {
            default_deck.push(new Card("stop", c, false));
        });
    }
    //CARTE CAMBIO GIRO
    for(let i = 0; i < 2; i++){
        colors.forEach(c => {
            default_deck.push(new Card("cambioGiro", c,  false));
        });
    }
    //CARTE +2
    for(let i = 0; i < 2; i++){
        colors.forEach(c => {
            default_deck.push(new Card("+2", c, false));
        });
    }
    //CARTE +4
    for(let i = 0; i < 4; i++){
        default_deck.push(new Card("+4", null, true));
    }
    //CARTE CAMBIO COLORE
    for(let i = 0; i < 4; i++){
        default_deck.push(new Card("cambioColore", null, true));
    }
    //IMPOSTO ID PER OGNI CARTA
    default_deck.forEach(card => {
        card.id = default_deck.indexOf(card);
    });
    console.log("[Cards.js] Mazzo default generato.");
    console.log("[Cards.js] Dimensioni mazzo: " + default_deck.length);
}

function getDefaultDeck(){
    return default_deck;
}

exports.createDefaultDeck = createDefaultDeck;
exports.getDefaultDeck = getDefaultDeck;