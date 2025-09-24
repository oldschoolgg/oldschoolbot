import { Amoxliatl } from './Amoxliatl.js';
import { Araxxor } from './Araxxor.js';
import { AwakenedDukeSucellus } from './AwakenedDukeSucellus.js';
import { AwakenedTheLeviathan } from './AwakenedTheLeviathan.js';
import { AwakenedTheWhisperer } from './AwakenedTheWhisperer.js';
import { AwakenedVardorvis } from './AwakenedVardorvis.js';
import Bryophyta from './Bryophyta.js';
import CommanderZilyana from './CommanderZilyana.js';
import DagannothPrime from './DagannothPrime.js';
import DagannothRex from './DagannothRex.js';
import DagannothSupreme from './DagannothSupreme.js';
import DerangedArchaeologist from './DerangedArchaeologist.js';
import { DukeSucellus } from './DukeSucellus.js';
import GeneralGraardor from './GeneralGraardor.js';
import GiantMole from './GiantMole.js';
import KalphiteQueen from './KalphiteQueen.js';
import Kreearra from './Kreearra.js';
import KrilTsutsaroth from './KrilTsutsaroth.js';
import Obor from './Obor.js';
import PhantomMuspah from './PhantomMuspah.js';
import { Branda, Eldric, RoyalTitans } from './RoyalTitans.js';
import Sarachnis from './Sarachnis.js';
import Scurrius from './Scurrius.js';
import Skotizo from './Skotizo.js';
import { allSlayerBosses } from './slayer/index.js';
import { TheHueycoatl } from './TheHueycoatl.js';
import { TheLeviathan } from './TheLeviathan.js';
import { TheWhisperer } from './TheWhisperer.js';
import { Vardorvis } from './Vardorvis.js';
import Vorkath from './Vorkath.js';
import CorporealBeast from './wildy/CorporealBeast.js';
import { allWildyBosses } from './wildy/index.js';
import Zulrah from './Zulrah.js';

export const allBosses = {
	Araxxor,
	CorporealBeast,
	DagannothPrime,
	DagannothRex,
	DagannothSupreme,
	GiantMole,
	KalphiteQueen,
	Obor,
	Sarachnis,
	Vorkath,
	Zulrah,
	CommanderZilyana,
	GeneralGraardor,
	Kreearra,
	KrilTsutsaroth,
	Bryophyta,
	Skotizo,
	DerangedArchaeologist,
	PhantomMuspah,
	DukeSucellus,
	Vardorvis,
	TheLeviathan,
	TheWhisperer,
	AwakenedDukeSucellus,
	AwakenedTheLeviathan,
	AwakenedTheWhisperer,
	AwakenedVardorvis,
	Scurrius,
	TheHueycoatl,
	Amoxliatl,
	Branda,
	Eldric,
	RoyalTitans,
	...allWildyBosses,
	...allSlayerBosses
};
