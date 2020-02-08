import { KlasaMessage, KlasaClient, CommandStore } from 'klasa';
import { Items } from 'oldschooljs';
import { BotCommand } from '../../lib/BotCommand';
const options = {
    max: 1,
    time: 10000,
    errors: ['time']
};

// Crafted item, part 1/x, part 2/x, ... part n/x //
var GodswordBlade: Array<number> = [11798, 11818, 11820, 11822];
var ArmadylGodsword: Array<number> = [11802, 11810, 11798];
var BandosGodsword: Array<number> = [11804, 11812, 11798];
var SaradominGodsword: Array<number> = [11806, 11814, 11798];
var ZamorakGodsword: Array<number> = [11808, 11816, 11798];
var DragonfireShield: Array<number> = [11283, 11286];
var DragonfireWard: Array<number> = [22002, 22006];
var ElysianSpiritShield: Array<number> = [12817, 12829, 12833, 12819];
var ArcaneSpiritShield: Array<number> = [12825, 12829, 12933, 12827];
var SpectralSpiritShield: Array<number> = [12821, 12829, 12833, 12823];
var ToxicBlowpipe: Array<number> = [12924, 12922];
var SerpentineHelm: Array<number> = [12929, 12927];
var ToxicStaffofTheDead: Array<number> = [12902, 12932, 11791];
var MagmaHelm: Array<number> = [13198, 12929, 13201];
var TanzaniteHelm: Array<number> = [13196, 12929, 13200];
var PegasianBoots: Array<number> = [13237, 2577, 13229];
var HolyBook: Array<number> = [3840, 3827, 3828, 3829, 3830];
var UnholyBook: Array<number> = [3842, 3831, 3832, 3833, 3834];
var BookOfBalance: Array<number> = [3844, 3835, 3836, 3837, 3838];
var BookOfWar: Array<number> = [12608, 12613, 12614, 12615, 12616];
var BookOfLaw: Array<number> = [12610, 12617, 12618, 12619, 12620];
var BookOfDarkness: Array<number> = [12612, 12621, 12622, 12623, 12624];
var MaledictionWard: Array<number> = [11924, 11931, 11932, 11933];
var OdiumWard: Array<number> = [11926, 11928, 11929, 11930];
var StaffOfLight: Array<number> = [22296, 11791, 13256];

var Name: Array<number> = [];
var Check = [GodswordBlade, ArmadylGodsword, BandosGodsword, SaradominGodsword,
    ZamorakGodsword, DragonfireShield, DragonfireWard, ElysianSpiritShield,
    ArcaneSpiritShield, SpectralSpiritShield, ToxicBlowpipe, SerpentineHelm,
    ToxicStaffofTheDead, MagmaHelm, TanzaniteHelm, PegasianBoots, HolyBook,
    UnholyBook, BookOfBalance, BookOfWar, BookOfLaw, BookOfDarkness,
    MaledictionWard, OdiumWard, StaffOfLight];

export default class extends BotCommand {
    public constructor(
        client: KlasaClient,
        store: CommandStore,
        file: string[],
        directory: string
    ) {
        super(client, store, file, directory, {
            cooldown: 1,
            usage: '<quantity:int{1}> <itemname:...string>',
            usageDelim: ' ',
            oneAtTime: true
        });
    }
    async run(msg: KlasaMessage, [quantity, itemName]: [number, string]) {
        let re = /’/gi;
        const osItem = Items.get(itemName.replace(re, "'"));
        if (!osItem) throw `That item doesnt exist.`;

        // user input //
        if (itemName === 'godsword blade') {
            Name = GodswordBlade;
            let skillRequirements: {
                smithing: 80
            }
        }
        if (itemName === 'armadyl godsword') {
            Name = ArmadylGodsword;
        }
        if (itemName === 'bandos godsword') {
            Name = BandosGodsword;
        }
        if (itemName === 'saradomin godsword') {
            Name = SaradominGodsword;
        }
        if (itemName === 'zamorak godsword') {
            Name = ZamorakGodsword;
        }
        if (itemName === 'dragonfire shield') {
            Name = DragonfireShield;
            let skillRequirements: {
                smithing: 90
            }
        }
        if (itemName === 'dragonfire ward') {
            Name = DragonfireWard;
            let skillRequirements: {
                smithing: 90
            }
        }
        if (itemName === 'elysian spirit shield') {
            Name = ElysianSpiritShield;
            let skillRequirements: {
                smithing: 85,
                prayer: 90
            }
        }
        if (itemName === 'arcane spirit shield') {
            Name = ArcaneSpiritShield;
            let skillRequirements: {
                smithing: 85,
                prayer: 90
            }
        }
        if (itemName === 'spectral spirit shield') {
            Name = SpectralSpiritShield;
            let skillRequirements: {
                smithing: 85,
                prayer: 90
            }
        }
        if (itemName === 'toxic blowpipe') {
            Name = ToxicBlowpipe;
            let skillRequirements: {
                fletching: 53
            }
        }
        if (itemName === 'serpentine helm') {
            Name = SerpentineHelm;
            let skillRequirements: {
                fletching: 52
            }
        }
        if (itemName === 'toxic staff of the dead') {
            Name = ToxicStaffofTheDead;
            let skillRequirements: {
                crafting: 59
            }
        }
        if (itemName === 'magma helm') {
            Name = MagmaHelm;
        }
        if (itemName === 'tanzanite helm') {
            Name = TanzaniteHelm;
        }
        if (itemName === 'pegasian boots') {
            Name = PegasianBoots;
            let skillRequirements: {
                runecraft: 60,
                magic: 60
            }
        }
        if (itemName === 'holy book') {
            Name = HolyBook;
        }
        if (itemName === 'unholy book') {
            Name = UnholyBook;
        }
        if (itemName === 'book of balance') {
            Name = BookOfBalance;
        }
        if (itemName === 'book of war') {
            Name = BookOfWar;
        }
        if (itemName === 'book of law') {
            Name = BookOfLaw;
        }
        if (itemName === 'book of darkness') {
            Name = BookOfDarkness;
        }
        if (itemName === 'malediction ward') {
            Name = MaledictionWard;
        }
        if (itemName === 'odium ward') {
            Name = OdiumWard;
        }
        if (itemName === 'staff of light') {
            Name = StaffOfLight;
        }

        // only allows you to craft items on the list above //
        if (!Check.includes(Name)) {
            throw `That item isn't craftable.`;
        }

        // main code //
        for (let i = 1; i < Name.length; i++) {
            const hasItem = await msg.author.hasItem(Name[i], quantity);
            if (!hasItem) {
                throw `You dont have all required items.`;
            }
        }
        const craftMsg = await msg.channel.send(
            `${msg.author}, say \`confirm\` to craft ${quantity} ${itemName}(s).`);
        try {
            const collected = await msg.channel.awaitMessages(
                _msg =>
                    _msg.author.id === msg.author.id && _msg.content.toLowerCase() === 'confirm',
                options
            );
            if (!collected || !collected.first()) {
                throw "This shouldn't be possible...";
            }
        } catch (err) {
            return craftMsg.edit(`Cancelling craft of ${quantity}x ${itemName}(s).`);
        }
        for (let i = 1; i < Name.length; i++) {
            await msg.author.removeItemFromBank(Name[i], quantity);
        }
        await msg.author.addItemsToBank({ [Name[0]]: quantity }, false);
        msg.author.log(`crafted Quantity[${quantity}] ${itemName}(s)`);

        return msg.send(
            `Crafted ${quantity}x ${itemName}(s)`);
    }
}
