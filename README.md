# MqoUtility
QoL improvements and automating some of the less user-friendly parts of Miden Quest Online

## Installation
* Install TamperMonkey ([Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en)), ([Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/))
  * GreaseMonkey on FireFox is not recommended, but feel free to test it.
* After installing TamperMonkey:
  * Install [MqoUtility](https://github.com/davidmcclelland/MqoUtility/raw/master/MqoUtility.user.js)
  * Install Dex's [RuneHelper](https://dexter15.bitbucket.io/MQO/tampermonkey/MidenQuest%20-%20Rune%20Helper.user.js) to enable automated rune creation
* Refresh MQO

## Caveats
The script is fragile, and prone to having problems. Things like captchas or slowdowns can cause the script to get stuck in an endless loop. When this happens, refreshing the page and fixing the issue manually (solving the captcha or whatever is necessary) is the only way to resolve the problem.

## Special Thanks
* The script started with some inspiration from Kaymo
* The rune functionality wouldn't be possible without Dex's Rune Helper
* Extended chat was taken from Vibblez' script

## Bugs/Suggestions
Feel free to add issues on github if you hit any bugs or have any features you would like to see added