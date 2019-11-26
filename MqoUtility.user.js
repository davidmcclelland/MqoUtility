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

const displayHtml = `
<div id="MqoUtilityButtons">
  <input type="button" value="Chests" onclick="MqoUtility.openAllChests()">
  <input type="button" value="Bags" onclick="MqoUtility.openAllResBags()">
</div>
`

const displayStyle = `
#MqoUtilityButtons > input {
  text-align: center;
  font-size: 13px;
  height: 30px;
  align-self: center;
  border: 1px solid #00000088;
  border-radius: 5px;
  font-weight: bold;
  font-family: Helvetica;
}
`

const chestOpener = (() => {
  const bronzeChestId = '#btnOpenChest2';
  const silverChestid = '#btnOpenChest3';
  const goldChestId = '#btnOpenChest4';

  const resBagId = '#btnOpenResBag';

  const sleep = m => new Promise(r => setTimeout(r, m));

  const openAllChestsOfType = async (btnId) => {
    let btnLength = $(btnId).length;
    while (btnLength) {
      $(btnId).click();
      await sleep(500);
      btnLength = ($btnId).length;
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

  return { openAllChests, openAllResBags };
})();

$(document).ready(() => {
  GM_addStyle(displayStyle);
  $('#CaptchaDiv').before(displayHtml);
});

if (unsafeWindow.MqoUtility === undefined) {
  unsafeWindow.MqoUtility = {
    openAllChests: chestOpener.openAllChests,
    openAllResBags: chestOpener.openAllResBags,
  }
}