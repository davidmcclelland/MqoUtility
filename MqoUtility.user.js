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

const waitForActionTimer = timeoutms => new Promise((r, j) => {
  const check = () => {
    if ($('#prgActionTimer').attr('aria-valuenow') === '0') {
      r();
    } else if ((timeoutms -= 100) < 0) {
      j('timed out!');
    } else {
      setTimeout(check, 100);
    }
  }
  setTimeout(check, 100);
});

const sleep = m => new Promise(r => setTimeout(r, m));

const ButtonBar = (() => {
  const displayHtml = `<div id="MqoUtilityButtons"></div>`;

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
    $('#CaptchaDiv').before(displayHtml);
  });

  return { addToButtonBar };
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
    ButtonBar.addToButtonBar(openChestHtml);
    ButtonBar.addToButtonBar(openBagHtml);
  });

  return { openAllChests, openBagsAndKeys };
})();

const Princess = (() => {
  const searchPoints = [
    [125, 125], [125, 375], [125, 625], [125, 875],
    [375, 875], [375, 625], [375, 375], [375, 125],
    [625, 125], [625, 375], [625, 625], [625, 875],
    [875, 875], [875, 625], [875, 375], [875, 125]
  ];

  const displayHtml = `
  <div id='MqoUtilityPrincessContent' style='position: absolute;top: 0;left: 0; width: 300px;'>
    <h1 style='font-size: 30px;'>Princess</h1>
    <div>
      <div id='princess_x_div'>
        <h1>X</h1>
        <input type='number' min='1' max='1000' value='201' id='princess_x_input'/>
      </div>
      <div id='princess_y_div'>
        <h1>Y</h1>
        <input type='number' min='1' max='1000' value='201' id='princess_y_input'/>
      </div>
      <div id='princess_button_div'>
        <input value='travel' type='button' onclick='MqoUtility.Princess.doTravel()'>
        <input value='search' type='button' onclick='MqoUtility.Princess.doSearch()'>
        <input value='map' type='button' onclick='MqoUtility.Princess.doShowMap()'>
        <input value='next' type='button' onclick='MqoUtility.Princess.autoSearch()'>
      </div>
    </div>
    <div style='margin-top: 10px;'>
      <span style='display: inline-flex;'>
        <h2 style='font-size: 25px; margin-right: 10px'>Log</h2>
        <input value='clear' type='button' onclick='MqoUtility.Princess.clearLog()'>
      </span>
      <div style='height: 750px; overflow-y: auto'>
        <ul id='princess_log'></ul>
      </div>
    </div>
  </div>
  `

  const princessToggleHtml = `<input type="button" class="gmButtonMed" value="Princess" onclick="MqoUtility.Princess.toggleVisibility()">`;

  const toggleVisibility = () => {
    $('#MqoUtilityPrincessContent').toggle();
  }

  const addLogEntry = (logText) => {
    const prunedArr = logText.match(/\(.*?\)/g);
    const displayText = prunedArr.join(' ');
    $('#princess_log').append(`<li>${displayText}</li>`);
  };

  const clearLog = () => {
    $('#princess_log').empty();
    currentSearchIndex = 0;
  };

  const getClueText = () => {
    let text = $('#ContentLoad > div:nth-child(3) > div > div:not(:has(.SearchLinkSimpleName)):last').text();
    if (text === 'Tradeskills/Search') {
      text = null;
    }
    return text;
  }

  const doSearch = async () => {
    let dataPointFound = false;
    let clueText;
    while (!dataPointFound) {
      sendRequestContentFill('getSearch.aspx?clue=1');
      await sleep(250);
      clueText = getClueText();
      if (!clueText) {
        break;
      }
      dataPointFound = clueText.startsWith('(') || clueText.includes('found');
      await waitForActionTimer(30000);
    }

    if (clueText && clueText.includes('found the princess')) {
      returnHome();
    }

    console.log('Data point found', clueText);
  }

  const goToPoint = async (x, y) => {
    sendRequestContentFill(`getMap.aspx?NewX=${x}&NewY=${y}&zoom=4`)
    await sleep(250);
    await waitForActionTimer(30000);
  }

  const doTravel = async () => {
    await waitForActionTimer(30000);
    const x = $('#princess_x_input').val();
    const y = $('#princess_y_input').val();
    await goToPoint(x, y);
    await doSearch();
  }

  const doShowMap = () => {
    sendRequestContentFill(`getMap.aspx?}&zoom=4`)
  }

  const autoSearch = async () => {
    let usefulClueFound = false;
    clearLog();

    for (let searchCounter = 0; !usefulClueFound && (searchCounter < searchPoints.length); ++searchCounter) {
      const [x, y] = searchPoints[searchCounter];
      console.log('searching', x, y);
      $('#princess_x_input').val(x);
      $('#princess_y_input').val(y);
      await doTravel();

      const clueText = getClueText();
      usefulClueFound = !clueText.includes('isnt');
    }
  }

  const returnHome = async () => {
    goToPoint(460, 557);
    TradeskillStart(3);
  }

  const handleLoadpageEvent = () => {
    const clueText = getClueText();
    if (clueText && clueText.startsWith('(')) {
      addLogEntry(clueText);
    }
  };

  const handleWebsocketEvent = (event) => {
    const datum = event.data;
    const arr = datum.split('|');
    if (arr[0] === 'LOADPAGE') {
      handleLoadpageEvent();
    }
  };

  MQO_WebsocketWrapper.addCallback(handleWebsocketEvent);

  $(document).ready(() => {
    $('body').append(displayHtml);
    ButtonBar.addToButtonBar(princessToggleHtml);
  });

  return {
    doTravel,
    doSearch,
    doShowMap,
    autoSearch,
    clearLog,
    toggleVisibility,
  };
})();

const Market = (() => {
  const marketButtonHtml = `<input type="button" class="gmButtonMed" value="Deals" onclick="MqoUtility.Market.purchaseDailyDeals()">`;

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

  $(document).ready(() => {
    ButtonBar.addToButtonBar(marketButtonHtml);
  });

  return { purchaseDailyDeals };
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
    ButtonBar.addToButtonBar(perkHtml);
  });

  return { addPerks };
})();

const Runes = (() => {
  const combineRunesHtml = `<input type="button" class="gmButtonMed" value="Runes" onclick="MqoUtility.Runes.createRune()">`;

  const combineRunesOfLevel = async () => {
    sendRequestContentFill('getRuneUpgrade.aspx');
    await sleep(500);

    const runeLevel = prompt('What level of rune would you like to combine (entered as the string name)?', 'two');
    const buttonId = `#dex_rune_${runeLevel}_btn`;
    while (true) {
      const dexButton = $(buttonId);
      dexButton.click();
      await sleep(3000);
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
    const targetRuneLevel = Number(prompt('What level of rune would you like to make?', 15));
    if (targetRuneLevel) {
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
        sourceRuneLevel = 2;
        sacrificedRuneLevel = 2;
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
    ButtonBar.addToButtonBar(combineRunesHtml);
  })

  return { combineRunesOfLevel, createRune, createMultipleRunesOfLevel }
})();

if (unsafeWindow.MqoUtility === undefined) {
  unsafeWindow.MqoUtility = {
    ButtonBar,
    ChestOpener,
    Princess,
    Market,
    Perks,
    Runes,
  }
}