
let cps = 0; //clicks per second
let bps = 0; //brownies per second (NOT INCLUDING CLICKS)
let purchaseAmount = 1;
let lifetimeTotal = 0; //total number of brownies ever earned
let clickAdd = 1; //amount of brownies a single click adds (This is self explanatory why did I even add a description to this, like come on man figure it out.)
const counter = document.getElementById("counter");
const upgrades = document.querySelectorAll(".upgrade");
var data = [];
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

  function tick(){
    // counter.innerText = Number(counter.innerText) +
    if(bps > 0){
      
      counter.innerText = Number(counter.innerText) + (bps);
      lifetimeTotal += (bps);
      //bob = (Math.ceil(bob + (cps / 10)));
    }
  }
  function autoSave() {
    let fullString = "";
    console.log("autosaving...");
    upgrades.forEach(upgrade => {
      const amountPurchased = upgrade.getElementsByClassName("amount-purchased")[0];
      fullString = fullString.concat(amountPurchased.innerText, ",");
      if (fullString[fullString.length-1] === ","){
        fullString = fullString.slice(0, -1);
      }
      console.log(fullString);
    });
  }
  
  function clickBrownie(event){
    const clickX = event.clientX;
	  const clickY = event.clientY;
	  const brownieImg = document.createElement('img');
	  const amountDisp = document.createElement('div');
	
	 counter.innerText = Math.floor(Number(counter.innerText) + clickAdd);

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
			counter.innerText = Math.ceil((Number(counter.innerText) - (Number(upgradeCost.innerText) * purchaseAmount)));
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
setInterval(() => {
  tick();
}, 1000);