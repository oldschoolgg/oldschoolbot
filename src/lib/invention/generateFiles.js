const disassemblyData = require('./disassembly.json');
const fs = require('fs');
const osjs = require('oldschooljs').Items;

function itemNameFromID(itemID) {
  return osjs.get(itemID)?.name
}

const fileBase = `import { DisassemblySourceGroup } from "..";
import getOSItem from '../../util/getOSItem';
const i = getOSItem;

export const Ores: DisassemblySourceGroup = {
	name: 'Ores',
	items: [],
	parts: {}
};

export default Ores;
`

const completedFiles = [];

const regexp = /([a-zA-Z]+)(\[[0-9]\])?(\{[0-9]+\/[0-9]+?\})?/

for (let key of Object.keys(disassemblyData)) {
  const groupData = disassemblyData[key];

  let currentFile = fileBase.toString();
  let splitName = key.split(' ');
  
  if ( /[0-9]+/.test(splitName[0][0]) ) {
    const numberedPart = splitName.shift();
    splitName.push(numberedPart);
  }
  let fixedName = splitName.map((name) => name.slice(0, 1).toUpperCase() + name.slice(1)).join('').replace("(u)", "Unstrung");
  
  currentFile = currentFile.replace(/Ores/g, fixedName);

  const items = groupData.items.map((item) => {
    let completeLine = `{ item: i("${itemNameFromID(item.id)}"), lvl: ${item.level}, partQuantity: ${groupData.compqty}`;
    const special = item.special;
    // "crystal{85/115},seren[1]{15/115},faceted[1]{15/115}"
    if (special !== undefined) {
      completeLine += `, special: { always: ${item.alwaysSpecial === "yes" ? "true" : "false"}, parts: [`;
      const splt = special.split(',');
      for (let part of splt) {
        const match = part.match(regexp);
        completeLine += `{ type: "${match[1]}", `;
        let chance = match[3] ? match[3].replace('{', '').replace('}', '') : "100";
        if (chance.includes('/')) {
          const splitChance = chance.split('/');
          chance = Math.round((splitChance[0] / splitChance[1]) * 100);
        }
        completeLine += `chance: ${chance}, `;
        const amount = match[2] ? match[2].replace('[', '').replace(']', '') : groupData.compqty;
        completeLine += `amount: ${amount} }, \n`;
      }
      completeLine += "] }";
    }

    completeLine += " },";
    return completeLine;
  });

  currentFile = currentFile.replace('items: []', `items: [${items.join('')}]`);

  const chanceOutput = [];
  if (groupData.chances) {
    // {
    //   "stunning": 3,
    //   "head": 30,
    //   "_total": 100,
    //   "_master_modifier": 0.9938144329896907,
    //   "base": 40,
    //   "spiked": 27
    // }
    for ( let chanceKey of Object.keys(groupData.chances) ) {
      if ( ["_total", "_master_modifier"].includes(chanceKey)) continue;
      chanceOutput.push(`${chanceKey}: ${groupData.chances[chanceKey]}`);
    }
  } else {
    for ( let part of groupData.often ) {
      chanceOutput.push(`${part}: 0`);
    };
    if ( groupData.rarely ) {
      for ( let part of groupData.rarely ) {
        chanceOutput.push(`${part}: 0`)
      }  
    }
    
  };

  if ( chanceOutput.length > 0 ) {
    currentFile = currentFile.replace('parts: {}', `parts: {${chanceOutput.join(', ')}}`)
  }

  fs.writeFileSync(`./groups/${fixedName}.ts`, currentFile);

  completedFiles.push(fixedName);

}

let indexFile = ``;
for ( let completedFile of completedFiles ) {
  indexFile += `import ${completedFile} from './${completedFile}';\n`;
}
indexFile += `\n\n export default [${completedFiles.join(', ')}];`
fs.writeFileSync('./groups/index.ts', indexFile)