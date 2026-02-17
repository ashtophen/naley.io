const suggestionBox = document.getElementById("suggestion-box");
const notecard = document.getElementById("notecard");
const notecardModal = document.getElementById("notecardmodal");
const submitSuggestion = document.getElementById("suggestion-submit");

suggestionBox.onclick = function(){
    flyUp();

};

submitSuggestion.onclick = function(){
    flyDown();
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
