let cps = 0; //clicks per second
let fractionalCounter = 0; // this is the true counter.
let purchaseAmount = 1;
let lifetimeTotal = 0; //total number of brownies ever earned
let clickAdd = 1; //amount of brownies a single click adds (This is self explanatory why did I even add a description to this, like come on man figure it out.)
const counter = document.getElementById("counter"); // this counter displays whole numbers only
const upgrades = document.querySelectorAll(".upgrade");

let structures = [];
let advancements = [];
let achievements = [];

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

const lockedImgPath = './scripts/minigames/brownietoucher/images/mono-question-mark.svg';

let notificationQueue = [];

let lastFloorCounter = -1;
let lastBpsValue = -1;

function updateUnlocks(){}

async function loadJson(){
    structures = await loadData('./scripts/minigames/brownietoucher/upgrades.json');
    advancements = await loadData('./scripts/minigames/brownietoucher/advancements.json');
    achievements = await loadData('./scripts/minigames/brownietoucher/achievements.json');
} 

function propagateGameData(){}

class SaveDataMismatchError extends Error {
  constructor(message) {
    super(message);
    this.name = "SaveDataMismatchError";
  }
}

function purchaseAmtChg(newAmt){}

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

function tick(timestamp){}

function save(man){}

function loadSave(){}


//called on brownie click
function clickBrownie(e){}

async function notificationShiftUp(element){}

//previously called notificationAnimation
async function notificationEnter(element){}

//animation flair for clicking the brownie
async function fadeBounceOut(element){}

//previously getRandomIntInclusive
function getRanIntInc(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

function gameStart(){}

document.addEventListener("DOMContentLoaded", (event) => {
    gameStart();
    setInterval(save, 60000);
  });