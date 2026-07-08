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
//oooo ahhh
//tick variables
let bps = 0; //brownies per second (NOT INCLUDING CLICKS)
let lastTimestamp = 0; // used to set as timestamp
data = loadData();

class SaveDataMismatchError extends Error {
  constructor(message) {
    super(message);
    this.name = "SaveDataMismatchError";
  }
}

function purchaseAmountChange(newAmount){
  if (newAmount !== "max"){
    purchaseAmount = newAmount;

    upgrades.forEach(upgrade => {
      const upgradeName = upgrade.getElementsByClassName("upgrade-name")[0];
	    const amountPurchased = upgrade.getElementsByClassName("amount-purchased")[0];
      const upgradeCost = upgrade.getElementsByClassName("upgrade-cost")[0]; 
      const name = upgradeName.innerText;
      const currentOwned = Number(amountPurchased.innerText);
      const upgradeTo = getUpgrade(name);
      const baseCost = upgradeTo.baseCost;
      const multiplier = upgradeTo.multiplier;
      const n = purchaseAmount;

      const nextSingleCost = baseCost * Math.pow(multiplier, currentOwned);

      let totalCost = 0;

      totalCost = nextSingleCost * ((1 - Math.pow(multiplier, n)) / (1 - multiplier));
      upgradeCost.innerText = Math.ceil(totalCost);
    });
      
  }else{return//fix this later
  }
}

 async function loadData() {
    try {
      const response = await fetch('./scripts/minigames/brownietoucher/upgrades.json'); // Fetch the file
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

/**
 * 
 * @param {string} upgradeToFind - The name of the upgrade you are looking for
 * @returns {Object} - Upgrade object; key/value pairs
 */
  function getUpgrade(upgradeToFind) {
    const foundUpgrade = data.find(upgrade => upgrade.name ===`${upgradeToFind}`);
    if (!foundUpgrade){return null
    } else {
      return foundUpgrade
    }
  }
/**
 * 
 * @param {String} notificationText - The Text You Want To Pass
 * @returns {} - nothing you dumb bitch
 */
  function notificationGenerator(notificationText) {
    let notification = document.createElement('div');
    notification.classList.add('popup');
    notification.id = crypto.randomUUID();
    notification.innerText = notificationText;
    document.body.appendChild(notification);
   // make notification element
   // pass notification to the notificationHandler
   notificationHandler(notification)
  }

let notificationQueue = [];
/**
 * 
 * @param {HTMLElement} notification - Somethin'
 */
  function notificationHandler(notification) {
    if (notificationQueue.length == 0){
      notificationQueue.push(notification);
    } else {
      for (let index = 0; index < notificationQueue.length; index++) {
        const element = notificationQueue[index];
        notificationShiftUp(element);
      }
      notificationQueue.push(notification);
    }
    console.log(notificationQueue)
    notification.style.display = "block"
    notificationAnimation(notification)
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
      counter.innerText = Math.floor(fractionalCounter).toLocaleString();
      document.getElementById("bps").innerText = bps;
    //add all the stuff that needs to be modified every frame based on number of brownies here.
    upgrades.forEach(upgrade => {
      //console.log(Math.floor(fractionalCounter))
      const upgradeName = upgrade.getElementsByClassName("upgrade-name")[0];
      const amountPurchased = upgrade.getElementsByClassName("amount-purchased")[0];
      const upgradeCost = upgrade.getElementsByClassName("upgrade-cost")[0]; 
        const name = upgradeName.innerText;
        const currentOwned = Number(amountPurchased.innerText);
        const upgradeTo = getUpgrade(name);
        const baseCost = upgradeTo.baseCost;
        const multiplier = upgradeTo.multiplier;
        const n = purchaseAmount;
  
        const nextSingleCost = baseCost * Math.pow(multiplier, currentOwned);
  
        let totalCost = 0;
  
        totalCost = nextSingleCost * ((1 - Math.pow(multiplier, n)) / (1 - multiplier));
        upgradeCost.innerText = Math.ceil(totalCost);
      
      if (Number(upgradeCost.innerText) > Math.floor(fractionalCounter)){
        upgrade.classList.add('unpurchasable');
        //console.log("ow")
      } else { upgrade.classList.remove('unpurchasable')}
    });

    requestAnimationFrame(tick);
  }
    //My old way of doing it, adds the total bps once a second.
    /*if(bps > 0){
      counter.innerText = Number(counter.innerText) + (bps);
      lifetimeTotal += (bps);
      document.getElementById("title").innerText = counter.innerText + " Brownies";
    }*/

  function save(manual) {
    if (manual) {
     //let notification = document.getElementById("notification");
     //notification.style.display = 'block';
     //notification.style.position = 'fixed';
     notificationGenerator('saving...');
    }else{notificationGenerator('autosaving...');};
    //console.log("autosaving...");
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
    if (localStorage.getItem("saveData") === "null" || localStorage.getItem("saveData" === null)){
      bps = 0;
      lifetimeTotal = 0;
      fractionalCounter = 0;
      return;
    };
    let saveData = JSON.parse(localStorage.getItem("saveData"));
    bps = saveData.bps;
    lifetimeTotal = saveData.lifetimeTotal;
    fractionalCounter = saveData.fractionalCounter;
    try {
      upgrades.forEach(upgrade => {
        if (!saveData.fullPurchases || !saveData.fullPurchases[i]){
          throw new SaveDataMismatchError(`Missing save data for upgrade index ${i}`);
          return;
        }
        const upgradeName = upgrade.getElementsByClassName("upgrade-name")[0];
        const amountPurchased = upgrade.getElementsByClassName("amount-purchased")[0];
        const upgradeCost = upgrade.getElementsByClassName("upgrade-cost")[0]; 
        amountPurchased.innerText = saveData.fullPurchases[i].amount;
        upgradeName.innerText = saveData.fullPurchases[i].name;
        upgradeCost.innerText = saveData.fullPurchases[i].cost * purchaseAmount;
  
        i++;
  
      }) 
    } catch (error) {
      if (error instanceof SaveDataMismatchError) {
        console.warn("Save file version mismatch handled:", error.message);
      } else {
        throw error;
      }
    }
    return saveData;
  }


  function clickBrownie(event){
    const flairWidth = 64
    const flairHeight = 64
    const clickX = event.clientX;
	  const clickY = event.clientY;
    const clickFlair = document.createElement('div');
	  const brownieImg = document.createElement('img');
	  const amountDisp = document.createElement('div');
    clickFlair.classList.add('click-flair');
    clickFlair.style.height = flairHeight + "px";
    clickFlair.style.width = flairWidth + "px";
    brownieImg.style.maxHeight = "50%";
    brownieImg.src = "./images/oh_no.png";
    clickFlair.appendChild(brownieImg);
    clickFlair.appendChild(amountDisp);
    clickFlair.style.position = 'absolute';
    amountDisp.style.position = 'relative';
    amountDisp.style.top = `${getRandomIntInclusive(-70, -30)}%`;
    amountDisp.style.left = `${getRandomIntInclusive(40, 50)}%`;
    amountDisp.style.fontSize = "64px";
    amountDisp.style.color = "yellow";
    amountDisp.style.webkitTextStroke = "2px black";
    clickFlair.style.pointerEvents = "none";
    clickFlair.style.left = (clickX - flairWidth / 2) + "px";
    clickFlair.style.top = (clickY - flairHeight / 2) + "px";
    amountDisp.textContent = `+`+ clickAdd;
    document.body.appendChild(clickFlair);
    fadeBounceOut(clickFlair);
	  addBrownies(clickAdd);
  }

  async function notificationShiftUp(element) {
    if (!element) return;

    //Read the previous target Y position from the dataset (default to 0 if it's the first shift)
    const currentY = parseFloat(element.dataset.targetY) || 0;

    //Measure the physical height of the element plus your desired gap
    const elementHeightWithGap = element.offsetHeight + 8;
    
    const newY = currentY - elementHeightWithGap;

    element.dataset.targetY = newY;

    
    element.animate([
      { transform: `translate(-20%, ${currentY}px)` },
      { transform: `translate(-20%, ${newY}px)` }
    ], {
      duration: 200,
      fill: 'forwards'
    });
}


  async function notificationAnimation(element) {
    const slideSpeed = 500;
    const slideDistance = 80; //will be made into viewport width
    element.display = 'block';
    element.style.position = 'fixed';
    element.style.top = '88%'
    const slideIn = element.animate([
      { transform: 'translateX(105%)'},
      { opacity: 1, transform: `translateX(-20%)`, easing: 'cubic-bezier(0.15, 0.85, 0.3, 1)' }
    ], {
      duration: 200,
      fill: 'forwards'
    });

    await slideIn.finished;

    await new Promise(resolve => setTimeout(resolve, 1000));

    const fadeOut = element.animate([
      {opacity: 1},
      {opacity: 0}
    ], { duration: 1000, fill: 'forwards'});

    await fadeOut.finished;

    element.remove();
    notificationQueue = notificationQueue.filter(item => item !== element);
  }

  async function fadeBounceOut(element) {
    const randomX = getRandomIntInclusive(-200, 200);
    const randomYUp = getRandomIntInclusive(-200, 100);
    const randomYDown = getRandomIntInclusive(-100,-50);
    
    const animation = element.animate([
      { opacity: 1, transform: 'translate(0, 0)' },
      { opacity: 0, transform: `translate(${randomX / 2}px, ${randomYUp}px)`, easing: 'cubic-bezier(0.15, 0.85, 0.3, 1)' }
      // { opacity: 0, transform: `translate(${randomX}px, ${randomYDown}px)`, easing: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)' }
    ], {
      duration: 500,
      fill: 'forwards'
    });
  
    await animation.finished;
    
    // Clean up exactly this element instead of wiping out active instances
    element.remove(); 
  }

  function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  function gameStart(){
    if (localStorage.getItem("saveData")){
      loadSave();
    }
    requestAnimationFrame(tick);
  }


upgrades.forEach(upgrade => {
	const popup = document.getElementById("infoPopup");
  const popupDescription = document.getElementById("popup-description");
  const popupDetails = document.getElementById('popup-details');
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
		if (fractionalCounter >= Number(upgradeCost.innerText)){
			subtractBrownies(Number(upgradeCost.innerText));
			amountPurchased.innerText = Number(amountPurchased.innerText) + purchaseAmount;
			if(Number(amountPurchased.innerText > 0)){
				bps += getUpgrade(upgradeName.innerText).baseAdd;
			}
			//upgradeCost.innerText = Math.ceil(getUpgrade(upgradeName.innerText).baseCost * Math.pow(getUpgrade(upgradeName.innerText).multiplier, Number(amountPurchased.innerText)) * purchaseAmount);
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
    let upgradeDetails = getUpgrade(upgradeName.innerText)
    if (getUpgrade(upgradeName.innerText) == null){
      popupDescription.innerText = "???"
    } else { popupDescription.innerText = `${getUpgrade(upgradeName.innerText).description}` }
    // popupDetails.innerText = `Currently Making: ${upgradeDetails.name} Percentage Of Total: ${2}%`
    // ADD SOME KIND OF GLOBAL STAT TRACKING I BEG OF YOU 
    popup.style.top = `${event.clientY - 60}px`;
});
});

document.addEventListener("DOMContentLoaded", (event) => {
  gameStart();
  setInterval(save, 60000);
});