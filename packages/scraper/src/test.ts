// @ts-expect-error
import wtf from "wtf_wikipedia";
import x from '../cache/wikiraw/1566.json' with {type: 'json'};
const infobox = x.query.pages[0].revisions[0].slots.main.content;
const rawWikiData = wtf(infobox).json();
console.log(JSON.stringify(rawWikiData, null, 4));