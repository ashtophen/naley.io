
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
    if  (foundUpgrade) { return foundUpgrade.base-cost * amountPurchased.innerText;
    } else {
      return null;
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