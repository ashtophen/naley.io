//const { json } = require("stream/consumers");

let cps = 0; //clicks per second
let fractionalCounter = 0; // this is the true counter.
let purchaseAmount = 1;
let lifetimeTotal = 0; //total number of brownies ever earned
let clickAdd = 1; //amount of brownies a single click adds (This is self explanatory why did I even add a description to this, like come on man figure it out.)
const counter = document.getElementById("counter"); // this counter displays whole numbers only
const upgrades = document.querySelectorAll(".upgrade");
let counterNum;
var data = [];
//tick variables
let bps = 0; //brownies per second (NOT INCLUDING CLICKS)
let lastTimestamp = 0; // used to set as timestamp
data = loadData();

 async function loadData() {
    try {
      const response = await fetch('./scripts/minigames/upgrades.json'); // Fetch the file
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      data = await response.json(); // Parse the JSON data into a JS object
      console.log(data); // Use the data
      return data;
    } catch (error) {
      console.error('Error fetching JSON:', error);
    }
  }


 function getUpgradeDescription(upgradeToFind) {

    const foundUpgrade = data.find(upgrade => upgrade.name ===`${upgradeToFind}`);
  if  (foundUpgrade) { return foundUpgrade.description;
  } else {
    return null;
  }
}

  function getUpgradeCost(upgradeToFind) {

    const foundUpgrade  = data.find(upgrade => upgrade.name ===`${upgradeToFind}`);
    if  (foundUpgrade) { return foundUpgrade.baseCost * foundUpgrade.multiplier; // Add amount purchased here later
    } else {
      return null;
  }
}

  function getUpgradeAdd(upgradeToFind){
    const foundUpgrade  = data.find(upgrade => upgrade.name ===`${upgradeToFind}`);
    if  (foundUpgrade) { return Math.floor(foundUpgrade.baseAdd * foundUpgrade.multiplier); // Add amount purchased here later
    } else {
      return null;
  } 
  }
  //num is to be added
  function addBrownies(num){
    fractionalCounter += num;
    lifetimeTotal += num;
    console.log(fractionalCounter);
  }
  //num is to be subtracted
  function subtractBrownies(num){
    fractionalCounter -= num;
    lifetimeTotal -= num;
  }

  function tick(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    counterNum = Number(counter.innerText); // updating counter Num every frame here.
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
      fractionalCounter += (bps * deltaTime) / 1000;

      counter.innerText = Math.floor(fractionalCounter);
    
    requestAnimationFrame(tick);
  }
    //My old way of doing it, adds the total bps once a second.
    /*if(bps > 0){
      counter.innerText = Number(counter.innerText) + (bps);
      lifetimeTotal += (bps);
      document.getElementById("title").innerText = counter.innerText + " Brownies";
    }*/

  function autoSave() {
    console.log("autosaving...");
    let saveInfo = [];
    // Convert NodeList to Array, map to innerText values, and join with commas
    // Yes this method usage is kinda disgusting and I did get it from AI I ADMIT IT.
    let fullPurchases = Array.from(upgrades)
        .map(upgrade => upgrade.getElementsByClassName("amount-purchased")[0].innerText)
        .join(",");
      if(fullPurchases.endsWith(",")){fullPurchases = fullPurchases.slice(0, -1);}
    saveInfo = [
      {
        purchases: fullPurchases,
        lifetimeTotal: lifetimeTotal
      }
    ]
    localStorage.setItem("saveData", JSON.stringify(saveInfo));
    console.log(fullPurchases); 
}
  function loadSave(){
    if (localStorage.getItem("saveData") === null){return};
    let saveData = JSON.parse(localStorage.getItem("saveData"));
    return saveData.purchases;
  }


  function clickBrownie(event){
    const clickX = event.clientX;
	  const clickY = event.clientY;
	  const brownieImg = document.createElement('img');
	  const amountDisp = document.createElement('div');
	
	 addBrownies(clickAdd);

	  lifetimeTotal += clickAdd;
  }




upgrades.forEach(upgrade => {
	const popup = document.getElementById("infoPopup");
	const upgradeName = upgrade.getElementsByClassName("upgrade-name")[0];
	const amountPurchased = upgrade.getElementsByClassName("amount-purchased")[0];
	const upgradeCost = upgrade.getElementsByClassName("upgrade-cost")[0];
	let hiddenText = "";
	if(hiddenText === ""){
		hiddenText = upgradeName.innerText;
		upgradeName.innerText = "???";}
	setInterval(() => {
	if (lifetimeTotal < (Number(upgradeCost.innerText) / 5)){
		// console.log(hiddenText);
	} else {upgradeName.innerText = hiddenText;}
	}, 100);
	upgrade.onclick = function() {
		if (Number(counter.innerText) >= Number(upgradeCost.innerText) * purchaseAmount){
			subtractBrownies(Number(upgradeCost.innerText) * purchaseAmount);
			amountPurchased.innerText = Number(amountPurchased.innerText) + purchaseAmount;
			if(Number(amountPurchased.innerText > 0)){
				bps += getUpgradeAdd(upgradeName.innerText);
			}
			upgradeCost.innerText = Math.ceil(getUpgradeCost(upgradeName.innerText) * Number(amountPurchased.innerText));
		}
		

	};
	upgrade.onmouseover = function() {
		popup.style.display = "block";

	}
	upgrade.onmouseout = function() {
		popup.style.display = "none";
	}
	upgrade.addEventListener('mousemove', (event) => {
    // Use clientX and clientY for coordinates relative to the browser window
    // event.pageX and event.pageY can be used for coordinates relative to the whole document
	// popup.style.top  = `${upgrade.getBoundingClientRect().top - 60}px`;
	
	  popup.innerText = `${getUpgradeDescription(upgradeName.innerText)}`
     popup.style.top = `${event.clientY - 60}px`;
});
});
requestAnimationFrame(tick);