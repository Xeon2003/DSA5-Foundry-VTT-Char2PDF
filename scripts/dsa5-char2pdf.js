/**
 * A class which holds some constants for dsa-char2pdf
 */

 class dsa5char2pdf {
  static ID = 'dsa5-char2pdf';

  static TEMPLATES = {
    PDF_Template: `modules/${this.ID}/templates/template.pdf`
  }

  static PATH = {
    main: `modules/${this.ID}/`
  }

/**
   * A small helper function which leverages developer mode flags to gate debug logs.
   * 
   * @param {boolean} force - forces the log even if the debug flag is not on
   * @param  {...any} args - what to log
   */
 static log(force, ...args) {  
  const shouldLog = force || game.modules.get('_dev-mode')?.api?.getPackageDebugValue(this.ID);

  if (shouldLog) {
    console.log(this.ID, '|', ...args);
    }
  }
}

/** Fuction Roman Numeral Converter by Steven Levithan 
 * https://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter  
*/

function romanize (num) {
	if (!+num)
		return false;
	var	digits = String(+num).split(""),
		key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
		       "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
		       "","I","II","III","IV","V","VI","VII","VIII","IX"],
		roman = "",
		i = 3;
	while (i--)
		roman = (key[+digits.pop() + (i * 10)] || "") + roman;
	return Array(+digits.join("") + 1).join("M") + roman;
}

function deromanize (str) {
	var	str = str.toUpperCase(),
		validator = /^M*(?:D?C{0,3}|C[MD])(?:L?X{0,3}|X[CL])(?:V?I{0,3}|I[XV])$/,
		token = /[MDLV]|C[MD]?|X[CL]?|I[XV]?/g,
		key = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1},
		num = 0, m;
	if (!(str && validator.test(str)))
		return false;
	while (m = token.exec(str))
		num += key[m[0]];
	return num;
}

/** register our module's debug flag with developer mode's custom hook
 */

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(dsa5char2pdf.ID);
});

/** register Hook to Display Option within the actor context menu
*/

Hooks.on("getActorDirectoryEntryContext", (html, entryOptions) => {
  entryOptions.push({
    name: 'DSA5-Char2PDF',
      icon: '<i class="fas fa-tasks"></i>',
      condition: li => {
        const entity = ActorDirectory.collection.get(li.data("entityId"));
        return entity.owner;
      },
      callback: li => {
        
        const entity = ActorDirectory.collection.get(li.data("entityId"));
        fillForm(entity._id); 
      }
    })
});

/**
 * Call function to fill pdf template
 */

async function fillForm(_dsa_actor_id) {

/** declaration
 */
var PDFDocument = PDFLib.PDFDocument;
var StandardFonts = PDFLib.StandardFonts;
var rgb = PDFLib.rgb;

const entity = ActorDirectory.collection.get(_dsa_actor_id);
let map = entity.data.items;

const formUrl = dsa5char2pdf.TEMPLATES.PDF_Template
const formPdfBytes = await fetch(formUrl).then(res => res.arrayBuffer())
const pdfDoc = await PDFDocument.load(formPdfBytes)
const form = pdfDoc.getForm()

  /**
     * Current date in right format
  */

  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  today = dd + '.' + mm + '.' + yyyy;


/** 
 * Import via JSON won't work - yet. (my lack of skills)
 *  
async function fetch_json() {
    let response = await fetch(dsa5char2pdf.DATA_JSON.assignments);

    console.log(response.status); // 200
    console.log(response.statusText); // OK

    if (response.status === 200) {
        let data = await response.json();
        console.log(data);
        console.log(data[0]);
        Object.keys(data).forEach(function(key) {
          console.log('Key : ' + JSON.stringify(key) + ', Value : ' + JSON.stringify(data[key]))
        })
      };
        // handle data
    }

fetch_json()
 */

  /** 
  fetch(dsa5char2pdf.DATA_JSON.assignments, {
    method: 'GET'
  }).then((response) => {
    response.clone().json().then((jsonResponse) => {
      console.log(jsonResponse)
    })
    // assuming your json object is wrapped in an array
    response.json().then(i => i.forEach(i => console.log(i.name)))
  }).catch((err) => {
    console.log(`Error: ${err}` )
  });
*/
 
/** details 
*/

  const n_name = form.getTextField('Held_Name')
  const n_gender = form.getTextField('Held_Geschlecht')
  const n_species = form.getTextField('Held_Spezies_Anzeige')
  const n_birthday = form.getTextField('Held_Geburtsdatum')
  const n_age = form.getTextField('Held_Alter'+'')
  const n_haircolor = form.getTextField('Held_Haare')
  const n_eyecolor = form.getTextField('Held_Augen')
  const n_height = form.getTextField('Held_Groesse'+'')
  const n_weight = form.getTextField('Held_Gewicht'+'')
  const n_career = form.getTextField('Held_Profession_Anzeige')
  const n_culture = form.getTextField('Held_Kultur_Anzeige')
  const n_socialstate = form.getTextField('Held_Sozialstatus')
  const n_home = form.getTextField('Held_Geburtsort')
  const n_family = form.getTextField('Held_Familie')
  const n_distinguishingmark = form.getTextField('Held_Charakteristika')
  
  n_name.setText(entity.name)
  n_gender.setText(entity.data.data.details.gender.value)
  n_species.setText(entity.data.data.details.species.value)
  n_birthday.setText('')
  n_age.setText(entity.data.data.details.age.value)
  n_haircolor.setText(entity.data.data.details.haircolor.value)
  n_eyecolor.setText(entity.data.data.details.eyecolor.value)
  n_height.setText(entity.data.data.details.height.value)
  n_weight.setText(entity.data.data.details.weight.value)
  n_career.setText(entity.data.data.details.career.value)
  n_culture.setText(entity.data.data.details.culture.value)
  n_socialstate.setText(entity.data.data.details.socialstate.value)
  n_home.setText(entity.data.data.details.Home.value)
  n_family.setText(entity.data.data.details.family.value)
  n_distinguishingmark.setText(entity.data.data.details.distinguishingmark.value)

/** actor picture
*/
const actor_image_url = entity.img

if ((actor_image_url.split('.').pop()) === "png" || (actor_image_url.split('.').pop()) === "jpg") { 
  var actor_imageBytes = await fetch(actor_image_url).then(res => res.arrayBuffer())
}
else {
  ui.notifications.warn("Your actor picture won't be exported to PDF. Only JPG and PNG Format ist supported.");
  var actor_imageBytes = await fetch(dsa5char2pdf.PATH.main + "templates/wrongformat.png").then(res => res.arrayBuffer())
}
  var actor_image = await pdfDoc.embedPng(actor_imageBytes)
  var n_image = form.getButton('Charakterbild')
  n_image.setImage(actor_image)
 
/**
  const webp=require('webp-converter');

//pass input image(.webp image) path ,output image(.jpeg,.pnp .....)

//dwebp(input,output,option)

const result = webp.dwebp("nodejs_logo.webp","nodejs_logo.jpg","-o",logging="-v");
result.then((response) => {
  console.log(response);
});


  const actor_imageBytes = await fetch(actor_image_url).then(res => res.arrayBuffer())
  const actor_image = await pdfDoc.embedPng(actor_imageBytes)
  const n_image = form.getButton('Charakterbild')
  n_image.setImage(actor_image)
*/

/** main attributes
*/

  const n_MU = form.getTextField('MU_1')
  const n_KL = form.getTextField('KL_1')
  const n_IN = form.getTextField('IN_1')
  const n_CH = form.getTextField('CH_1')
  const n_FF = form.getTextField('FF_1')
  const n_GE = form.getTextField('GE_1')
  const n_KO = form.getTextField('KO_1')
  const n_KK = form.getTextField('KK_1')

  n_MU.setText(entity.data.data.characteristics.mu.value+'')
  n_KL.setText(entity.data.data.characteristics.kl.value+'')
  n_IN.setText(entity.data.data.characteristics.in.value+'')
  n_CH.setText(entity.data.data.characteristics.ch.value+'')
  n_FF.setText(entity.data.data.characteristics.ff.value+'')
  n_GE.setText(entity.data.data.characteristics.ge.value+'')
  n_KO.setText(entity.data.data.characteristics.ko.value+'')
  n_KK.setText(entity.data.data.characteristics.kk.value+'')

/** disadvantages  
*/


  const disadvantage = map.filter(value => value.type === "disadvantage");
  var f_disadvantage = Array.from(disadvantage.values(), value => value.name).join("\n")
  const n_disadvantage = form.getTextField('Held_Nachteile')  
  n_disadvantage.setText(f_disadvantage)

/** advantages 
*/

  const advantage = map.filter(value => value.type === "advantage");
  var f_advantage = Array.from(advantage.values(), value => value.name).join("\n")
  const n_advantage = form.getTextField('Held_Vorteile')  
  n_advantage.setText(f_advantage)

/** specialability 
*/

  const specialability = map
  .filter(value => value.type === "specialability")
  .filter(value => value.data.data.category.value === "general");
  var f_specialability = Array.from(specialability.values(), value => value.name).join("\n")
  
  const n_specialability = form.getTextField('Held_SF_allgemein')  
  n_specialability.setText(f_specialability)

/** language 
*/

const language = map
.filter(value => value.type === "specialability")
.filter(value => value.data.data.category.value === "language")
.filter(value => value.name.includes("Sprache"))
var f_language = Array.from(language.values(), value => value.name + ' ' + romanize(value.data.data.step.value)).join("\n")

const n_language = form.getTextField('Held_Sprachen')  
n_language.setText(f_language)

/** script 
*/

const script = map
.filter(value => value.type === "specialability")
.filter(value => value.data.data.category.value === "language")
.filter(value => value.name.includes("Schrift"))
var f_script = Array.from(script.values(), value => value.name + ' ' + romanize(value.data.data.step.value)).join("/n")

const n_script = form.getTextField('Held_Schriften')  
n_script.setText(f_script)

/** life / wounds 
*/ 
const n_wounds_max = form.getTextField('LE_Max_1')
const n_wounds_max1 = form.getTextField('LE_Max_3')
const n_wounds_cur = form.getTextField('LE_Wert_1')
const n_wounds_cur1 = form.getTextField('LE_Aktuell_1')
const n_wounds_adv = form.getTextField('LE_Kauf_1')
const n_wounds_mod = form.getTextField('LE_BM_1')

n_wounds_max.setText(entity.data.data.status.wounds.max+'')
n_wounds_max1.setText(entity.data.data.status.wounds.max+'')
n_wounds_cur.setText(entity.data.data.status.wounds.current+'')
n_wounds_cur1.setText(entity.data.data.status.wounds.current+'')
n_wounds_adv.setText(entity.data.data.status.wounds.advances+'')
n_wounds_mod.setText(entity.data.data.status.wounds.modifier+'')

/** soulpower
*/ 
 const n_soulpower_max = form.getTextField('SK_Max_1')
 const n_soulpower_cur = form.getTextField('SK_Wert_1')
 const n_soulpower_mod = form.getTextField('SK_BM_1')
 
 n_soulpower_max.setText(entity.data.data.status.soulpower.max+'')
 n_soulpower_cur.setText(entity.data.data.status.soulpower.value+'')
 n_soulpower_mod.setText(entity.data.data.status.soulpower.modifier+'')

/** toughness
*/ 

const n_toughness_max = form.getTextField('ZK_Max_1')
const n_toughness_cur = form.getTextField('ZK_Wert_1')
const n_toughness_mod = form.getTextField('ZK_BM_1')

n_toughness_max.setText(entity.data.data.status.toughness.max+'')
n_toughness_cur.setText(entity.data.data.status.toughness.value+'')
n_toughness_mod.setText(entity.data.data.status.toughness.modifier+'')

/** dodge
*/ 

const n_dodge_max = form.getTextField('AW_Max_1')
const n_dodge_cur = form.getTextField('AW_Wert_1')
const n_dodge_mod = form.getTextField('AW_BM_1')

n_dodge_max.setText(entity.data.data.status.dodge.max+'')
n_dodge_cur.setText(entity.data.data.status.dodge.value+'')
n_dodge_mod.setText(entity.data.data.status.dodge.modifier+'')

/** astralenergy 
*/ 

const n_astralenergy_max = form.getTextField('AE_Max_1')
const n_astralenergy_cur = form.getTextField('AE_Wert_1')
const n_astralenergy_adv = form.getTextField('AE_Kauf_1')
const n_astralenergy_mod = form.getTextField('AE_BM_1')

n_astralenergy_max.setText(entity.data.data.status.astralenergy.max+'')
n_astralenergy_cur.setText(entity.data.data.status.astralenergy.current+'')
n_astralenergy_adv.setText(entity.data.data.status.astralenergy.advances+'')
n_astralenergy_mod.setText(entity.data.data.status.astralenergy.modifier+'')

/** karmaenergy 
*/ 

const n_karmaenergy_max = form.getTextField('KE_Max_1')
const n_karmaenergy_cur = form.getTextField('KE_Wert_1')
const n_karmaenergy_adv = form.getTextField('KE_Kauf_1')
const n_karmaenergy_mod = form.getTextField('KE_BM_1')

n_karmaenergy_max.setText(entity.data.data.status.karmaenergy.max+'')
n_karmaenergy_cur.setText(entity.data.data.status.karmaenergy.current+'')
n_karmaenergy_adv.setText(entity.data.data.status.karmaenergy.advances+'')
n_karmaenergy_mod.setText(entity.data.data.status.karmaenergy.modifier+'')

/** experience 
*/ 

const n_exp_description = form.getTextField('AP_Erfahrungsgrad_Anzeige')
const n_exp_total = form.getTextField('AP_gesamt')
const n_exp_current = form.getTextField('AP_gesammelt')
const n_exp_spent = form.getTextField('AP_ausgegeben')


n_exp_description.setText(entity.data.data.details.experience.description+'')
n_exp_total.setText(entity.data.data.details.experience.total+'')
n_exp_current.setText(entity.data.data.details.experience.current+'')
n_exp_spent.setText(entity.data.data.details.experience.spent+'')

/** fatepoints 
*/ 

const n_fate_value = form.getTextField('SchiP_Wert_1')
const n_fate_max = form.getTextField('SchiP_Max_1')
const n_fate_current = form.getTextField('SchiP_Aktuell_1')
const n_fate_modifier = form.getTextField('SchiP_BM_1')


n_fate_value.setText(entity.data.data.status.fatePoints.value+'')
n_fate_max.setText(entity.data.data.status.fatePoints.max+'')
n_fate_current.setText(entity.data.data.status.fatePoints.current+'')
n_fate_modifier.setText(entity.data.data.status.fatePoints.modifier+'')

/** talents 
*/ 

/** body talents  */
talent ("Fliegen", 1)
talent ("Gaukeleien", 2)
talent ("Klettern", 3)
talent ("Körperbeherrschung", 4)
talent ("Kraftakt", 5)
talent ("Reiten", 6)
talent ("Schwimmen", 7)
talent ("Selbstbeherrschung", 8)
talent ("Singen", 9)
talent ("Sinnesschärfe", 10)
talent ("Tanzen", 11)
talent ("Taschendiebstahl", 12)
talent ("Verbergen", 13)
talent ("Zechen", 14)
/** society talents  */
talent ("Bekehren & Überzeugen", 15)
talent ("Betören", 16)
talent ("Einschüchtern", 17)
talent ("Etikette", 18)
talent ("Gassenwissen", 19)
talent ("Menschenkenntnis", 20)
talent ("Überreden", 21)
talent ("Verkleiden", 22)
talent ("Willenskraft", 23)
/** nature talents  */
talent ("Fährtensuchen", 24)
talent ("Fesseln", 25)
talent ("Fischen & Angeln", 26)
talent ("Orientierung", 27)
talent ("Pflanzenkunde", 28)
talent ("Tierkunde", 29)
talent ("Wildnisleben", 30)
/** knowledge talents  */
talent ("Brett- & Glücksspiel", 31)
talent ("Geographie", 32)
talent ("Geschichtswissen", 33)
talent ("Götter & Kulte", 34)
talent ("Kriegskunst", 35)
talent ("Magiekunde", 36)
talent ("Mechanik", 37)
talent ("Rechnen", 38)
talent ("Rechtskunde", 39)
talent ("Sagen & Legenden", 40)
talent ("Sphärenkunde", 41)
talent ("Sternkunde", 42)
/** crafting talents  */
talent ("Alchimie", 43)
talent ("Boote & Schiffe", 44)
talent ("Fahrzeuge", 45)
talent ("Handel", 46)
talent ("Heilkunde Gift", 47)
talent ("Heilkunde Krankheiten", 48) 
talent ("Heilkunde Seele", 49)
talent ("Heilkunde Wunden", 50) 
talent ("Holzbearbeitung", 51)
talent ("Lebensmittelbearbeitung", 52)
talent ("Lederbearbeitung", 53)
talent ("Malen & Zeichnen", 54)
talent ("Metallbearbeitung", 55)
talent ("Musizieren", 56)
talent ("Schlösserknacken", 57)
talent ("Steinbearbeitung", 58)
talent ("Stoffbearbeitung", 59)

function talent (name, destination) {
  var name = map
  .filter(value => value.type === "skill")
  .filter(value => value.data.name === name);

var temp = Array.from(name.values(), value => value.data.data.talentValue.value)
var temp_field = form.getTextField("Talent_FW_"+destination)
temp_field.setText(temp+'')
}

/** Combat 
*/

combat ("Armbrüste", 1, 0)
combat ("Bögen", 2, 0)
combat ("Dolche", 3, 1)
combat ("Fechtwaffen", 4, 1)
combat ("Hiebwaffen", 5, 1)
combat ("Kettenwaffen", 6, 0)
combat ("Lanzen", 7, 1)
combat ("Raufen", 8, 1)
combat ("Schilde", 9, 1)
combat ("Schwerter", 10, 1)
combat ("Stangenwaffen", 11, 1)
combat ("Wurfwaffen", 12, 0)
combat ("Zweihandhiebwaffen", 13, 1)
combat ("Zweihandschwerter", 14, 1)

function combat (name, destination, pa) {
  var name = map
  .filter(value => value.type === "combatskill")
  .filter(value => value.data.name === name);

var temp1 = Array.from(name.values(), value => value.data.data.talentValue.value)
var temp_field1 = form.getTextField("KT_FW_"+destination)
temp_field1.setText(temp1+'')
var temp2 = Array.from(name.values(), value => value.data.data.attack.value)
var temp_field2 = form.getTextField("KT_AT_"+destination)
temp_field2.setText(temp2+'')
if (pa === 1){
  var temp3 = Array.from(name.values(), value => value.data.data.parry.value)
  var temp_field3 = form.getTextField("KT_PA_"+destination)
  temp_field3.setText(temp3+'')
  }
}

/** combat specialability 
*/

const combat_specialability = map
.filter(value => value.type === "specialability")
.filter(value => value.data.data.category.value === "Combat");
var f_combat_specialability = Array.from(combat_specialability.values(), value => value.name + ' ' + romanize(value.data.data.step.value)).join("\n")

const n_combat_specialability = form.getTextField('Held_SF_Kampf')  
n_combat_specialability.setText(f_combat_specialability)

/** Coins
*/

coins("Dukaten", "D")
coins("Silber", "S")
coins("Heller", "H")
coins("Kreuzer", "K")

function coins (currency, shorten) {
  var currency = map
  .filter(value => value.data.name === "Money-"+shorten);
  var f_currency = Array.from(currency.values(), value => value.data.data.quantity.value);
  (form.getTextField('Geld_'+shorten)).setText(f_currency+'');
}

/** Weapons
 * 
 * melee weapon
*/
const combat_meleeweapon = map
.filter(value => value.type === "meleeweapon")
.filter(value => value.data.data.worn.value = "true")
.filter(value => value.data.data.combatskill.value !== "Schilde")
var arrayLength = combat_meleeweapon.length;
if (arrayLength > 4) {
  arrayLength = 4 
  ui.notifications.warn("You have equipped more than 4 melee weapons! The template can only hold a maximum of 4");
}
for (var i = 0; i < arrayLength; i++) {
  (form.getTextField('Nahwaffe_Name_Anzeige_'+(i+1))).setText(combat_meleeweapon[i].name+'');
  (form.getTextField('Nah_Kampftechnik_Name_Anzeige_'+(i+1))).setText(combat_meleeweapon[i].data.data.combatskill.value+'');
  (form.getTextField('Nah_Schadensbonus_'+(i+1))).setText(combat_meleeweapon[i].data.data.damage.value+' ??');//follow up 
  (form.getTextField('Nah_Schadensschwelle_'+(i+1))).setText("??");//follow up 
  (form.getTextField('Nah_TP_Wurf_'+(i+1))).setText("??");//follow up 
  (form.getTextField('Nah_TP_Basis_'+(i+1))).setText("??");//follow up 
  (form.getTextField('Nah_TP_'+(i+1))).setText("??");//follow up 
  (form.getTextField('Nah_AT_Mod_'+(i+1))).setText(combat_meleeweapon[i].data.data.atmod.value+'');
  (form.getTextField('Nah_PA_Mod_'+(i+1))).setText(combat_meleeweapon[i].data.data.pamod.value+'');
  var reach_translate = combat_meleeweapon[i].data.data.reach.value
    switch(reach_translate) {
      case "short":
        reach_translate="kurz"
        break;
      case "long":
        reach_translate="lang"
        break;
      default:
      break;
    };
  (form.getTextField('Nah_Reichweite_'+(i+1))).setText(reach_translate);
  (form.getTextField('Nah_AT_'+(i+1))).setText("??");//follow up 
  (form.getTextField('Nah_PA_'+(i+1))).setText("??");//follow up 
  (form.getTextField('Nah_Gewicht_'+(i+1))).setText(combat_meleeweapon[i].data.data.weight.value+'');
}
/** 
 * range weapon 
*/
const combat_rangeweapon = map
.filter(value => value.type === "rangeweapon")
.filter(value => value.data.data.worn.value = "true")
var arrayLength = combat_rangeweapon.length;
if (arrayLength > 4) {
  arrayLength = 4 
  ui.notifications.warn("You have equipped more than 4 range weapons! The template can only hold a maximum of 4");
}
for (var i = 0; i < arrayLength; i++) {
  (form.getTextField('Fernwaffe_Name_Anzeige_'+(i+1))).setText(combat_rangeweapon[i].name+'');
  (form.getTextField('Fern_Kampftechnik_Name_Anzeige_'+(i+1))).setText(combat_rangeweapon[i].data.data.combatskill.value+'');
  (form.getTextField('Fern_Ladezeit_'+(i+1))).setText(combat_rangeweapon[i].data.data.reloadTime.value+' Runden');
  (form.getTextField('Fern_TP_'+(i+1))).setText(combat_rangeweapon[i].data.data.damage.value+'');
  (form.getTextField('Fern_Munition_'+(i+1))).setText(combat_rangeweapon[i].data.data.quantity.value+'');
  (form.getTextField('Fern_Reichweite_'+(i+1))).setText(combat_rangeweapon[i].data.data.reach.value+'');
  (form.getTextField('Fern_FK_'+(i+1))).setText("??");
  (form.getTextField('Fern_Gewicht_'+(i+1))).setText(combat_rangeweapon[i].data.data.weight.value+'');
}

/** 
 * armor 
*/
const combat_armor = map
.filter(value => value.type === "armor")
.filter(value => value.data.data.worn.value = "true")
var arrayLength = combat_armor.length;
if (arrayLength > 4) {
  arrayLength = 4 
  ui.notifications.warn("You have equipped more than 4 armors! The template can only hold a maximum of 4");
}
for (var i = 0; i < arrayLength; i++) {
  (form.getTextField('Ruestung_Name_Anzeige_'+(i+1))).setText(combat_armor[i].name+'');
  (form.getTextField('Ruestung_RS_'+(i+1))).setText(combat_armor[i].data.data.protection.value+'');
  (form.getTextField('Ruestung_BE_'+(i+1))).setText(combat_armor[i].data.data.encumbrance.value+'');
  (form.getTextField('Ruestung_Abzuege_'+(i+1))).setText("??");//follow up
  (form.getTextField('Ruestung_Gewicht_'+(i+1))).setText(combat_armor[i].data.data.weight.value+'');
  (form.getTextField('Ruestung_Gebiet_'+(i+1))).setText("??");
}

/** 
 * shields and parry weapon
*/

const combat_shields = map
.filter(value => value.type === "meleeweapon")
.filter(value => value.data.data.worn.value = "true")
.filter(value => value.data.data.combatskill.value === "Schilde")
var arrayLength = combat_shields.length;
if (arrayLength > 4) {
  arrayLength = 4 
  ui.notifications.warn("You have equipped more than 4 shields or parry weapons! The template can only hold a maximum of 4");
}
for (var i = 0; i < arrayLength; i++) {
  (form.getTextField('Schild_Name_Anzeige_'+(i+1))).setText(combat_shields[i].name+'');
  (form.getTextField('Schild_SP_'+(i+1))).setText(combat_shields[i].data.data.structure.value+' / '+combat_shields[i].data.data.structure.max);
  (form.getTextField('Schild_Mod_'+(i+1))).setText('AT:'+combat_shields[i].data.data.atmod.value+' / PA:'+combat_shields[i].data.data.pamod.value);
  (form.getTextField('Schild_Gewicht_'+(i+1))).setText(combat_shields[i].data.data.weight.value+'');
}

/** Items
*/

const items = map
.filter(value => value.type === "equipment")
var arrayLength = items.length;
var sum_weight1 = 0;
var sum_weight2 = 0;
if (arrayLength > 72) {
  arrayLength = 72 
  ui.notifications.warn("You have more than 72 items in your inventory! The template can only hold a maximum of 72");
}
for (var i = 0; i < arrayLength; i++) {
  (form.getTextField('Besitz_Name_'+(i+1))).setText(items[i].name+'');
  (form.getTextField('Besitz_Gewicht_'+(i+1))).setText(items[i].data.data.weight.value+'');
  if (i <= 36) {
    sum_weight1 = sum_weight1 + Number(items[i].data.data.weight.value)
  }
  else {
    sum_weight2 = sum_weight2 + Number(items[i].data.data.weight.value)
  } 
}
(form.getTextField('Gewicht_1')).setText(sum_weight1+'');
(form.getTextField('Gewicht_2')).setText(sum_weight1+sum_weight2+'');
(form.getTextField('Trag_1')).setText(Number(entity.data.data.characteristics.kk.value)*2+'');

/** 
var f_combat_meleeweapon = Array.from(combat_meleeweapon.values(), value => value.name)

const n_combat_meleeweapon = form.getTextField('Held_SF_Kampf')  
n_combat_meleeweapon.setText(f_combat_meleeweapon)

/** 
 * save filled template 
*/

  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes], {type: "application/pdf;charset=utf-8"});
  saveAs(blob, "DSA5-"+entity.name+".pdf")

}

