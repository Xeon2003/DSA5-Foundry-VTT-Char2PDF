var cb_actors_tale = false;
var cb_del_pages = false;
var modul_version = '';

/**
 * A class which holds some constants for dsa-char2pdf
 */

 class dsa5char2pdf {
  static ID = 'dsa5-pdfexport';

  static TEMPLATES = {
    PDF_Template: `modules/${this.ID}/templates/template.pdf`,
    PDF_Biography: `modules/${this.ID}/templates/template_biography.pdf`,
    export_preferences: `modules/${this.ID}/templates/export_preferences.hbs`
  }

  static PATH = {
    main: `modules/${this.ID}/`
  }

/** A small helper function which leverages developer mode flags to gate debug logs.
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

/** register our module's debug flag with developer mode's custom hook */

Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
  registerPackageDebugFlag(dsa5char2pdf.ID);
});

/** register Hook to Display Option within the actor context menu */

Hooks.on("getActorDirectoryEntryContext", (html, entryOptions) => {
  entryOptions.push({
    name: 'Exportieren',
      icon: '<i class="fas fa-tasks"></i>',
      condition: li => {
        const entity = ActorDirectory.collection.get(li.data("documentId"));
        console.log(ActorDirectory.collection)
        //check for the right DSA5 template and for the right type
        //creature
        if (entity.type == "creature" || entity.type == "npc" || entity.type == "character" || entity.sheet == "ActorSheetdsa5Character")
        {
          return entity.id;
        }
      },
      callback: li => {
        const actor = ActorDirectory.collection.get(li.data("documentId"));
        console.log(actor)
        const exportPreferences = new ExportPreferences(actor);
        exportPreferences.render(true);
      }
    })
});

/** Set up FormApplication */

class ExportPreferences extends FormApplication {
  constructor(actor) {
    super();
    this.actor = actor;
  }

  static get defaultOptions() {
    const defaults = super.defaultOptions;
    const overrides = {
      closeOnSubmit: false,
      height: 'auto',
      id: 'export_preferences',
      submitOnChange: true,
      template: dsa5char2pdf.TEMPLATES.export_preferences,
      title: 'Exportieren',
      chkbox_actorstale: false, 
      chkbox_delpages: false,
    };
    const mergedOptions = foundry.utils.mergeObject(defaults, overrides);
    return mergedOptions;
  }

  getData(options) {
    return {
      ID: this.actor.id,
      actor: this.actor.name,
      character: ["character","npc"].includes(this.actor.type),
      chkbox_actorstale: false,
      chkbox_delpages: false
    };
  }


	activateListeners() {

		document.getElementById("btn_Export")?.addEventListener("click", event => {
		event.preventDefault();
		fillForm(this.actor.id);
    this.close();
		});

    document.getElementById("btn_details_export")?.addEventListener("click", event => {
      event.preventDefault();
      build_details(this.actor.id);
      this.close();
    });

    document.getElementById("btn_export_handout")?.addEventListener("click", event => {
      event.preventDefault();
      build_creature_handout(this.actor.id);
      this.close();
    });

    document.getElementById("btn_export_creature")?.addEventListener("click", event => {
      event.preventDefault();
      build_creature_card(this.actor.id);
      this.close();
    });
    
/**
    const chkbox_actorstale = document.querySelector("input[name=chkbox_actors_tale]");
    chkbox_actorstale.addEventListener('change', function() {
      if (this.checked) {
        cb_actors_tale = true;
      } else {
        cb_actors_tale = false;
      }
    });

    const chkbox_delpages = document.querySelector("input[name=chkbox_del_pages]");
    chkbox_delpages.addEventListener('change', function() {
      if (this.checked) {
        cb_del_pages = true;
      } else {
        cb_del_pages = false;
      }
    });*/
	};
}


/** Function to convert webp to png for PDF-Import */

 function toDataUrl(src, outputFormat) {
  // create an image-object to convert webp to png for PDF-Import
  return new Promise((resolve, reject) => {
    var img = new Image();
    // to solve Forge VTT problem - add CORS to prenvent tainted canvases
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
      var canvas = document.createElement('CANVAS');
      var ctx = canvas.getContext('2d');
      var dataURL;
      canvas.height = this.naturalHeight;
      canvas.width = this.naturalWidth;
      ctx.drawImage(this, 0, 0);
      // Convert the canvas to a data url
      dataURL = canvas.toDataURL(outputFormat);
      resolve(dataURL);
      // Mark the canvas to be ready for garbage
      // collection
      canvas = null;
    };
    // Load the image
    try{
    img.src = src;
    // make sure the load event fires for cached images too
    if (img.complete || img.complete === undefined) {
      // Flush cache
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
      // Try again
      img.src = src;
    }
    }catch(error){
      console.log("image error")
    }
  })
}

/** Function to get result of the async task to read the pictures from a source with the use of 'await' */
async function get_actor_pic(src) {
  try {
      const result = await toDataUrl(src);
      return (result);

  } catch (error) {
      console.error('ERROR:');
      console.error(error);
  }
}

/**
 * Converts the Leitwert short into the long version
*/
function Leitwert_long (Leitwert_short) {
  switch((Leitwert_short).toUpperCase()) {
    case "MU":
      Leitwert_short="Mut"
      break;
    case "KL":
      Leitwert_short="Klugheit"
      break;
    case "IN":
      Leitwert_short="Intuition"
      break;
    case "CH":
      Leitwert_short="Charisma"
      break;
    case "FF":
      Leitwert_short="Fingerfertigkeit"
      break;
    case "GE":
      Leitwert_short="Gewandheit"
      break;
    case "KO":
      Leitwert_short="Konstitution"
      break;
    case "KK":
      Leitwert_short="Körperkraft"
      break;
    default:
    break;
  };
  return Leitwert_short
}

/**
 * Call function to fill pdf template
 */

async function fillForm(_dsa_actor_id) {
/** declaration */
 var PDFDocument = PDFLib.PDFDocument;
 var StandardFonts = PDFLib.StandardFonts;
 var rgb = PDFLib.rgb;

 const entity = ActorDirectory.collection.get(_dsa_actor_id);
 let map = entity.items;

 const formUrl = dsa5char2pdf.TEMPLATES.PDF_Template
 const formPdfBytes = await fetch(formUrl).then(res => res.arrayBuffer())
 const pdfDoc = await PDFDocument.load(formPdfBytes)
 const form = pdfDoc.getForm()

	/** check for modul version */
	const ModuleAPI = game.modules.get('dsa5-char2pdf')
	modul_version = (ModuleAPI.version)

    /** Current date in right format */

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = dd + '.' + mm + '.' + yyyy;

    /** character detail */

    form.getTextField('Held_Name').setText(entity.name)
    form.getTextField('Held_Geschlecht').setText(entity.system.details.gender.value)
    form.getTextField('Held_Spezies_Anzeige').setText(entity.system.details.species.value)
    form.getTextField('Held_Geburtsdatum').setText('')
    form.getTextField('Held_Alter'+'').setText(entity.system.details.age.value)
    form.getTextField('Held_Haare').setText(entity.system.details.haircolor.value)
    form.getTextField('Held_Augen').setText(entity.system.details.eyecolor.value)
    form.getTextField('Held_Groesse'+'').setText(entity.system.details.height.value)
    form.getTextField('Held_Gewicht'+'').setText(entity.system.details.weight.value)
    form.getTextField('Held_Profession_Anzeige').setText(entity.system.details.career.value)
    form.getTextField('Held_Kultur_Anzeige').setText(entity.system.details.culture.value)
    form.getTextField('Held_Sozialstatus').setText(entity.system.details.socialstate.value)
    form.getTextField('Held_Geburtsort').setText(entity.system.details.home.value)
    form.getTextField('Held_Familie').setText(entity.system.details.family.value)
    form.getTextField('Held_Charakteristika').setText(entity.system.details.distinguishingmark.value)

  /** actor picture */
  const actor_image_url = entity.img
  let imageOk = true
  let actor_imageBytes = null
  await fetch(actor_image_url).then(resp=>{
    if (resp.status!==200){
      imageOk=false
    }
  })

  if (imageOk){
    if ((actor_image_url.split('.').pop()) === "png" || (actor_image_url.split('.').pop()) === "jpg") {
      actor_imageBytes = await fetch(actor_image_url).then(res => res.arrayBuffer())
    } else {
      actor_imageBytes = await get_actor_pic(actor_image_url)
    }
    if (actor_imageBytes){
      var actor_image = await pdfDoc.embedPng(actor_imageBytes)
      form.getButton('Charakterbild').setImage(actor_image)
    }
  }

  
  /** main attributes */

  const p_mu = entity.system.characteristics.mu.value
  const p_kl = entity.system.characteristics.kl.value
  const p_in = entity.system.characteristics.in.value
  const p_ch = entity.system.characteristics.ch.value
  const p_ff = entity.system.characteristics.ff.value
  const p_ge = entity.system.characteristics.ge.value
  const p_ko = entity.system.characteristics.ko.value
  const p_kk = entity.system.characteristics.kk.value

  form.getTextField('MU_1').setText(p_mu+'')
  form.getTextField('KL_1').setText(p_kl+'')
  form.getTextField('IN_1').setText(p_in+'')
  form.getTextField('CH_1').setText(p_ch+'')
  form.getTextField('FF_1').setText(p_ff+'')
  form.getTextField('GE_1').setText(p_ge+'')
  form.getTextField('KO_1').setText(p_ko+'')
  form.getTextField('KK_1').setText(p_kk+'')

  /** calculated mods */
  form.getTextField('EW_Mod_MU').setText(p_mu+'')
  form.getTextField('EW_Mod_p1_MU').setText(p_mu+1+'')
  form.getTextField('EW_Mod_p2_MU').setText(p_mu+2+'')
  form.getTextField('EW_Mod_p3_MU').setText(p_mu+3+'')
  form.getTextField('EW_Mod_m1_MU').setText(p_mu-1+'')
  form.getTextField('EW_Mod_m2_MU').setText(p_mu-2+'')
  form.getTextField('EW_Mod_m3_MU').setText(p_mu-3+'')

  form.getTextField('EW_Mod_KL').setText(p_kl+'')
  form.getTextField('EW_Mod_p1_KL').setText(p_kl+1+'')
  form.getTextField('EW_Mod_p2_KL').setText(p_kl+2+'')
  form.getTextField('EW_Mod_p3_KL').setText(p_kl+3+'')
  form.getTextField('EW_Mod_m1_KL').setText(p_kl-1+'')
  form.getTextField('EW_Mod_m2_KL').setText(p_kl-2+'')
  form.getTextField('EW_Mod_m3_KL').setText(p_kl-3+'')

  form.getTextField('EW_Mod_IN').setText(p_in+'')
  form.getTextField('EW_Mod_p1_IN').setText(p_in+1+'')
  form.getTextField('EW_Mod_p2_IN').setText(p_in+2+'')
  form.getTextField('EW_Mod_p3_IN').setText(p_in+3+'')
  form.getTextField('EW_Mod_m1_IN').setText(p_in-1+'')
  form.getTextField('EW_Mod_m2_IN').setText(p_in-2+'')
  form.getTextField('EW_Mod_m3_IN').setText(p_in-3+'')

  form.getTextField('EW_Mod_CH').setText(p_ch+'')
  form.getTextField('EW_Mod_p1_CH').setText(p_ch+1+'')
  form.getTextField('EW_Mod_p2_CH').setText(p_ch+2+'')
  form.getTextField('EW_Mod_p3_CH').setText(p_ch+3+'')
  form.getTextField('EW_Mod_m1_CH').setText(p_ch-1+'')
  form.getTextField('EW_Mod_m2_CH').setText(p_ch-2+'')
  form.getTextField('EW_Mod_m3_CH').setText(p_ch-3+'')

  form.getTextField('EW_Mod_FF').setText(p_ff+'')
  form.getTextField('EW_Mod_p1_FF').setText(p_ff+1+'')
  form.getTextField('EW_Mod_p2_FF').setText(p_ff+2+'')
  form.getTextField('EW_Mod_p3_FF').setText(p_ff+3+'')
  form.getTextField('EW_Mod_m1_FF').setText(p_ff-1+'')
  form.getTextField('EW_Mod_m2_FF').setText(p_ff-2+'')
  form.getTextField('EW_Mod_m3_FF').setText(p_ff-3+'')

  form.getTextField('EW_Mod_GE').setText(p_ge+'')
  form.getTextField('EW_Mod_p1_GE').setText(p_ge+1+'')
  form.getTextField('EW_Mod_p2_GE').setText(p_ge+2+'')
  form.getTextField('EW_Mod_p3_GE').setText(p_ge+3+'')
  form.getTextField('EW_Mod_m1_GE').setText(p_ge-1+'')
  form.getTextField('EW_Mod_m2_GE').setText(p_ge-2+'')
  form.getTextField('EW_Mod_m3_GE').setText(p_ge-3+'')

  form.getTextField('EW_Mod_KO').setText(p_ko+'')
  form.getTextField('EW_Mod_p1_KO').setText(p_ko+1+'')
  form.getTextField('EW_Mod_p2_KO').setText(p_ko+2+'')
  form.getTextField('EW_Mod_p3_KO').setText(p_ko+3+'')
  form.getTextField('EW_Mod_m1_KO').setText(p_ko-1+'')
  form.getTextField('EW_Mod_m2_KO').setText(p_ko-2+'')
  form.getTextField('EW_Mod_m3_KO').setText(p_ko-3+'')

  form.getTextField('EW_Mod_KK').setText(p_kk+'')
  form.getTextField('EW_Mod_p1_KK').setText(p_kk+1+'')
  form.getTextField('EW_Mod_p2_KK').setText(p_kk+2+'')
  form.getTextField('EW_Mod_p3_KK').setText(p_kk+3+'')
  form.getTextField('EW_Mod_m1_KK').setText(p_kk-1+'')
  form.getTextField('EW_Mod_m2_KK').setText(p_kk-2+'')
  form.getTextField('EW_Mod_m3_KK').setText(p_kk-3+'')

  /** disadvantages */

    const disadvantage = map.filter(value => value.type === "disadvantage");
    var f_disadvantage = Array.from(disadvantage.values(), value => value.system.max.value==="0"?value.name:value.name+ ' ' + romanize(value.system.step.value)).join(", ")
    form.getTextField('Held_Nachteile').setText(f_disadvantage)

  /** advantages */

    const advantage = map.filter(value => value.type === "advantage");
    var f_advantage = Array.from(advantage.values(), value => value.system.max.value==="0"?value.name:value.name+ ' ' + romanize(value.system.step.value)).join(", ")
    form.getTextField('Held_Vorteile').setText(f_advantage)

  /** specialability */

    const specialability = map
    .filter(value => value.type === "specialability")
    .filter(value => (value.system.category.value === "general" || value.system.category.value === "fatePoints"));
    var f_specialability = Array.from(specialability.values(), value => value.system.maxRank.value==="0"?value.name:value.name+ ' ' + romanize(value.system.step.value)).join(", ")
    form.getTextField('Held_SF_allgemein').setText(f_specialability)

  /** language */

  const language = map
  .filter(value => value.type === "specialability")
  .filter(value => value.system.category.value === "language")
  .filter(value => value.name.includes("Sprache"))
  var f_language = Array.from(language.values(), value => value.name + ' ' + romanize(value.system.step.value)).join(", ")
  form.getTextField('Held_Sprachen').setText(f_language)

  /** script */

  const script = map
  .filter(value => value.type === "specialability")
  .filter(value => value.system.category.value === "language")
  .filter(value => value.name.includes("Schrift"))
  var f_script = Array.from(script.values(), value => value.name + ' ' + romanize(value.system.step.value)).join(", ")
  form.getTextField('Held_Schriften').setText(f_script)

  /** life / wounds */

  form.getTextField('LE_Max_1').setText(entity.system.status.wounds.max+'')
  form.getTextField('LE_Max_3').setText(entity.system.status.wounds.max+'')
  form.getTextField('LE_Wert_1').setText(entity.system.status.wounds.initial+'')
  //form.getTextField('LE_Aktuell_1').setText(entity.system.status.wounds.current+'')
  form.getTextField('LE_Kauf_1').setText(entity.system.status.wounds.advances+'')
  form.getTextField('LE_BM_1').setText((entity.system.status.wounds.current - entity.system.status.wounds.initial)+'')

  /** soulpower*/

  form.getTextField('SK_Max_1').setText(entity.system.status.soulpower.max+'')
  form.getTextField('SK_Wert_1').setText(entity.system.status.soulpower.initial+'')
  form.getTextField('SK_BM_1').setText((entity.system.status.soulpower.value - entity.system.status.soulpower.initial)+'')

  /** toughness*/

  form.getTextField('ZK_Max_1').setText(entity.system.status.toughness.max+'')
  form.getTextField('ZK_Wert_1').setText(entity.system.status.toughness.initial+'')
  form.getTextField('ZK_BM_1').setText((entity.system.status.toughness.value - entity.system.status.toughness.initial)+'')

  /** dodge*/

  form.getTextField('AW_Max_1').setText(entity.system.status.dodge.max+'')
  form.getTextField('AW_Wert_1').setText(entity.system.status.dodge.value+'')
  form.getTextField('AW_BM_1').setText(entity.system.status.dodge.modifier+'')

  /** astralenergy */

  form.getTextField('AE_Max_1').setText(entity.system.status.astralenergy.max+'')
  form.getTextField('AE_Wert_1').setText(entity.system.status.astralenergy.current+'')
  form.getTextField('AE_Kauf_1').setText(entity.system.status.astralenergy.advances+'')
  form.getTextField('AE_BM_1').setText(entity.system.status.astralenergy.gearmodifier+'')

  /** karmaenergy */

  form.getTextField('KE_Max_1').setText(entity.system.status.karmaenergy.max+'')
  form.getTextField('KE_Wert_1').setText(entity.system.status.karmaenergy.current+'')
  form.getTextField('KE_Kauf_1').setText(entity.system.status.karmaenergy.advances+'')
  form.getTextField('KE_BM_1').setText(entity.system.status.karmaenergy.gearmodifier+'')

  /** experience */

  var exp_translate = entity.system.details.experience.description
  switch(exp_translate) {
    case "EXP.inexperienced":
      exp_translate="Unerfahren"
      break;
    case "EXP.average":
      exp_translate="Durchschnittlich"
      break;
    case "EXP.experienced":
      exp_translate="Erfahren"
      break;
    case "EXP.competent":
      exp_translate="Kompetent"
      break;
    case "EXP.masterful":
      exp_translate="Meisterlich"
      break;
    case "EXP.brillant":
      exp_translate="Brilliant"
      break;
      case "EXP.legendary":
        exp_translate="Legendär"
        break;
    default:
    break;
  };
  form.getTextField('AP_Erfahrungsgrad_Anzeige').setText(exp_translate+'')

  form.getTextField('AP_gesamt').setText(entity.system.details.experience.total+'')
  form.getTextField('AP_gesammelt').setText(entity.system.details.experience.current+'')
  form.getTextField('AP_ausgegeben').setText(entity.system.details.experience.spent+'')

  /** fatepoints */

  form.getTextField('SchiP_Wert_1').setText(entity.system.status.fatePoints.value+'')
  form.getTextField('SchiP_Max_1').setText(entity.system.status.fatePoints.max+'')
  form.getTextField('SchiP_Aktuell_1').setText(entity.system.status.fatePoints.current+'')
  form.getTextField('SchiP_BM_1').setText(entity.system.status.fatePoints.modifier+'')

  /** talents */
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
    .filter(value => value.name === name);

  var temp = Array.from(name.values(), value => value.system.talentValue.value)
  form.getTextField("Talent_FW_"+destination).setText(temp+'')


  let e_1_name = Array.from(name.values(), value => value.system.characteristic1.value)[0]
  let e_2_name = Array.from(name.values(), value => value.system.characteristic1.value)[0]
  let e_3_name = Array.from(name.values(), value => value.system.characteristic1.value)[0]
  let e_1_value =  entity.system.characteristics[e_1_name].value
  let e_2_value =  entity.system.characteristics[e_2_name].value
  let e_3_value =  entity.system.characteristics[e_3_name].value

  let routine = ""
  if (e_1_value>=13 && e_2_value>=13 && e_3_value>=13){
      if (temp[0]>=1 && temp[0]<4){ routine = "+3"}
      else if (temp[0]>=4 && temp[0]<7){ routine = "+2"}
      else if (temp[0]>=7 && temp[0]<10){ routine = "+1"}
      else if (temp[0]>=10 && temp[0]<13){ routine = "0"}
      else if (temp[0]>=13 && temp[0]<16){ routine = "-1"}
      else if (temp[0]>=16 && temp[0]<19){ routine = "-2"}
      else if (temp[0]>=19){ routine = "-3"}
  }


  form.getTextField("Talent_R_"+destination).setText(routine+'')
  }

  /** Combat */
  /** general */

  form.getTextField('LE_Max_2').setText(entity.system.status.wounds.max+'')
  form.getTextField('LE_Verlust_1').setText(Math.round(entity.system.status.wounds.max/4*3)+'')
  form.getTextField('LE_Verlust_2').setText(Math.round(entity.system.status.wounds.max/2)+'')
  form.getTextField('LE_Verlust_3').setText(Math.round(entity.system.status.wounds.max/4)+'')
  form.getTextField('LE_Verlust_4').setText(5+'')
  form.getTextField('GS_Max_1').setText(entity.system.status.speed.max+'')
  form.getTextField('AW_Max_2').setText(entity.system.status.dodge.max+'')
  form.getTextField('INI_Max_1').setText(Math.round((entity.system.characteristics.mu.value+entity.system.characteristics.ge.value)/2)+'')
  form.getTextField('AW_Max_2').setText(entity.system.status.dodge.max+'')
  form.getTextField('SK_Max_2').setText(entity.system.status.soulpower.max+'')
  form.getTextField('ZK_Max_2').setText(entity.system.status.toughness.max+'')

  /** Wepaons */
  /** combat */
  const r_Armbrüste = combat ("Armbrüste", 1, 0)
  const r_Bögen = combat ("Bögen", 2, 0)
  const r_Dolche = combat ("Dolche", 3, 1, [p_ge])
  const r_Fechtwaffen = combat ("Fechtwaffen", 4, 1, [p_ge])
  const r_Hiebwaffen = combat ("Hiebwaffen", 5, 1, [p_kk])
  const r_Kettenwaffen = combat ("Kettenwaffen", 6, 0)
  const r_Lanzen = combat ("Lanzen", 7, 1, [p_kk])
  const r_Raufen = combat ("Raufen", 8, 1, [p_ge, p_kk])
  const r_Schilde = combat ("Schilde", 9, 1, [p_kk])
  const r_Schwerter = combat ("Schwerter", 10, 1, [p_ge, p_kk])
  const r_Stangenwaffen = combat ("Stangenwaffen", 11, 1, [p_ge, p_kk])
  const r_Wurfwaffen = combat ("Wurfwaffen", 12, 0)
  const r_Zweihandhiebwaffen = combat ("Zweihandhiebwaffen", 13, 1, [p_kk])
  const r_Zweihandschwerter = combat ("Zweihandschwerter", 14, 1, [p_kk])

  function combat (name, destination, pa, Leitwert) {
    var at_fk_modifier = Math.floor((Number(entity.system.characteristics.mu.value)-8)/3);/** calculation AT/FK  */
    var name = map
    .filter(value => value.type === "combatskill")
    .filter(value => value.name === name);

  var temp1 = Array.from(name.values(), value => value.system.talentValue.value)
  form.getTextField("KT_FW_"+destination).setText(temp1+'')

  var temp2 = Array.from(name.values(), value => value.system.attack.value)
  form.getTextField("KT_AT_"+destination).setText(Number(temp1)+Number(at_fk_modifier)+'')

  if (pa === 1){
  var max_LW_bonus = Math.floor(((Math.max.apply(Math, Leitwert))-8)/3) /** calculation Leitwert bonus  */
  var temp3 = (Math.round((Array.from(name.values(), value => value.system.talentValue.value))/2)+Number(max_LW_bonus))
    form.getTextField("KT_PA_"+destination).setText(temp3+'')
    }
    return {
      r_AT: (Number(temp1)+Number(temp2)+Number(at_fk_modifier)),
      r_PA:  Number(temp3),
      };
  }

  /** combat specialability */

  const combat_specialability = map
  .filter(value => value.type === "specialability")
  .filter(value => value.system.category.value === "Combat");
  var f_combat_specialability = Array.from(combat_specialability.values(), value => value.name + ' ' + romanize(value.system.step.value)).join(", ")

  form.getTextField('Held_SF_Kampf').setText(f_combat_specialability)

  /** Coins*/

  coins("Dukaten", "D")
  coins("Silber", "S")
  coins("Heller", "H")
  coins("Kreuzer", "K")

  function coins (currency, shorten) {
    var currency = map
    .filter(value => value.name === "Money-"+shorten);
    var f_currency = Array.from(currency.values(), value => value.system.quantity.value);
    (form.getTextField('Geld_'+shorten)).setText(f_currency+'');
  }

  /** Weapons */
  /** melee weapon */

  const combat_meleeweapon = map
  .filter(value => value.type === "meleeweapon")
  .filter(value => value.system.worn.value = "true")
  .filter(value => value.system.combatskill.value !== "Schilde")
  var arrayLength = combat_meleeweapon.length;
  if (arrayLength > 4) {
    arrayLength = 4
    ui.notifications.warn("You have equipped more than 4 melee weapons! The template can only hold a maximum of 4");
  }
  for (var i = 0; i < arrayLength; i++) {
    (form.getTextField('Nahwaffe_Name_Anzeige_'+(i+1))).setText(combat_meleeweapon[i].name+'');
    (form.getTextField('Nah_Kampftechnik_Name_Anzeige_'+(i+1))).setText(combat_meleeweapon[i].system.combatskill.value+'');
    (form.getTextField('Nah_Schadensbonus_'+(i+1))).setText((combat_meleeweapon[i].system.guidevalue.value+'').toUpperCase());
    (form.getTextField('Nah_Schadensschwelle_'+(i+1))).setText(combat_meleeweapon[i].system.damageThreshold.value+'');
    (form.getTextField('Nah_TP_Wurf_'+(i+1))).setText(combat_meleeweapon[i].system.damage.value+'');
    (form.getTextField('Nah_TP_Basis_'+(i+1))).setText("");//follow up
    (form.getTextField('Nah_TP_'+(i+1))).setText("");//follow up
    (form.getTextField('Nah_AT_Mod_'+(i+1))).setText(combat_meleeweapon[i].system.atmod.value+'');
    (form.getTextField('Nah_PA_Mod_'+(i+1))).setText(combat_meleeweapon[i].system.pamod.value+'');
    var reach_translate = combat_meleeweapon[i].system.reach.value
      switch(reach_translate) {
        case "short":
          reach_translate="kurz"
          break;
        case "medium":
          reach_translate="mittel"
          break;
        case "long":
          reach_translate="lang"
          break;
        default:
        break;
      };

    (form.getTextField('Nah_Reichweite_'+(i+1))).setText(reach_translate);
    (form.getTextField('Nah_AT_'+(i+1))).setText(((eval('r_'+combat_meleeweapon[i].system.combatskill.value+'.r_AT'))+Number(combat_meleeweapon[i].system.atmod.value))+'');
    (form.getTextField('Nah_PA_'+(i+1))).setText(((eval('r_'+combat_meleeweapon[i].system.combatskill.value+'.r_PA'))+Number(combat_meleeweapon[i].system.pamod.value))+'');
    (form.getTextField('Nah_Gewicht_'+(i+1))).setText(combat_meleeweapon[i].system.weight.value+'');
  }

  /** range weapon   */

  const combat_rangeweapon = map
  .filter(value => value.type === "rangeweapon")
  .filter(value => value.system.worn.value = "true")
  var arrayLength = combat_rangeweapon.length;
  if (arrayLength > 4) {
    arrayLength = 4
    ui.notifications.warn("You have equipped more than 4 range weapons! The template can only hold a maximum of 4");
  }
  for (var i = 0; i < arrayLength; i++) {
    (form.getTextField('Fernwaffe_Name_Anzeige_'+(i+1))).setText(combat_rangeweapon[i].name+'');
    (form.getTextField('Fern_Kampftechnik_Name_Anzeige_'+(i+1))).setText(combat_rangeweapon[i].system.combatskill.value+'');
    (form.getTextField('Fern_Ladezeit_'+(i+1))).setText(combat_rangeweapon[i].system.reloadTime.value+' Runden');
    (form.getTextField('Fern_TP_'+(i+1))).setText(combat_rangeweapon[i].system.damage.value+'');
    (form.getTextField('Fern_Munition_'+(i+1))).setText(combat_rangeweapon[i].system.quantity.value+'');
    (form.getTextField('Fern_Reichweite_'+(i+1))).setText(combat_rangeweapon[i].system.reach.value+'');
    (form.getTextField('Fern_FK_'+(i+1))).setText((eval('r_'+combat_rangeweapon[i].system.combatskill.value+'.r_AT'))+'');
    (form.getTextField('Fern_Gewicht_'+(i+1))).setText(combat_rangeweapon[i].system.weight.value+'');
  }

  /** armor */

  const combat_armor = map
  .filter(value => value.type === "armor")
  .filter(value => value.system.worn.value = "true")
  var arrayLength = combat_armor.length;
  if (arrayLength > 4) {
    arrayLength = 4
    ui.notifications.warn("You have equipped more than 4 armors! The template can only hold a maximum of 4");
  }
  for (var i = 0; i < arrayLength; i++) {
    (form.getTextField('Ruestung_Name_Anzeige_'+(i+1))).setText(combat_armor[i].name+'');
    (form.getTextField('Ruestung_RS_'+(i+1))).setText(combat_armor[i].system.protection.value+'');
    (form.getTextField('Ruestung_BE_'+(i+1))).setText(combat_armor[i].system.encumbrance.value+'');
    (form.getTextField('Ruestung_Abzuege_'+(i+1))).setText(combat_armor[i].system.effect.value+'');
    (form.getTextField('Ruestung_Gewicht_'+(i+1))).setText(combat_armor[i].system.weight.value+'');
    (form.getTextField('Ruestung_Gebiet_'+(i+1))).setText("");
  }

  /** shields and parry weapon */

  const combat_shields = map
  .filter(value => value.type === "meleeweapon")
  .filter(value => value.system.worn.value = "true")
  .filter(value => value.system.combatskill.value === "Schilde")
  var arrayLength = combat_shields.length;
  if (arrayLength > 4) {
    arrayLength = 4
    ui.notifications.warn("You have equipped more than 4 shields or parry weapons! The template can only hold a maximum of 4");
  }
  for (var i = 0; i < arrayLength; i++) {
    (form.getTextField('Schild_Name_Anzeige_'+(i+1))).setText(combat_shields[i].name+'');
    (form.getTextField('Schild_SP_'+(i+1))).setText(combat_shields[i].system.structure.value+' / '+combat_shields[i].system.structure.max);
    (form.getTextField('Schild_Mod_'+(i+1))).setText('AT:'+combat_shields[i].system.atmod.value+' / PA:'+combat_shields[i].system.pamod.value);
    (form.getTextField('Schild_Gewicht_'+(i+1))).setText(combat_shields[i].system.weight.value+'');
  }

  /** Items */

  const items = map
  .filter(value => value.type === "equipment" || value.type === "meleeweapon" || value.type === "armor" || value.type === "rangeweapon" || value.type === "ammunition")
  var arrayLength = items.length;
  var sum_weight1 = 0;
  var sum_weight2 = 0;
  if (arrayLength > 72) {
    arrayLength = 72
    ui.notifications.warn("You have more than 72 items in your inventory! The template can only hold a maximum of 72");
  }
  for (var i = 0; i < arrayLength; i++) {
    if (Number(items[i].system.quantity.value) > 1) {
      var quantity = items[i].system.quantity.value + "x "
    }
    else {
      var quantity =""
    }
    (form.getTextField('Besitz_Name_'+(i+1))).setText(quantity+items[i].name+'');
    (form.getTextField('Besitz_Gewicht_'+(i+1))).setText(items[i].system.weight.value+'');
        if (i <= 36) {
      sum_weight1 = sum_weight1 + Number(items[i].system.weight.value)
    }
    else {
      sum_weight2 = sum_weight2 + Number(items[i].system.weight.value)
    }
  }
  (form.getTextField('Gewicht_1')).setText(Math.round(sum_weight1 * 100) / 100+'');
  //(form.getTextField('Gewicht_2')).setText(Math.round((sum_weight1+sum_weight2)* 100) / 100+'');
  (form.getTextField('Trag_1')).setText(Number(entity.system.characteristics.kk.value)*2+'');

  /** Mage */
  /** spells */
  const combat_spells = map
  .filter(value => (value.type === "spell"|| value.type === "ritual"))
  var arrayLength = combat_spells.length;
    if (arrayLength > 40) {
      arrayLength = 40
      ui.notifications.warn("You have more than 40 spells! The template can only hold a maximum of 40");
    }
    for (var i = 0; i < arrayLength; i++) {
      (form.getTextField('Zauber_Anzeige_'+(i+1))).setText(combat_spells[i].name+'');
      (form.getTextField('Z_Probe_'+(i+1))).setText((combat_spells[i].system.characteristic1.value).toUpperCase()+' / '+(combat_spells[i].system.characteristic2.value).toUpperCase()+' / '+(combat_spells[i].system.characteristic3.value).toUpperCase()+'');
      (form.getTextField('Z_FW_'+(i+1))).setText((combat_spells[i].system.talentValue.value+''));
      (form.getTextField('Z_AsP_'+(i+1))).setText((combat_spells[i].system.AsPCost.value+''));
      (form.getTextField('Z_ZDauer_'+(i+1))).setText((combat_spells[i].system.castingTime.value+''));
      (form.getTextField('Z_RW_'+(i+1))).setText((combat_spells[i].system.range.value+''));
      (form.getTextField('Z_WDauer_'+(i+1))).setText((combat_spells[i].system.duration.value+''));
      (form.getTextField('Z_Merkmal_'+(i+1))).setText((combat_spells[i].system.feature+''));
      (form.getTextField('Z_SF_'+(i+1))).setText((combat_spells[i].system.StF.value+''));
      (form.getTextField('Z_Wirkung_'+(i+1))).setText((combat_spells[i].system.effect.value+'').split(".")[0].split(",")[0]+"...");
      (form.getTextField('Z_Seite_'+(i+1))).setText((''));
    }

    form.getTextField('AE_Max_2').setText(entity.system.status.astralenergy.max+'')
    //form.getTextField('AE_Aktuell').setText(entity.system.status.astralenergy.current+'')
    form.getTextField('Held_Tradition_magisch').setText(entity.system.tradition.magical+'')
    form.getTextField('Leit_Magie_Ansicht').setText(Leitwert_long(entity.system.guidevalue.magical)+'')
    form.getTextField('Held_Merkmale').setText(Leitwert_long(entity.system.feature.magical)+'')

  /** magictrick */
  const combat_magictrick = map
  .filter(value => value.type === "magictrick");
  var f_combat_magictrick = Array.from(combat_magictrick.values(), value => value.name).join(", ")

  form.getTextField('Held_Tricks').setText(f_combat_magictrick)

  /** special_magic */
  const special_magic = map
  .filter(value => value.type === "specialability")
  .filter(value => value.system.category.value === "magical");
  var f_special_magic = Array.from(special_magic.values(), value => {
    let val 
    if(value.system.maxRank.value==='0' || value.system.maxRank.value===0){
      val = value.name+""
    }else{
      val = value.name+ ' ' + romanize(value.system.step.value)
    }
    return val
  }).join(", ")

  form.getTextField('Held_SF_Mag').setText(f_special_magic)

  /** Cleric */
  /** liturgy */
  const combat_liturgy = map
  .filter(value => (value.type === "liturgy" || value.type === "ceremony"))
  var arrayLength = combat_liturgy.length;
    if (arrayLength > 40) {
      arrayLength = 40
      ui.notifications.warn("You have more than 40 liturgys! The template can only hold a maximum of 40");
    }
    for (var i = 0; i < arrayLength; i++) {
      (form.getTextField('Liturgie_Anzeige_'+(i+1))).setText(combat_liturgy[i].name+'');
      (form.getTextField('L_Probe_'+(i+1))).setText((combat_liturgy[i].system.characteristic1.value).toUpperCase()+' / '+(combat_liturgy[i].system.characteristic2.value).toUpperCase()+' / '+(combat_liturgy[i].system.characteristic3.value).toUpperCase()+'');
      (form.getTextField('L_FW_'+(i+1))).setText((combat_liturgy[i].system.talentValue.value+''));
      (form.getTextField('L_KaP_'+(i+1))).setText((combat_liturgy[i].system.AsPCost.value+''));
      (form.getTextField('L_LDauer_'+(i+1))).setText((combat_liturgy[i].system.castingTime.value+''));
      (form.getTextField('L_RW_'+(i+1))).setText((combat_liturgy[i].system.range.value+''));
      (form.getTextField('L_WDauer_'+(i+1))).setText((combat_liturgy[i].system.duration.value+''));
      (form.getTextField('L_Aspekt_'+(i+1))).setText((''));
      (form.getTextField('L_SF_'+(i+1))).setText((combat_liturgy[i].system.StF.value+''));
      (form.getTextField('L_Wirkung_'+(i+1))).setText((combat_liturgy[i].system.effect.value+'').split(".")[0].split(",")[0]+"...");
      (form.getTextField('L_Seite_'+(i+1))).setText((''));
    }

    form.getTextField('KE_Max_2').setText(entity.system.status.karmaenergy.max+'')
    //form.getTextField('KE_Aktuell').setText(entity.system.status.karmaenergy.current+'')
    form.getTextField('Held_Tradition_klerikal').setText(entity.system.tradition.clerical+'')
    form.getTextField('Leit_Karma_Anzeige').setText(Leitwert_long(entity.system.guidevalue.clerical)+'')
    form.getTextField('Held_Aspekt').setText(Leitwert_long(entity.system.feature.clerical)+'')

  /** blessing */
  const combat_blessing = map
  .filter(value => value.type === "blessing");
  var f_combat_blessing = Array.from(combat_blessing.values(), value => value.name).join(", ")

  form.getTextField('Held_Segen').setText(f_combat_blessing)

  /** special_cleric */
  const special_cleric = map
  .filter(value => value.type === "specialability")
  .filter(value => value.system.category.value === "clerical");
  var f_special_cleric = Array.from(special_cleric.values(), value => {
    let val 
    if(value.system.maxRank.value==='0' || value.system.maxRank.value===0){
      val = value.name+""
    }else{
      val = value.name+ ' ' + romanize(value.system.step.value)
    }
    return val
  }).join(", ")

  form.getTextField('Held_SF_Karm').setText(f_special_cleric)

	/** set PDF Metadata for PDF*/
	pdfDoc.setTitle("DSA5-"+entity.name+".pdf created on "+today)
	pdfDoc.setSubject('https://github.com/Xeon2003/DSA5-Foundry-VTT-Char2PDF')
	pdfDoc.setProducer('DSA5 - pdfexport ' +modul_version)
	pdfDoc.setCreationDate(new Date())
	pdfDoc.setModificationDate(new Date())

	/** save filled template */
  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes], {type: "application/pdf;charset=utf-8"});
  saveAs(blob, "DSA5-"+entity.name+".pdf")
}


async function build_details(_dsa_actor_id) {
   const entity = ActorDirectory.collection.get(_dsa_actor_id);
   let map = entity.items;
   /** GENERATE Details**/
  
  let datas = []
  for(const obj  of Array.from(map.values())){
    if(['skill','meleeweapon', 'armor', 'equipment', 'money', 'combatskill'].includes(obj.type))continue

    let rule = obj.system.rule?obj.system.rule.value:""
    if (obj.system.effect){
      rule += "<br>"+obj.system.effect.value
    }

    if (["spell","ritual", "liturgy", "ceremony"].includes(obj.type)){
      let mod = ""
      if (obj.system.resistanceModifier.value!=="-"){
        mod = `(-${obj.system.resistanceModifier.value})`
      }
      
      rule+=`
        <table>
        <tr>
          <td>Probe:</td>
          <td>${(obj.system.characteristic1.value).toUpperCase()+' / '+(obj.system.characteristic2.value).toUpperCase()+' / '+(obj.system.characteristic3.value).toUpperCase()}

          ${mod}
          </td>
        </tr>
        <tr>
          <td>Zielkategorie:</td>
          <td>${obj.system.targetCategory.value}</td>
        </tr>
        <tr>
          <td>Kosten:</td>
          <td>${obj.system.AsPCostDetail.value + (!obj.system.canChangeCost.value?"!":"")}</td>
        </tr>
        <tr>
          <td>Zauberdauer:</td>
          <td>${ ["ritual", "ceremony"].includes(obj.type)? obj.system.castingTime.value+" Minuten" :obj.system.castingTime.value+" A" + (!obj.system.canChangeCastingTime.value?" !":"")} </td>
        </tr>
        <tr>
          <td>Wirkungsdauer:</td>
          <td>${obj.system.duration.value}</td>
        </tr>
        <tr>
          <td>Reichweite:</td>
          <td>${obj.system.range.value +(!obj.system.canChangeRange.value?"!":"")}</td>
        </tr>
        <tr>
          <td>Merkmal:</td>
          <td>${obj.system.feature}</td>
        </tr>
        <tr>
          <td>Steigerungsfaktor:</td>
          <td>${obj.system.StF.value}</td>
        </tr>
        <tr>
          <td>Verbreitung:</td>
          <td>${obj.system.distribution.value}</td>
        </tr>
        </table
      `
    }
    let descr= obj.system.description?.value?.split("<h3>Geste und Formel</h3>")[0]


    function getGroup(type){
      if (["spellextension", "magictrick", "blessing","liturgy", "ritual","ceremony","spell"].includes(type)){
        return "Magie / Karmal"
      }

      if (["disadvantage","advantage"].includes(type)){
        return "Vor-/Nachteile"
      }
      if (["specialability"].includes(type)){
        return "Sonderfertigkeiten"
      }
      

      return type
    }


    datas.push({
      "name":obj.name,
      "descr":descr,
      "rule":rule,
      "type":obj.type,
      "group":getGroup(obj.type)
    })

  }
  

  datas.sort((a,b)=> {
    if(a["name"] > b["name"]){
      return 1
    }else{
      return -1
    }
  })


  const groupedMap = datas.reduce(
    (entryMap, e) => entryMap.set(e.group, [...entryMap.get(e.group)||[], e]),
    new Map([["Vor-/Nachteile",[]],["Sonderfertigkeiten",[]],["Magie / Karmal",[]]])
);

  let detailsdata = ""
  for(const [key,value] of groupedMap.entries()){
    detailsdata+=`<h2 class="groupname">${key}</h2><hr>`
    for(const e of value){
      let rule = ""
      if(e["rule"]){
        rule =`
        <div>
          ${e["rule"]}
        </div>`
      }
  
      detailsdata+=`
      <div class="entry">
        <h2>${e["name"]}</h2>
        <div>
          ${e["descr"]}
        </div>
        ${rule}
      </div>
      `
    }
  }
  
  

  const style=`
    <style>
    @media print {
      .grid{
        display:block;
        column-count:2; 
        -webkit-column-count: 2;
        -moz-column-count: 2;
      }
      .groupname{
        
      }
    }

      .entry{
        display:flex;
        flex-direction: column;
        page-break-inside: avoid;
        
      }
      .entry h2{
        margin-bottom:0;
      }
      

      .grid__{
        display:grid;
        grid-template-columns: repeat(2, 1fr);
        grid-column-gap: 10px;
        grid-row-gap: 10px;
      }

    </style>
  `
  const ablob = new Blob([`<html><head>${style}</head><body><h1>Name: ${entity.name}</h1><div class="grid">${detailsdata}</div></body></html>`]);
  saveAs(ablob, "DSA5-"+entity.name+"-details.html")
}

async function build_creature_handout(_dsa_actor_id){
  /*
    Gefahr:
      LEP, TP, AKTIONEN,
  
  
  */


  const entity = ActorDirectory.collection.get(_dsa_actor_id);
   let map = entity.items;
   let sizes ={"tiny":"klein","average":"mittel","small":"klein","big":"gro&szlig;","giant":"riesig"}
   const background = await toDataUrl(dsa5char2pdf.PATH.main+"images/Wertekasten.png")
   const img = await toDataUrl(entity.img)
   let style =`
    .card{
      background-position: center center;
      background-size: 100% 100%;
      background-repeat: no-repeat;
      width: 480px;
      height: 810px;
      padding: 60px;
      -webkit-print-color-adjust: exact; 
    }
    h1{
      text-align:center;
      margin-top:20px;
    }

    ul{
      list-style:none;
      text-align: end;
      padding:0;
    }
    .img{
      width: 100%;
    height: 342px;
    background-position: top center;
    background-repeat: no-repeat;
    background-size: contain;
    -webkit-print-color-adjust: exact;
    margin-top: -10px;
    margin-bottom: -20px; 
    }
    .stats{
      display: flex;
    width: 100%;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    gap: 20px;
    }
    .simple li{
      padding-bottom:10px;
    }

    .infos li {
      padding-bottom:90px;
    }
    .values{
      display:grid;
      grid-template-columns: repeat(2, 1fr);
      margin-top:20px;
      grid-column-gap: 10px;
      grid-row-gap: 10px;
    }
    .values .data div{
      border-bottom:1px solid black;
      height:15px;
      margin-bottom:15px;
    }

    .values .descr div{
      height:15px;
      margin-bottom:15px;
      border-bottom: 1px solid transparent;
    }

   `
   const ablob = new Blob([`<html><head><style>${style}</style></head><body>
   <div class="card" style="background-image:url('${background}');">
    <h1>______________________________</h1>
    <div class="img" style="background-image:url('${img}');"></div>
    <div class="stats">
      <div>
        <div class="values">
          <div class="descr">
            <div>Gr&ouml;&szlig;e</div>
            <div>Aktionen</div>
            <div>INI</div>
            <div>GS</div>
            <div>Typus</div>
            <div>RS</div>
            <div>VW</div>
            <div>SK</div>
            <div>ZK</div>
          </div>
          <div class="data">
            <div>${sizes[entity.system.status.size.value]}</div>
            <div>${entity.system.actionCount.value}</div>
            <div>${entity.system.status.initiative.current}</div>
            <div>${entity.system.status.speed.initial}</div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
        <div>Weiter Informationen:</div>
      </div>
      <ul class="infos">
        <li>QS1:</li>
        <li>QS2:</li>
        <li>QS3+:</li>
      </ul>
    </div>
   </div>
   </body></html>`]);
   saveAs(ablob, "DSA5-"+entity.name+"-handouts.html")

}



async function build_creature_card(_dsa_actor_id){
  /*
    Gefahr:
      LEP, TP, AKTIONEN,
  
  
  */


  const entity = ActorDirectory.collection.get(_dsa_actor_id);
   let map = entity.items;
   const background = await toDataUrl(dsa5char2pdf.PATH.main+"images/Wertekasten_sl.png")
   const img = await toDataUrl(entity.img)
   let style =`
   body{
    position:relative;
    width:628px;
   }
    .card{
      background-position: top left;
    background-size: contain;
    background-repeat: no-repeat;
    /* width: 835px; */
    height: 588px;
    width: 480px;
    padding: 60px 100px 60px 60px;
    -webkit-print-color-adjust: exact;
    }
    h1{
      text-align:left;
      margin-top:0px;
    }

    ul{
      list-style:none;
      text-align: left;
      padding:0;
    }
    .img{
      background-color: #cbc9bb;
      width: 220px;
      height: 220px;
      background-size: cover;
      -webkit-print-color-adjust: exact;
      position: absolute;
      right: 1px;
      top: 8px;
      clip-path: circle(35% at 50% 50%);
      z-index: -1;
    }
    .stats{
      display: grid;
      width: 100%;
      gap: 5px;
      grid-template-columns: repeat(2, 1fr);
    }
    .simple li{
      padding-bottom:10px;
    }

    .infos li {
      padding-bottom:50px;
    }
    .attributes{
      columns: 4;
      -webkit-columns: 4;
      -moz-columns: 4;
      margin:0;
      white-space: nowrap;
    }
    .attributes2{
      columns: 2;
      -webkit-columns: 2;
      -moz-columns: 2;
      margin:0;
      white-space: nowrap;
    }
    .attributes2 li{
      width:1px;
    }
    .attributes3 {
      margin:0;
      white-space: nowrap;
    }
   `
   const ablob = new Blob([`<html><head><style>${style}</style></head><body>
   <div class="img" style="background-image:url('${img}');"></div>
   <div class="card" style="background-image:url('${background}');">
    <h1>${entity.name}</h1>
    
    <div class="stats">
      <ul class="attributes">
        <li><b>MU</b> ${entity.system.characteristics.mu.initial}</li>
        <li><b>FF</b> ${entity.system.characteristics.ff.initial}</li>
        <li><b>KL</b> ${entity.system.characteristics.kl.initial}</li>
        <li><b>GE</b> ${entity.system.characteristics.ge.initial}</li>
        <li><b>IN</b> ${entity.system.characteristics.in.initial}</li>
        <li><b>KO</b> ${entity.system.characteristics.ko.initial}</li>
        <li><b>CH</b> ${entity.system.characteristics.ch.initial}</li>
        <li><b>KK</b> ${entity.system.characteristics.kk.initial}</li>
      </ul>
      <div></div>
      <ul class="attributes">
        <li><b>LeP</b> ${entity.system.status.wounds.value}</li>
        <li><b>VW</b> ${entity.system.status.dodge.value}</li>
        <li><b>AsP</b> ${entity.system.status.astralenergy.value}</li>
        <li><b>SK</b> ${entity.system.status.soulpower.value}</li>
        <li><b>KaP</b> ${entity.system.status.karmaenergy.value}</li>
        <li><b>ZK</b> ${entity.system.status.toughness.value}</li>
        <li><b>INI</b> ${entity.system.status.initiative.current}</li>
        <li><b>GS</b> ${entity.system.status.speed.initial}</li>
      </ul>
      <div></div>
      <ul class="attributes2">
        <li><b>Aktionen</b> ${entity.system.actionCount.value}</li>
        <li><b>Anzahl</b> ${entity.system.count.value}</li>
        <li><b>Gr&ouml;&szlig;</b> ${entity.system.status.size.value}</li>
        <li><b>Typus</b> ${entity.system.creatureClass.value}</li>
        <li><b>Flucht</b> ${entity.system.flight.value}</li>
        <li><b>Verhalten</b> ${entity.system.behaviour.value}</li>

      </ul>
      <div></div>
      <ul class="attributes3">
        <li><b>Aktionen</b> ${entity.system.actionCount.value}</li>
        <li><b>Anzahl</b> ${entity.system.count.value}</li>
        <li><b>Gr&ouml;&szlig;</b> ${entity.system.status.size.value}</li>
        <li><b>Typus</b> ${entity.system.creatureClass.value}</li>
      </ul>
      <div></div>

      <div>${entity.system.specialRules.value}</div>
      <ul class="infos">
        <li>QS1:</li>
        <li>QS2:</li>
        <li>QS3+:</li>
      </ul>
    </div>
   </div>
   </body></html>`]);
   saveAs(ablob, "DSA5-"+entity.name+"-card.html")

}