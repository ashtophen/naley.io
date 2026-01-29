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
  }

  function tick(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    counterNum = Number(counter.innerText); // updating counter Num every frame here.
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;
      fractionalCounter += (bps * deltaTime) / 1000;
      lifetimeTotal += (bps * deltaTime) / 1000;
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
    let fullPurchases = Array.from(upgrades).map(upgrade => {
      return {
          // Get the specific text from child elements
          amount: upgrade.querySelector(".amount-purchased").innerText.trim(),
          name: upgrade.querySelector(".upgrade-name")?.innerText || "Unknown",
          cost: upgrade.querySelector(".upgrade-cost")?.innerText
      };
  });
    saveInfo = 
      {
        bps: bps,
        fullPurchases: fullPurchases,
        lifetimeTotal: lifetimeTotal,
        fractionalCounter: fractionalCounter
      }
    localStorage.setItem("saveData", JSON.stringify(saveInfo));
    console.log((fullPurchases)); 
}
  function loadSave(){
    let i = 0;
    if (localStorage.getItem("saveData") === null){return};
    let saveData = JSON.parse(localStorage.getItem("saveData"));
    bps = saveData.bps;
    lifetimeTotal = saveData.lifetimeTotal;
    fractionalCounter = saveData.fractionalCounter;
    upgrades.forEach(upgrade => {
      const upgradeName = upgrade.getElementsByClassName("upgrade-name")[0];
	    const amountPurchased = upgrade.getElementsByClassName("amount-purchased")[0];
	    const upgradeCost = upgrade.getElementsByClassName("upgrade-cost")[0]; 
      amountPurchased.innerText = saveData.fullPurchases[i].amount;
      upgradeName.innerText = saveData.fullPurchases[i].name;
      upgradeCost.innerText = saveData.fullPurchases[i].cost;

      i++;

    })
    return saveData;
  }


  function clickBrownie(event){
    const clickX = event.clientX;
	  const clickY = event.clientY;
	  const brownieImg = document.createElement('img');
	  const amountDisp = document.createElement('div');
	
	 addBrownies(clickAdd);
  }

  function gameStart(){
    if (localStorage.getItem("saveData")){
      loadSave();
    }
    requestAnimationFrame(tick);
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

document.addEventListener("DOMContentLoaded", (event) => {
  gameStart();
  setInterval(autoSave, 60000);
});