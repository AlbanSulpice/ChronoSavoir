class ChatHistory{
    constructor(){
        this.message=[];
    }

    addMessage(message){
        this.message.push(message);
    }

    getHistory(){
        return this.message;
    }
}

const chatHistory = new ChatHistory();

// Il s'agit d'un écouteur d'événements qui permet d'envoyer le message au chatbot avec la touche entrée
document.getElementById('user-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();  // Empêche le comportement par défaut de la touche Enter
        document.getElementById('button-chat-box').click();
    }
});

//Fonction pour récupérer et traiter le JSON
function fetchJSON(url) {
    // Récupérer le JSON à partir de l'URL fournie
    fetch(url)
        //then est une méthode qui retourne une promesse et prend en paramètre une
        //fonction callback qui sera exécutée une fois la promesse résolue
        .then(response => {
            // Vérifier si la réponse est correcte
            if (!response.ok) {
                // Si la réponse n'est pas correcte, lancer une erreur
                throw new Error('Network response was not ok');
            }
            // Si la réponse est correcte, retourner le JSON
            return response.json();
        })
        //then ici permettra de récupérer le JSON retourné par la promesse
        .then(data => {
            // Vérifier si le JSON est vide ou mal formé
            if (Object.keys(data).length === 0 && data.constructor === Object) {
                // Si le JSON est vide ou mal formé, lancer une erreur
                throw new Error('Empty JSON or malformed JSON');
            }
            //On affiche le JSON dans la console. Il s'agit d'un objet contenant les
            // intentions du chatbot
            console.log(data.intents);
            sendMessage(data.intents);
        })
        //catch est une méthode qui retourne une promesse et prend en paramètre une
        //fonction callback qui sera exécutée en cas d’erreur
        .catch(error => {
            // En cas d’erreur, afficher un message d’erreur dans la console
            console.error("There was a problem with the fetch operation:", error);
        }) ;
}

function sendMessage(intents) {
    let userinput = document.getElementById('user-input').value;
    showMessage(userinput,"user")
    chatHistory.addMessage({ type: "user", message: userinput });
    let botresponse = processMessage(intents, userinput);
    showMessage(botresponse, "bot");
    chatHistory.addMessage({ type: "bot", message: botresponse });
    document.getElementById("user-input").value = '';
}

function showMessage(message, type){
    if((type!=="user")&&(type!=="bot")){
        console.error("No such type");
    }
    // Récupère le div du chat
    let chatBox = document.getElementById("chat-box");

    // Crée un nouvel élément de paragraphe
    let messageParagraph = document.createElement("p");

    // Définit le contenu du paragraphe en fonction du type de message
    if (type === "bot") {
        messageParagraph.innerHTML = "Bot : " + message;
    } else if (type === "user") {
        messageParagraph.innerHTML = "User : " + message;
    }
    // Ajoute le nouveau paragraphe au chatBox
    chatBox.appendChild(messageParagraph);
}

// Fonction pour traiter le message de l'utilisateur
function processMessage(intents, message) {
    let response = "Je suis désolé, je ne suis pas sûr de comprendre.";
    intents.forEach(intent => {
        // Vérifier si le message de l'utilisateur correspond à l'un des motifs
        intent.patterns.forEach(pattern => {
            // Vérifier si le message de l'utilisateur contient le motif
            if (message.toLowerCase().includes(pattern.toLowerCase())) {
                // Sélectionner une réponse aléatoire parmi les réponses possibles
                response = intent.responses[Math.floor(Math.random() * intent.responses.length)];
            }
        });
    });
    //Retourner la réponse
    return response;
}

window.addEventListener('beforeunload', () => {
    sessionStorage.setItem('chatHistory', JSON.stringify(chatHistory.getHistory()));
});

// Charger les messages de la session du navigateur au chargement de la page
window.addEventListener('load', () => {
    const savedHistory = sessionStorage.getItem('chatHistory');
    if (savedHistory) {
        const messages = JSON.parse(savedHistory);
        showMessage("",'site');
        messages.forEach(msg => showMessage(msg.message, msg.type));
        messages.forEach(msg => chatHistory.addMessage(msg));
    }
});

