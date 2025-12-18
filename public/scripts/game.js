const roundCounter = document.getElementById('round');
const questionDisplay = document.getElementById('question');
var currRound = 1;
allSubmitted = false;
socket.on('playersUpdate', (playersall) => {
    console.log(playersall);
    playerinfo = playersall;
})

socket.on('gamestart', () => {
    roundCounter.innerText = `Round ${currRound}`;
    questionDisplay.innerText;

});

if(allSubmitted){
    currRound ++;
    socket.emit('roundchange', currRound);
    allSubmitted = false;
}

socket.on('answersubmit', () => {

});

function randomItem(array, arraylength){
	let randIndex = Math.floor(Math.random() * arraylength);
	return array[randIndex];
}

//question logic

function getQuestion(){
    var randPlayerTop = randomItem(playerinfo, playerinfo.length);
    console.log(randPlayerTop);
    return JSON.parse(randPlayerTop.spotifyinfo)[0].id;
}