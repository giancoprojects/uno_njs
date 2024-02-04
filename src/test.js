const fs = require('fs');
const path = require('path');

const folderPath = './public/imgs/deck'; // Imposta il percorso della cartella delle immagini

function kitemmurt(){
    // Legge il contenuto della cartella
fs.readdir(folderPath, (err, files) => {
    if (err) {
        console.error('Errore durante la lettura della cartella:', err);
        return;
    }

    // Filtra solo i file con estensione immagine (puoi personalizzare questo filtro)
    const imageFiles = files.filter(file => /\.(png|jpg|jpeg|gif)$/i.test(file));

    // Visualizza l'elenco delle immagini
    imageFiles.forEach(image => {
        const imagePath = path.join(folderPath, image);
        console.log('Path dell\'immagine:', imagePath);
        // Puoi fare ulteriori operazioni con il percorso dell'immagine qui
    });
});
}
exports.kitemmurt = kitemmurt;

