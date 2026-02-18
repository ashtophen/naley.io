const suggestionBox = document.getElementById("suggestion-box");
const notecard = document.getElementById("notecard");
const notecardModal = document.getElementById("notecardmodal");
const submitSuggestion = document.getElementById("suggestion-submit");
const suggestionMessage = document.getElementById("suggestion-message");

suggestionBox.onclick = function(){
    flyUp();

};

submitSuggestion.onclick = function(){
    sendDataToServer(suggestionMessage.value);
    flyDown();
    notecard.addEventListener('animationend', function() {
        suggestionMessage.value = "";
    })
}

notecardModal.onclick = function(){
    flyDown();
    console.log("OW!");
}

function flyUp(){
    if(notecard.classList.contains("down")){
        notecard.classList.remove("down");
        void notecard.offsetWidth;
    }
    notecard.classList.add("up");
    notecard.focus();
    notecardModal.style.display = "block";
    submitSuggestion.style.display = "block";

}

function flyDown(){
    notecard.classList.remove("up");
    void notecard.offsetWidth;
    notecard.classList.add("down");
    notecardModal.style.display = "none";
    submitSuggestion.style.display = "none";
}

async function sendDataToServer(data) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({suggestion: data})
    };
    const response = await fetch('/api-endpoint', options);
    const result = await response.json();
    console.log(result);
}
// Example usage:
// sendDataToServer({ message: 'Hello Node.js server!' })