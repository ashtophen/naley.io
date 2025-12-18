const roundCounter = document.getElementById('round');
const questionDisplay = document.getElementById('question');
var players = [];
socket.on('playersUpdate', (newplayers) => {
    players = newplayers;
})

socket.on('gamestart', () => {
    roundCounter.innerText = 'Round 1';
    questionDisplay.innerText;

});

socket.on('answersubmit', () => {

});

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(M)
}