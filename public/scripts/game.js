const roundCounter = document.getElementById('round');
const questionDisplay = document.getElementById('question');
var currRound = 1;
var playercount = 0;
var logic = [];
var difficulty = 1;
allSubmitted = false;
let submittedPlayers = new Set();
socket.on('playersUpdate', (playersall) => {
    console.log(playersall);
    playerinfo = playersall;
    playercount = playerinfo.length;
    playerinfo.forEach(player => {player.score = 0});

})

socket.on('gamestart', () => {
    roundCounter.innerText = `Round ${currRound}`;
    logic = getQuestions(isTrivia);
    questionDisplay.innerText = logic.question;
    socket.emit("roundOptions", logic.options);

});



socket.on('answerSubmit', (answer, uuid) => {
    if (submittedPlayers.has(uuid)) return; 
    submittedPlayers.add(uuid);
    const scorer = playerinfo.find(p => p.uuid === uuid);
    if (scorer && answer === logic.answer) {
        scorer.score += (1 * logic.difficulty);
    }
    if (submittedPlayers.size >= playercount){
        submittedPlayers.clear();
        currRound ++;
        console.log("allsubmitted")
        socket.emit('roundchange', currRound);
        roundCounter.innerText = `Round ${currRound}`;
        logic = getQuestions(isTrivia);
        questionDisplay.innerText = logic.question;
        socket.emit("roundOptions", logic.options);
    }

});

function randomItem(array){
	let randIndex = Math.floor(Math.random() * array.length);
	return array[randIndex];
}

//question logic

function getQuestions(modeint){
    var x = Math.floor(Math.random() * 5);
    var randPlayer = randomItem(playerinfo);
    var playerNames = playerinfo.map(player => player.name);
    if(typeof playerinfo?.randPlayer?.spotifyinfo === 'undefined'){
        var songId = null;
        var topSong = null;}
    else{

        var songId = JSON.parse(randPlayer.spotifyinfo)[x].id;
        var topSong = JSON.parse(randPlayer.spotifyinfo)[0].id;
    };
    var roundLogic = [
        {
            question: "Which Player Has This Song In Their Top 5 This Month?",
            options: playerNames,
            answer: randPlayer.name,
            id: songId,
            mode: ["songs"],
            difficulty: 1
        },
        {
            question: "Who Is The Coolest?",
            options: playerNames.concat("Nathen The Cool"),
            answer: "Nathen The Cool",
            id: null,
            mode: ["songs", "trivia"],
            difficulty: 0
        },
        {
            question: "Who's Number One Song is This?",
            options: playerNames,
            answer: randPlayer.name,
            id: topSong,
            mode: ["songs"],
            difficulty: 2
        },
        {
            question: "I Picked A Player. Who Is It?",
            options: playerNames,
            answer: randPlayer.name,
            id: null,
            mode: ["songs", "trivia"],
            difficulty: 0

        },
        {
            question: "What Is President Garfields Blood Type?",
            options: ["blue", "O-Negative", "A", "lemon"],
            answer: ("O-Negative"),
            id: null,
            mode: ["trivia"],
            difficulty: 1

        },
        {
            question: `Which Place Is This Song in ${randPlayer.name}'s Top 5 Of This Month?`,
            options: ["1", "2", "3", "4", "5"],
            answer: (x + 1),
            id: songId,
            mode: ["songs"],
            difficulty: 1

        }
    ];

    
    // console.log(randPlayerTop);

    //return top;
    if (modeint == 0) {
        const result = roundLogic.filter(round => round.mode.includes('songs'));
        return randomItem(result);
    }
    if (modeint == 1) {
        const result = roundLogic.filter(round => round.mode.includes("trivia"));
        return randomItem(result);
    }
    return randomItem(roundLogic);

    
}