# DSA5-Foundry-VTT-Char2PDF
*Foundry VTT module to transfer the DSA 5 actors to PDF*

This module is to extend the functionality of the [Foundry VTT](https://foundryvtt.com/) platform and gives the users of [The Dark EYE / Das schwarze Auge 5](https://foundryvtt.com/packages/dsa5) the possibility to export their players directly into the original Ulisses PDF template.  

## Installation
### Automatic Installtion
See https://foundryvtt.wiki/en/basics/Modules. 

1. Open the Add-on Modules tab in the Configuration and Setup dialog.
2. Click Install Module, paste --> `https://github.com/JWinsen/DSA5-Foundry-VTT-Char2PDF/releases/latest/download/module.json`
   in as the Manifest URL, then click Install.

### Manual Installation
If the above installation doesn't work you can try doing it manually.
1. Download the latest [release](https://github.com/Jerakin/p5e-foundryVTT/releases)
2. Unzip the file into a folder named `dsa5-char2pdf` (*"Extract to dsa5-char2pdf"*)
3. Place the folder `dsa5-char2pdf` in `AppData/Local/FoundryVTT/Data/modules/` folder.

### Completion of the installation
As `gamemaster` go to the `Manage Modules` options menu in the `Game Settings` for your World, then enable the `DSA5 - Char2PDF` module.

## Where to find the button for export ? 

![alt text](https://github.com/JWinsen/DSA5-Foundry-VTT-Char2PDF/blob/main/Where_to_find_the_Button.png?raw=true)

## Used librarys: 
- *FileSaver.js* (using [FileSaver.js](https://github.com/eligrey/FileSaver.js)) by [eligrey](https://github.com/eligrey)
- *pdf-lib.js* (using [pdf-lib.js](https://github.com/Hopding/pdf-lib)) by [Hopding](https://github.com/Hopding)

## License

Copyright © 2021 JWinsen

This package is under an [MIT license](LICENSE) and the [Foundry Virtual Tabletop Limited License Agreement for module development](https://foundryvtt.com/article/license/).
