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

if (unsafeWindow.MqoUtility === undefined) {
  unsafeWindow.MqoUtility = {
    ButtonBar,
    ChestOpener,
  }
}