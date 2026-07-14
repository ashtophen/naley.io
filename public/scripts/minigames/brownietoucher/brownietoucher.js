//const { json } = require("stream/consumers");

let cps = 0; //clicks per second
let fractionalCounter = 0; // this is the true counter.
let purchaseAmount = 1;
let lifetimeTotal = 0; //total number of brownies ever earned
let clickAdd = 1; //amount of brownies a single click adds (This is self explanatory why did I even add a description to this, like come on man figure it out.)
const counter = document.getElementById("counter"); // this counter displays whole numbers only
const upgrades = document.querySelectorAll(".upgrade");
let counterNum;
let data = [];
let advancements = [];
let achievements = [];
//const popupDetails = document.getElementById("popup-details")
let start = false;
const advancementList = document.getElementById('advancements-list');

const popup = document.getElementById("infoPopup");
const popupDescription = document.getElementById("popup-description");
const popupDetails = document.getElementById('popup-details');
const popupTitle = document.getElementById('popup-title');

// OOOO HERES THAT GLOBAL TRACKING YOU WANTED SO BAD YOU F***ING F*****
let advancementsPurchased = [];
let achievementsGained = [];
let upgradesPurchased = [];
//oooo ahhh
//tick variables
let bps = 0; //brownies per second (NOT INCLUDING CLICKS)
let lastTimestamp = 0; // used to set as timestamp

const unlockedAdvList = document.getElementById("unlocked-advancements");
const unlockedStructList = document.getElementById("unlocked-structures");
const unlockedAchieveList = document.getElementById("unlocked-achievements");


/**
 * 
 * @param {string} item - name of unlocked achievement, advancement, or upgrade
 * @param {array} list - list it belongs in ex. (upgradesPurchased)
 */
function updateUnlocks(item, list){
  let adv = document.createElement("div");
  adv.classList.add('advancement');
    if (list == advancementsPurchased){
    list.push(item);
    adv.style.backgroundColor = "white";
    adv.id = item || "oh_no";
   [...unlockedAdvList.children].forEach(adv => {
    if (adv.dataset.name === item){
      adv.style.backgroundImage = `url(${advancements.find(advancement => advancement.name === `${item}`).icon || "./images/oh_no.png"})`;
      adv.onmouseover = function() {
        popup.style.display = "block";
        popupDescription.innerText = `${adv.dataset.description || "whoopsie, I failed to load that"}`;
        popupTitle.innerText = `${adv.dataset.name || "oh_no"}`;
    
      }
      adv.onmouseout = function() {
        popup.style.display = "none";
        popupDescription.innerText = "";
        popupTitle.innerText = "";
      }
      adv.addEventListener('mousemove', (event) => {
        popupDetails.innerHTML = ``;
        popup.style.top = `${event.clientY - 60}px`;
        popup.style.left = `${event.clientX}`;
    });
    }});
  }
}

//ts is so f*cking stupid man. You should have just made it a module.
async function loadAllJson(){
  data = await loadData('./scripts/minigames/brownietoucher/upgrades.json');
  advancements = await loadData('./scripts/minigames/brownietoucher/advancements.json');
  achievements = await loadData('./scripts/minigames/brownietoucher/achievements.json');
  propagateGameData();

  advancementList.childNodes.forEach(advancement => {
    const advancementData = advancements.find(advancementInfo => advancementInfo.name === `${advancement.id}`)
    advancement.onclick = function() {
      if (fractionalCounter >= Number(advancementData.cost)){
        subtractBrownies(Number(advancementData.cost));
        updateUnlocks(advancementData.name, advancementsPurchased);
        advancement.remove();
      }
      
    };
    advancement.onmouseover = function() {
      popup.style.display = "block";
      popupDescription.innerText = `${advancementData?.description || "whoopsie, I failed to load that"}`;
      popupTitle.innerText = `${advancement.id || "oh_no"}`;
  
    }
    advancement.onmouseout = function() {
      popup.style.display = "none";
      popupDescription.innerText = "";
      popupTitle.innerText = "";
    }
    advancement.addEventListener('mousemove', (event) => {
      popupDetails.innerHTML = `Costs <p style="color: red; -webkit-text-stroke: 2px black; paint-order: stroke fill">${advancementData?.cost || "oh_no"}</p>`
      popup.style.top = `${event.clientY - 60}px`;
  });
  })
}

loadAllJson();

function propagateGameData(){
  advancements.forEach(advancement => {
    let icon = document.createElement('div');
    icon.classList.add('advancement');
    icon.style.backgroundImage = `url(${advancement.icon || "./images/oh_no.png"})`
    icon.style.backgroundColor = "white";
    advancementList.appendChild(icon);
    icon.id = advancement.name || "oh_no";
    let bob = document.createElement('div');
    bob.classList.add('advancement');
    bob.style.backgroundColor = "white";

    bob.style.backgroundImage = `url(./scripts/minigames/brownietoucher/images/mono-question-mark.svg)`;
    unlockedAdvList.appendChild(bob);
    bob.dataset.name = advancement.name;
    bob.dataset.description = advancement.description;

  });
}



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
      //if (multiplier == 1){ multiplier = 1}
      totalCost = nextSingleCost * ((1 - Math.pow(multiplier, n)) / (1 - multiplier));
      upgradeCost.innerText = Math.ceil(totalCost);
    });
      
  }else{return//fix this later
  }
}

 async function loadData(path) {
  let oop = [] //temp data
    try {
      const response = await fetch(path); // Fetch the file
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      oop = await response.json(); // Parse the JSON data into a JS object
      // console.log(oop); // Use the data
      return oop;
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


// !!! CAUTION: TICK() OPTIMIZED ENTIRELY USING AI SLOP. YEAH I KNOW I SHOULDN'T HAVE BUT IM SO LAZY, AND IT WORKED
// IF I EVER HAVE TO CHANGE THIS FUNCTION I MIGHT SOB.
// PLEASE GOD LET IT BE OK.
// IT DID NOT WORK, AI IS USELESS PLEASE NEVER USE IT AGAIN.


let lastFloorCounter = -1; // math.floor value
let lastBpsValue = -1; //should be the same as floor? but also ai so idk.

function tick(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  const deltaTime = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  // 1. Core game math (Super fast in memory)
  fractionalCounter += (bps * deltaTime) / 1000;
  lifetimeTotal += (bps * deltaTime) / 1000;
  const currentFloorCounter = Math.floor(fractionalCounter);

  // 2. ONLY update the counter DOM if the whole number actually changed
  if (currentFloorCounter !== lastFloorCounter) {
    counter.innerText = currentFloorCounter.toLocaleString();
    lastFloorCounter = currentFloorCounter;
  }

  // 3. ONLY update BPS DOM if the value changed
  if (bps !== lastBpsValue) {
    document.getElementById("bps").innerText = bps;
    lastBpsValue = bps;
  }

  // 4. Optimized Upgrade Loop
  upgrades.forEach(upgrade => {
    // CACHE elements on the upgrade object itself if they don't exist yet
    // This avoids slow getElementsByClassName calls every single frame!
    if (!upgrade._cachedElements) {
      upgrade._cachedElements = {
        name: upgrade.getElementsByClassName("upgrade-name")[0],
        amountText: upgrade.getElementsByClassName("amount-purchased")[0],
        costText: upgrade.getElementsByClassName("upgrade-cost")[0]
      };
    }
    
    const cache = upgrade._cachedElements;
    const currentOwned = Number(cache.amountText.innerText);
    const upgradeTo = getUpgrade(cache.name.innerText);
    
    if (!upgradeTo) return;

    // Fast math
    const baseCost = upgradeTo.baseCost;
    const multiplier = upgradeTo.multiplier;
    const n = purchaseAmount;
    const nextSingleCost = baseCost * Math.pow(multiplier, currentOwned);
    //console.log(typeof(currentOwned)) CULPRIT!!!
    const totalCost = Math.ceil(nextSingleCost * ((1 - Math.pow(multiplier, n)) / (1 - multiplier)));
    // ONLY write the text if the cost is different (saves rendering cycles)
    if (Number(cache.costText.innerText) !== totalCost) {
      cache.costText.innerText = totalCost;
    }
    //console.log(typeof(currentFloorCounter));
    // Toggle classList using a boolean condition (avoids slow if/else logic)
    const isUnpurchasable = totalCost > currentFloorCounter;
    //console.log({isUnpurchasable, totalCost, currentFloorCounter});
    //console.log(isUnpurchasable)
    upgrade.classList.toggle('unpurchasable', isUnpurchasable);
  });
  requestAnimationFrame(tick);
}

  function save(manual) {
    if (manual) {
     //let notification = document.getElementById("notification");
     //notification.style.display = 'block';
     //notification.style.position = 'fixed';
     notificationGenerator('saving...');
    }else{notificationGenerator('autosaving...');};
    //console.log("autosaving...");
    let saveInfo = [];
    let upgradesPurchased = Array.from(upgrades).map(upgrade => {
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
        upgradesPurchased: upgradesPurchased,
        lifetimeTotal: lifetimeTotal,
        fractionalCounter: fractionalCounter,
        advancementsPurchased: advancementsPurchased,
        achievementsGained: achievementsGained
      }
    localStorage.setItem("saveData", JSON.stringify(saveInfo));
    console.log((saveInfo)); 
}
  function loadSave(){
    let i = 0;
    if (JSON.parse(localStorage.getItem("saveData")) === "null" || JSON.parse(localStorage.getItem("saveData")) === null){
      bps = 0;
      lifetimeTotal = 0;
      fractionalCounter = 0;
      //console.log("oh");

      return;
    }; 
    let saveData = JSON.parse(localStorage.getItem("saveData"));
    bps = saveData.bps;
    lifetimeTotal = saveData.lifetimeTotal;
    fractionalCounter = saveData.fractionalCounter;
    try {
      upgrades.forEach(upgrade => {
        if (!saveData.upgradesPurchased || !saveData.upgradesPurchased[i]){
          throw new SaveDataMismatchError(`Missing save data for upgrade index ${i}`);
          return;
        }
        //console.log('ow');
        const upgradeName = upgrade.getElementsByClassName("upgrade-name")[0];
        const amountPurchased = upgrade.getElementsByClassName("amount-purchased")[0];
        const upgradeCost = upgrade.getElementsByClassName("upgrade-cost")[0]; 
        amountPurchased.innerText = saveData.upgradesPurchased[i].amount;
        upgradeName.innerText = saveData.upgradesPurchased[i].name;
        upgradeCost.innerText = saveData.upgradesPurchased[i].cost * purchaseAmount;
  
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
    if (JSON.parse(localStorage.getItem("saveData")) !== null){
      console.log("wow");
      loadSave();
    }
    requestAnimationFrame(tick);
  }


upgrades.forEach(upgrade => {
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
      if (!upgradesPurchased.includes(upgradeName.innerText)){ upgradesPurchased.push(upgradeName.innerText)};
			amountPurchased.innerText = Number(amountPurchased.innerText) + purchaseAmount;
			if(Number(amountPurchased.innerText > 0)){
				bps += (getUpgrade(upgradeName.innerText).baseAdd * purchaseAmount);
			}
			//upgradeCost.innerText = Math.ceil(getUpgrade(upgradeName.innerText).baseCost * Math.pow(getUpgrade(upgradeName.innerText).multiplier, Number(amountPurchased.innerText)) * purchaseAmount);
		}
		

	};
	upgrade.onmouseover = function() {
		popup.style.display = "block";

	}
	upgrade.onmouseout = function() {
		popup.style.display = "none";
    popupDescription.innerText = "";
    popupTitle.innerText = "";
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
    // ...No.
    popupDetails.innerHTML = `Adds <p style="color: red; -webkit-text-stroke: 2px black; paint-order: stroke fill">${upgradeDetails.baseAdd}</p> bps per each`
    popup.style.top = `${event.clientY - 60}px`;
});
});

document.addEventListener("DOMContentLoaded", (event) => {
  gameStart();
  setInterval(save, 60000);
});