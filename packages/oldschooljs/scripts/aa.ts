import { Items } from "@/index.js";
import { writeFileSync } from "node:fs";

let obj = {};
const arr = Array.from(Items.values());
for (let i = 0; i < arr.length; i++) {
	obj[arr[i].id] = i + 1;
}
writeFileSync('./itemIDMap.json', JSON.stringify(obj, null, 4));
