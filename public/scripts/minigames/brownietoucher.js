
let bob = 0;
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
    if(cps > 0){
      
      counter.innerText = Number(counter.innerText) + (bob + (cps));
      totalBrownies += (bob + (cps));
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