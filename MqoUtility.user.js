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
      console.log('action timer is 0!');
      r();
    } else if ((timeoutms -= 100) < 0) {
      console.log('timed out');
      j('timed out!');
    } else {
      console.log('still waiting', $('#prgActionTimer').attr('aria-valuenow'));
      setTimeout(check, 100);
    }
  }
  setTimeout(check, 100);
});

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
  const openBagHtml = `<input type="button" class="gmButtonMed" value="Bags" onclick="MqoUtility.ChestOpener.openAllResBags()">`;

  const bronzeChestId = '#btnOpenChest2';
  const silverChestid = '#btnOpenChest3';
  const goldChestId = '#btnOpenChest4';

  const resBagId = '#btnOpenResBag';

  const sleep = m => new Promise(r => setTimeout(r, m));

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

  const openAllResBags = async () => {
    openAllChestsOfType(resBagId);
  }

  $(document).ready(() => {
    ButtonBar.addToButtonBar(openChestHtml);
    ButtonBar.addToButtonBar(openBagHtml);
  });

  return { openAllChests, openAllResBags };
})();

const Princess = (() => {
  const searchPoints = [
    [125, 125], [125, 375], [125, 625], [125, 875],
    [375, 875], [375, 625], [375, 375], [375, 125],
    [625, 125], [625, 375], [625, 625], [625, 875],
    [875, 875], [875, 625], [875, 375], [875, 125]
  ]

  let currentSearchIndex = 0;

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

  const doSearch = async () => {
    sendRequestContentFill('getSearch.aspx?clue=1');
    await waitForActionTimer(30000);
  }

  const doTravel = async () => {
    const x = $('#princess_x_input').val();
    const y = $('#princess_y_input').val();
    sendRequestContentFill(`getMap.aspx?NewX=${x}&NewY=${y}&zoom=4`)
    await waitForActionTimer(30000);
    await doSearch();
  }

  const doShowMap = () => {
    sendRequestContentFill(`getMap.aspx?}&zoom=4`)
  }

  const getClueText = () => {
    return $('#ContentLoad > div:nth-child(3) > div > div:last-of-type').text();
  }

  const autoSearch = async () => {
    let usefulClueFound = false;
    clearLog();

    for (let searchCounter = 0; !usefulClueFound && (searchCounter < searchPoints.length); ++searchCounter) {
      const [x, y] = searchPoints[currentSearchIndex];
      $('#princess_x_input').val(x);
      $('#princess_y_input').val(y);
      await doTravel();
      let dataPointFound = false;
      let clueText;
      while (!dataPointFound) {
        await doSearch();
        clueText = getClueText();
        dataPointFound = clueText && clueText.startsWith('(');
      }

      usefulClueFound = !clueText.includes('isnt');
    }
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

if (unsafeWindow.MqoUtility === undefined) {
  unsafeWindow.MqoUtility = {
    ButtonBar,
    ChestOpener,
    Princess,
  }
}