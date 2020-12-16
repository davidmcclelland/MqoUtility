// ==UserScript==
// @name           MQO Utility
// @namespace      https://github.com/davidmcclelland/
// @author         Dave McClelland <davidmcclelland@gmail.com>
// @version        1.0.0
// @include        http://www.midenquest.com/Game.aspx
// @include        http://midenquest.com/Game.aspx
// @license        LGPL-2.1
// @grant          GM_addStyle
// @grant          unsafeWindow
// @noframes
// ==/UserScript==

const sleep = m => new Promise(r => setTimeout(r, m));

if (unsafeWindow.MqoUtility === undefined) {
  unsafeWindow.MqoUtility = {};
}

const ButtonBar = (() => {
  const displayHtml = `<div id="MqoUtilityButtons" style="margin-top: 5px;"></div>`;

  const displayStyle = `
  #MqoUtilityButtons > input {
    text-align: center;
    font-size: 13px;
    height: 30px;
    width: auto;
    align-self: center;
    border: 1px solid #00000088;
    border-radius: 5px;
    font-weight: bold;
    font-family: Helvetica;
  }
  `

  const addToButtonBar = (elemStr) => {
    $('#MqoUtilityButtons').append(elemStr);
  }

  $(document).ready(() => {
    GM_addStyle(displayStyle);
    $('#TitleEmbedded').remove();
    $('#ZoneContent').prepend(displayHtml);
  });

  unsafeWindow.MqoUtility.ButtonBar = { addToButtonBar };
})();

const ChestOpener = (() => {
  const openChestHtml = `<input type="button" class="gmButtonMed" value="Chests" onclick="MqoUtility.ChestOpener.openAllChests()">`;
  const openBagHtml = `<input type="button" class="gmButtonMed" value="Bags/Keys" onclick="MqoUtility.ChestOpener.openBagsAndKeys()">`;

  const bronzeChestId = '#btnOpenChest2';
  const silverChestid = '#btnOpenChest3';
  const goldChestId = '#btnOpenChest4';

  const keyId = '#btnOpen';
  const resBagId = '#btnOpenResBag';

  const keepOpeningChest = (btnId) => {
    return $(btnId).length && ($(btnId)[0].style.display !== 'none');
  };

  const openAllChestsOfType = async (btnId) => {
    let btnLength = keepOpeningChest(btnId);
    while (btnLength) {
      $(btnId).click();
      await sleep(500);
      btnLength = keepOpeningChest(btnId);
    }
  }

  const openAllChests = async () => {
    sendRequestContentFill('getNavigation.aspx?screen=2&gambling=1');
    await sleep(500);

    await openAllChestsOfType(goldChestId);
    await openAllChestsOfType(silverChestid);
    await openAllChestsOfType(bronzeChestId);
  };

  const openBagsAndKeys = async () => {
    await openAllChests();
    await openAllChestsOfType(keyId);
    await openAllChestsOfType(resBagId);
  }

  $(document).ready(() => {
    unsafeWindow.MqoUtility.ButtonBar.addToButtonBar(openChestHtml);
    unsafeWindow.MqoUtility.ButtonBar.addToButtonBar(openBagHtml);
  });

  unsafeWindow.MqoUtility.ChestOpener = { openAllChests, openBagsAndKeys };
})();

const Market = (() => {
  const dealButtonHtml = `<input type="button" class="gmButtonMed" value="Deals" onclick="MqoUtility.Market.purchaseDailyDeals()">`;
  const marketButtonHtml = `<input type="button" class="gmButtonMed" value="Market" onclick="MqoUtility.Market.goToMarket()">`;

  const purchaseDailyDeals = async () => {
    sendRequestContentFill('getNavigation.aspx?screen=2&market=1');
    await sleep(500);
    for (let buyIndex = 1; buyIndex <= 5; ++buyIndex) {
      const buyButton = $('#btnBuy' + buyIndex);
      if (buyButton.length) {
        buyButton.click();
        await sleep(500);
      }
    }
  }

  const goToMarket = () => {
    sendRequestContentFill(`getMarket.aspx?null=`);
  }

  $(document).ready(() => {
    unsafeWindow.MqoUtility.ButtonBar.addToButtonBar(dealButtonHtml);
    unsafeWindow.MqoUtility.ButtonBar.addToButtonBar(marketButtonHtml);
  });

  unsafeWindow.MqoUtility.Market = { purchaseDailyDeals, goToMarket };
})();

const Perks = (() => {
  const DrunkButtonId = '#btnActivatePerk21';
  const EnragedButtonId = '#btnActivatePerk22';
  const LuckyButtonId = '#btnActivatePerk23';
  const PitiedButtonId = '#btnActivatePerk24';
  const HoarderButtonId = '#btnActivatePerk25';
  const desiredPerks = [DrunkButtonId, EnragedButtonId, LuckyButtonId, PitiedButtonId, HoarderButtonId];

  const perkHtml = `<input type="button" class="gmButtonMed" value="Perks" onclick="MqoUtility.Perks.addPerks()">`;

  const addPerk = async (btnId, numTimes) => {
    $(btnId).click();
    await sleep(250);
    for (let clickCounter = 0; clickCounter < numTimes; ++clickCounter) {
      $('#btnActivateOre').click();
      await sleep(250);
    }
  }

  const addPerks = async () => {
    sendRequestContentFill('getInfoPerk.aspx?');
    await sleep(500);

    // Each click is 2 hours, so multiply number of days by 12
    const clicksPerPerk = Number(prompt('How many days of perks would you like to add?', '5')) * 12;
    for (let perkCounter = 0; perkCounter < desiredPerks.length; ++perkCounter) {
      await addPerk(desiredPerks[perkCounter], clicksPerPerk);
    }
  }

  $(document).ready(() => {
    unsafeWindow.MqoUtility.ButtonBar.addToButtonBar(perkHtml);
  });

  unsafeWindow.MqoUtility.Perks = { addPerks };
})();

const BulkSell = (() => {
  const bulkSellHtml = `<input type="button" class="gmButtonMed" value="Bulk Sell" onclick="MqoUtility.BulkSell.toggleSelling()">`;
  let bulkSellButton = null;
  let bulkSellInterval = null;

  const startSelling = () => {
    bulkSellButton.style.backgroundColor = '#d63031';
    bulkSellInterval = setInterval(() => {
      sendRequestContentFill('getCustomize.aspx?bulk=1&bulks=14&bulkq=4&bulke=1&confirmbs=1&null=');
    }, 1000);
  }

  const stopSelling = () => {
    bulkSellButton.style.backgroundColor = '#ffffff';
    clearInterval(bulkSellInterval);
    bulkSellInterval = null;
  }

  const toggleSelling = () => {
    if(bulkSellInterval) {
      stopSelling();
    } else {
      startSelling();
    }
  }

  $(document).ready(() => {
    bulkSellButton = $(bulkSellHtml)[0];
    unsafeWindow.MqoUtility.ButtonBar.addToButtonBar(bulkSellButton);
  });

  unsafeWindow.MqoUtility.BulkSell = { toggleSelling };
})();

const Kingdom = (() => {
  const maintainKingdomHtml = `<input type="button" class="gmButtonMed" value="KD Food" onclick="MqoUtility.Kingdom.maintainKingdomFood()">`;

  const maintainKingdomFood = () => {
    sendRequestContentFill('getKingdom.aspx?action=maintain&null=');
  }

  $(document).ready(() => {
    unsafeWindow.MqoUtility.ButtonBar.addToButtonBar(maintainKingdomHtml);
  });

  unsafeWindow.MqoUtility.Kingdom = { maintainKingdomFood };
})();

const Runes = (() => {
  const combineRunesHtml = `<input type="button" class="gmButtonMed" value="Runes" onclick="MqoUtility.Runes.createRune()">`;
  const lastRuneLevelKey = 'mqoUtilityLastRuneLevel';

  const combineRunesOfLevel = async () => {
    sendRequestContentFill('getRuneUpgrade.aspx');
    await sleep(500);

    const runeLevel = prompt('What level of rune would you like to combine (entered as the string name)?', 'two');
    const buttonId = `#dex_rune_${runeLevel}_btn`;
    while (true) {
      const dexButton = $(buttonId);
      dexButton.click();
      await sleep(10000);
      const combineButton = $('#btnUpgrade');
      if (combineButton.length) {
        combineButton.click();
        await sleep(3000);
      } else {
        break;
      }
    }
  }

  const countRunesOfLevel = (level) => {
    // Set up the regex to be used on each option to find the value of the item.
    const rgxLevel = / lv. (\d+)/i;
    let skip = false;
    let count = 0;
    $('#SelectItemSource').find('option').each((index, element) => {
      if (element.text == "---Rune to upgrade---") {
        // Ignore all of the runes for a while because they are the equipped runes. Keep skipping the runes until we see the
        // option/label that denotes the "real" runes are starting next.
        skip = true;
        return true;
      }

      if (skip) {
        if (element.text == "---Inventory Runes---") {
          skip = false;
        }

        return true;
      }

      var result = rgxLevel.exec(element.text);
      if (result != null) {
        var valueInt = parseInt(result[1], 10);
        if (valueInt == level) {
          count++;
          return true;
        }
      } else {
        // This entry does not have a value associated with it. It is probably one of the section headers or spacer lines.
      }
    });
    return count;
  }

  const createRune = async () => {
    sendRequestContentFill('getRuneUpgrade.aspx');
    await sleep(500);
	const defaultRuneLevel = unsafeWindow.localStorage.getItem(lastRuneLevelKey) || 15;
    const targetRuneLevel = Number(prompt('What level of rune would you like to make?', defaultRuneLevel));
    if (targetRuneLevel) {
	  unsafeWindow.localStorage.setItem(lastRuneLevelKey, targetRuneLevel);
      createRuneOfLevel(targetRuneLevel);
    }
  }

  const createRuneOfLevel = async (targetRuneLevel) => {
    let sourceRuneLevel = targetRuneLevel - 1;
    let sacrificedRuneLevel = targetRuneLevel - 6;
    switch (targetRuneLevel) {
      case 1:
        return;
      case 2:
        return;
      case 3:
        sourceRuneLevel = 1;
        sacrificedRuneLevel = 1;
        break;
      case 4:
        sourceRuneLevel = 3;
        sacrificedRuneLevel = 1;
        break;
      case 5:
        sourceRuneLevel = 3;
        sacrificedRuneLevel = 3;
        break;
      case 6:
        sourceRuneLevel = 4;
        sacrificedRuneLevel = 4;
        break;
    }
    const amountNeeded = (sourceRuneLevel === sacrificedRuneLevel) ? 2 : 1;
    while (countRunesOfLevel(sourceRuneLevel) < amountNeeded) {
      if ((sourceRuneLevel === 1) || (sourceRuneLevel === 2)) {
        alert('Not enough level 1 or 2 runes available to continue!');
        throw 'Not enough level 1 or 2 runes available to continue!';
      }
      await createRuneOfLevel(sourceRuneLevel);
    }

    while (countRunesOfLevel(sacrificedRuneLevel) < amountNeeded) {
      await createRuneOfLevel(sacrificedRuneLevel);
    }
    const sourceRuneCount = countRunesOfLevel(sourceRuneLevel);
    const sacrificedRuneCount = countRunesOfLevel(sacrificedRuneLevel);
    if ((amountNeeded > sourceRuneCount) || (amountNeeded > sacrificedRuneCount)) {
      alert('Not enough runes are available to continue');
      throw `Not enough runes available. sourceRuneLevel: ${sourceRuneLevel}, sacrificedLevel: ${sacrificedRuneLevel}`;
    }

    MQO_RuneHelper.selectRuneWrapper(sourceRuneLevel);
    await sleep(2000);
    if (sacrificedRuneLevel !== sourceRuneLevel) {
      $('#dex_rune_minus5_btn').click();
      await sleep(2000);
    }

    const combineButton = $('#btnUpgrade');
    if (combineButton.length) {
      combineButton.click();
      await sleep(2000);
    } else {
      alert('The button to combine did not appear. Something went wrong!');
      throw 'The button to combine did not appear. Something went wrong!';
    }
  }

  const createMultipleRunesOfLevel = async (level, quantity) => {
    sendRequestContentFill('getRuneUpgrade.aspx');
    await sleep(500);
    for (let i = 0; i < quantity; i++) {
      console.log('Creating rune', i + 1, 'of', quantity);
      await createRuneOfLevel(level);
    }
  }

  $(document).ready(() => {
    unsafeWindow.MqoUtility.ButtonBar.addToButtonBar(combineRunesHtml);
  });

  unsafeWindow.MqoUtility.Runes = { combineRunesOfLevel, createRune, createMultipleRunesOfLevel };
})();

// Credit to Vibbles for the chat extender
// https://raw.githubusercontent.com/Vibblez/MidenQuest/master/MidenQuest.ChatExtender.user.js
const ChatExtender = (() => {
  function addGlobalStyle(css) {
    var head, style;
    head = document.getElementsByTagName('head')[0];
    if (!head) { return; }

    style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
    }

    addGlobalStyle('#ZoneChat { height: 360px; } #ChatLog { height: 300px; }');
})();

const NavigationHelpers = (() => {
  const addLinks = (id) => {
    let side = $(`#${id}`);
    let sideText = document.getElementById(id).innerHTML;
    side.off();

    if (/\w*\s\w*(Gamble)/g.test(sideText)) {
        side.on("click", () => {
            sendRequestContentFill("getNavigation.aspx?screen=2&gambling=1&null=");
        });
    } else if (/[1-9]\sDeals/g.test(sideText)) {
        side.on("click", () => {
            sendRequestContentFill("getNavigation.aspx?screen=2&market=1&null=");
        });
    } else if (/\sPerk\s(T|t)ime/g.test(sideText)) {
        side.on("click", () => {
            sendRequestContentFill("getInfoPerk.aspx?null=");
        });
    }
  }

  $(document).ready(() => {
    const side1 = document.getElementById("SideAlert1");
    const side2 = document.getElementById("SideAlert2");
    const side3 = document.getElementById("SideAlert3");
    const side4 = document.getElementById("SideAlert4");

    /* Side bar event listeners */
    side1.addEventListener("DOMSubtreeModified", () => addLinks("SideAlert1"));
    side2.addEventListener("DOMSubtreeModified", () => addLinks("SideAlert2"));
    side3.addEventListener("DOMSubtreeModified", () => addLinks("SideAlert3"));
    side4.addEventListener("DOMSubtreeModified", () => addLinks("SideAlert4"));

    /* Add initial sidebar links upon page load */
    addLinks("SideAlert1");
    addLinks("SideAlert2");
    addLinks("SideAlert3");
    addLinks("SideAlert4");
  });
})();