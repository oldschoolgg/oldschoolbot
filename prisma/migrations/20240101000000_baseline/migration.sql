-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "bank_sort_method_enum" AS ENUM ('value', 'alch', 'name', 'quantity', 'market');

-- CreateEnum
CREATE TYPE "GearSetupType" AS ENUM ('melee', 'range', 'mage', 'misc', 'skilling', 'wildy', 'fashion', 'other');

-- CreateEnum
CREATE TYPE "XpGainSource" AS ENUM ('TombsOfAmascut', 'BalthazarsBigBonanza', 'UnderwaterAgilityThieving', 'ChambersOfXeric', 'TheatreOfBlood', 'DepthsOfAtlantis', 'NightmareZone', 'AshSanctifier', 'OfferingBones', 'TempleTrekking', 'DarkAltar', 'OuraniaAltar', 'MotherlodeMine', 'Birdhouses', 'GuardiansOfTheRift', 'BuryingBones', 'ScatteringAshes', 'Zalcano', 'Wintertodt', 'FishingTrawler', 'Tempoross', 'TearsOfGuthix', 'ShadesOfMorton', 'PuroPuro', 'MahoganyHomes', 'AerialFishing', 'GemstoneFishing', 'CleaningHerbsWhileFarming', 'CamdozaalMining', 'CamdozaalSmithing', 'CamdozaalFishing', 'MemoryHarvest', 'GuthixianCache', 'ForestryEvents', 'TuraelsTrials', 'MonsterKilling', 'AncientMycology', 'ArchaicMining', 'BrimstoneDistillery', 'ConstructionContracts');

-- CreateEnum
CREATE TYPE "loot_track_type" AS ENUM ('Monster', 'Minigame', 'Skilling');

-- CreateEnum
CREATE TYPE "economy_transaction_type" AS ENUM ('trade', 'giveaway', 'duel', 'gri', 'gift');

-- CreateEnum
CREATE TYPE "CropUpgradeType" AS ENUM ('compost', 'supercompost', 'ultracompost');

-- CreateEnum
CREATE TYPE "activity_type_enum" AS ENUM ('Agility', 'Cooking', 'MonsterKilling', 'GroupMonsterKilling', 'ClueCompletion', 'Fishing', 'Mining', 'Smithing', 'Woodcutting', 'Questing', 'Firemaking', 'Runecraft', 'TiaraRunecraft', 'Smelting', 'Crafting', 'Burying', 'Scattering', 'Offering', 'FightCaves', 'Wintertodt', 'Tempoross', 'TitheFarm', 'Fletching', 'Pickpocket', 'Herblore', 'Hunter', 'Birdhouse', 'Alching', 'Raids', 'AnimatedArmour', 'Cyclops', 'Sawmill', 'Butler', 'Nightmare', 'Sepulchre', 'Plunder', 'FishingTrawler', 'Zalcano', 'Farming', 'Construction', 'Enchanting', 'Casting', 'GloryCharging', 'WealthCharging', 'BarbarianAssault', 'AgilityArena', 'ChampionsChallenge', 'AerialFishing', 'GemstoneFishing', 'DriftNet', 'MahoganyHomes', 'Nex', 'GnomeRestaurant', 'SoulWars', 'RoguesDenMaze', 'KalphiteKing', 'Gauntlet', 'Dungeoneering', 'CastleWars', 'MageArena', 'Collecting', 'MageTrainingArena', 'CutLeapingFish', 'MotherlodeMining', 'BlastFurnace', 'MageArena2', 'BigChompyBirdHunting', 'KingGoldemar', 'VasaMagus', 'OuraniaDeliveryService', 'DarkAltar', 'Ignecarus', 'OuraniaAltar', 'Trekking', 'KibbleMaking', 'Revenants', 'PestControl', 'VolcanicMine', 'MonkeyRumble', 'BossEvent', 'KourendFavour', 'Inferno', 'TearsOfGuthix', 'TheatreOfBlood', 'LastManStanding', 'FishingContest', 'BirthdayEvent', 'TrickOrTreat', 'TokkulShop', 'TroubleBrewing', 'PuroPuro', 'Easter', 'BaxtorianBathhouses', 'Naxxus', 'Disassembling', 'Research', 'Moktang', 'ShootingStars', 'FistOfGuthix', 'StealingCreation', 'HalloweenMiniMinigame', 'GiantsFoundry', 'GuardiansOfTheRift', 'TinkeringWorkshop', 'HalloweenEvent', 'NightmareZone', 'ShadesOfMorton', 'TombsOfAmascut', 'BalthazarsBigBonanza', 'UnderwaterAgilityThieving', 'DepthsOfAtlantis', 'StrongholdOfSecurity', 'BirthdayCollectIngredients', 'CombatRing', 'SpecificQuest', 'Mortimer', 'CamdozaalFishing', 'CamdozaalMining', 'CamdozaalSmithing', 'MemoryHarvest', 'GuthixianCache', 'TuraelsTrials', 'MyNotes', 'Colosseum', 'CreateForestersRations', 'SnoozeSpellActive', 'Buy', 'AncientMycology', 'ArchaicMining', 'BurningDominion', 'BrimstoneDistillery', 'ConstructionContracts', 'Archon');

-- CreateEnum
CREATE TYPE "xp_gains_skill_enum" AS ENUM ('agility', 'cooking', 'fishing', 'mining', 'smithing', 'woodcutting', 'firemaking', 'runecraft', 'crafting', 'prayer', 'fletching', 'farming', 'herblore', 'thieving', 'hunter', 'construction', 'magic', 'attack', 'strength', 'defence', 'ranged', 'hitpoints', 'dungeoneering', 'slayer', 'invention', 'divination');

-- CreateEnum
CREATE TYPE "tame_growth" AS ENUM ('baby', 'juvenile', 'adult');

-- CreateEnum
CREATE TYPE "AutoFarmFilterEnum" AS ENUM ('AllFarm', 'Replant');

-- CreateEnum
CREATE TYPE "GEListingType" AS ENUM ('Buy', 'Sell');

-- CreateEnum
CREATE TYPE "GiftBoxStatus" AS ENUM ('Created', 'Sent', 'Opened');

-- CreateEnum
CREATE TYPE "UserEventType" AS ENUM ('MaxXP', 'MaxTotalXP', 'MaxLevel', 'MaxTotalLevel', 'CLCompletion');

-- CreateEnum
CREATE TYPE "command_name_enum" AS ENUM ('testpotato', 'achievementdiary', 'activities', 'admin', 'aerialfish', 'gemstonefish', 'agilityarena', 'alch', 'amrod', 'ash', 'ask', 'autoequip', 'autoslay', 'bal', 'bank', 'bankbg', 'barbassault', 'bgcolor', 'bingo', 'birdhouse', 'blastfurnace', 'blowpipe', 'bossrecords', 'botleagues', 'botstats', 'bs', 'bso', 'build', 'bury', 'buy', 'ca', 'cancel', 'capegamble', 'cash', 'casket', 'cast', 'castlewars', 'cd', 'championchallenge', 'channel', 'chargeglories', 'chargewealth', 'checkmasses', 'checkpatch', 'chompyhunt', 'choose', 'chop', 'christmas', 'cl', 'claim', 'clbank', 'clue', 'clues', 'cmd', 'collect', 'collectionlog', 'combat', 'combatoptions', 'compostbin', 'config', 'cook', 'cox', 'cracker', 'craft', 'create', 'daily', 'darkaltar', 'data', 'decant', 'defaultfarming', 'defender', 'diary', 'dice', 'dicebank', 'disable', 'dmm', 'driftnet', 'drop', 'drycalc', 'drystreak', 'duel', 'easter', 'economybank', 'emotes', 'enable', 'enchant', 'equip', 'eval', 'fake', 'fakearma', 'fakebandos', 'fakeely', 'fakepm', 'fakesara', 'fakescythe', 'fakezammy', 'faq', 'farm', 'farming', 'farmingcontract', 'favalch', 'favfood', 'favorite', 'favour', 'fightcaves', 'finish', 'fish', 'fishingtrawler', 'fletch', 'gamble', 'gauntlet', 'ge', 'gear', 'gearpresets', 'gearstats', 'gift', 'github', 'giveaway', 'gnomerestaurant', 'gp', 'groupkill', 'halloween', 'hans', 'harvest', 'hcim', 'hcimdeaths', 'help', 'hiscores', 'hunt', 'inbank', 'inferno', 'info', 'invite', 'ironman', 'is', 'itemtrivia', 'jmodcomments', 'jmodtweets', 'k', 'kc', 'kcgains', 'kill', 'lamp', 'lapcount', 'laps', 'lastmanstanding', 'lb', 'leaderboard', 'leagues', 'light', 'lms', 'loot', 'love', 'luckyimp', 'luckypick', 'lvl', 'm', 'magearena', 'magearena2', 'mahoganyhomes', 'mass', 'mclue', 'mine', 'minigames', 'minion', 'minionstats', 'mix', 'monster', 'mostdrops', 'mta', 'mygiveaways', 'mypets', 'news', 'nightmare', 'offer', 'open', 'osrskc', 'patreon', 'pay', 'pestcontrol', 'pet', 'petmessages', 'petrate', 'petroll', 'pickpocket', 'ping', 'players', 'plunder', 'poh', 'poll', 'polls', 'prefix', 'price', 'pvp', 'quest', 'raid', 'randomevents', 'randquote', 'ranks', 'rc', 'redeem', 'reload', 'resetrng', 'revs', 'roguesden', 'roles', 'roll', 'rp', 'runecraft', 'runelite', 's', 'sacrifice', 'sacrificedbank', 'sacrificegp', 'sacrificelog', 'sawmill', 'seedpack', 'sell', 'sellto', 'sendtoabutton', 'sepulchre', 'server', 'setrsn', 'shutdownlock', 'simulate', 'skillcape', 'slayer', 'slayershop', 'slayertask', 'smelt', 'smith', 'soulwars', 'stats', 'steal', 'streamertweets', 'support', 'tag', 'tearsofguthix', 'tempoross', 'tithefarm', 'tithefarmshop', 'tob', 'tokkulshop', 'tools', 'trade', 'train', 'trek', 'trekshop', 'trickortreat', 'trivia', 'tweets', 'uim', 'unequip', 'unequipall', 'use', 'user', 'virtualstats', 'volcanicmine', 'warriorsguild', 'wiki', 'wintertodt', 'world', 'wt', 'wyson', 'xp', 'xpgains', 'xpto99', 'zalcano', 'completion', 'tames', 'birthday', 'bsominigames', 'dg', 'divination', 'droprate', 'dung', 'fishingcontest', 'givebox', 'giverandomitem', 'hammy', 'ic', 'igne', 'invention', 'itemcontract', 'kibble', 'kinggoldemar', 'kk', 'lottery', 'lotterybank', 'megaduck', 'mmmr', 'nex', 'nursery', 'ods', 'paint', 'pingmass', 'rates', 'slots', 'smokeylottery', 'sotw', 'spawn', 'spawnbox', 'spawnlamp', 'testershop', 'vasa', 'islandupgrade');

-- CreateEnum
CREATE TYPE "TableBankType" AS ENUM ('Bank', 'CollectionLog');

-- CreateEnum
CREATE TYPE "JsonBankType" AS ENUM ('Bank', 'CollectionLog', 'HunterCreaturesCaught', 'MonsterKCs', 'AgilityLapsCounts', 'SacrificedItems', 'OpenedItems', 'ToBCost', 'ToBLoot', 'ToACost', 'ToALoot', 'ToARaidLevels', 'ColoCost', 'ColoLoot', 'ColoKC', 'BuyCommandCost', 'BuyCommandLoot', 'CreateCommandCost', 'CreateCommandLoot', 'ShadesOfMortonCost', 'GiantFoundryCost', 'GiantFoundryLoot', 'FarmingCost', 'FarmingLoot', 'HerbsCleanedWhileFarming', 'RandomEventCompletions', 'ForestryEventsCompletions', 'PuroPuroImplingsCaught', 'PassiveImplingsCaught', 'BirdEggsOffered', 'ScatteredAshes');

-- CreateEnum
CREATE TYPE "SystemLogsType" AS ENUM ('ERROR');

-- CreateEnum
CREATE TYPE "UserLogType" AS ENUM ('CLICK_BUTTON', 'CANCEL_TRIP');

-- CreateTable
CREATE TABLE "activity" (
    "id" SERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "start_date" TIMESTAMP(6) NOT NULL,
    "finish_date" TIMESTAMP(6) NOT NULL,
    "duration" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL,
    "group_activity" BOOLEAN NOT NULL,
    "type" "activity_type_enum" NOT NULL,
    "channel_id" BIGINT,
    "data" JSONB,
    "all_user_ids" BIGINT[] DEFAULT ARRAY[]::BIGINT[],

    CONSTRAINT "activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_table" (
    "timestamp" BIGINT NOT NULL,
    "guildsCount" BIGINT,
    "membersCount" BIGINT,
    "clueTasksCount" INTEGER,
    "minigameTasksCount" INTEGER,
    "monsterTasksCount" INTEGER,
    "skillingTasksCount" INTEGER,
    "minionsCount" INTEGER,
    "ironMinionsCount" INTEGER,
    "totalSacrificed" BIGINT,
    "totalGP" BIGINT,
    "totalGeGp" BIGINT,
    "totalBigAlchGp" BIGINT,
    "dicingBank" BIGINT,
    "duelTaxBank" BIGINT,
    "dailiesAmount" BIGINT,
    "gpSellingItems" BIGINT,
    "gpPvm" BIGINT,
    "gpAlching" BIGINT,
    "gpPickpocket" BIGINT,
    "gpDice" BIGINT,
    "gpOpen" BIGINT,
    "gpDaily" BIGINT,
    "gpItemContracts" BIGINT,
    "gpLuckyPick" BIGINT,
    "gpSlots" BIGINT,
    "gpHotCold" BIGINT,

    CONSTRAINT "PK_03b59d5e1bdd2e4c466198d1fd3" PRIMARY KEY ("timestamp")
);

-- CreateTable
CREATE TABLE "clientStorage" (
    "id" VARCHAR(19) NOT NULL,
    "totalCommandsUsed" INTEGER NOT NULL DEFAULT 0,
    "prices" JSON NOT NULL DEFAULT '{}',
    "sold_items_bank" JSON NOT NULL DEFAULT '{}',
    "herblore_cost_bank" JSON NOT NULL DEFAULT '{}',
    "construction_cost_bank" JSON NOT NULL DEFAULT '{}',
    "farming_cost_bank" JSON NOT NULL DEFAULT '{}',
    "farming_loot_bank" JSON NOT NULL DEFAULT '{}',
    "buy_cost_bank" JSON NOT NULL DEFAULT '{}',
    "buy_loot_bank" JSON NOT NULL DEFAULT '{}',
    "magic_cost_bank" JSON NOT NULL DEFAULT '{}',
    "crafting_cost" JSON NOT NULL DEFAULT '{}',
    "gnome_res_cost" JSON NOT NULL DEFAULT '{}',
    "gnome_res_loot" JSON NOT NULL DEFAULT '{}',
    "rogues_den_cost" JSON NOT NULL DEFAULT '{}',
    "gauntlet_loot" JSON NOT NULL DEFAULT '{}',
    "cox_cost" JSON NOT NULL DEFAULT '{}',
    "cox_loot" JSON NOT NULL DEFAULT '{}',
    "collecting_cost" JSON NOT NULL DEFAULT '{}',
    "collecting_loot" JSON NOT NULL DEFAULT '{}',
    "mta_cost" JSON NOT NULL DEFAULT '{}',
    "bf_cost" JSON NOT NULL DEFAULT '{}',
    "mage_arena_cost" JSON NOT NULL DEFAULT '{}',
    "hunter_cost" JSON NOT NULL DEFAULT '{}',
    "hunter_loot" JSON NOT NULL DEFAULT '{}',
    "revs_cost" JSON NOT NULL DEFAULT '{}',
    "revs_loot" JSON NOT NULL DEFAULT '{}',
    "inferno_cost" JSON NOT NULL DEFAULT '{}',
    "dropped_items" JSON NOT NULL DEFAULT '{}',
    "runecraft_cost" JSON NOT NULL DEFAULT '{}',
    "smithing_cost" JSON NOT NULL DEFAULT '{}',
    "economyStats.dicingBank" INTEGER NOT NULL DEFAULT 0,
    "economyStats.duelTaxBank" INTEGER NOT NULL DEFAULT 0,
    "economyStats.dailiesAmount" INTEGER NOT NULL DEFAULT 0,
    "economyStats.itemSellTaxBank" INTEGER NOT NULL DEFAULT 0,
    "economyStats.bankBgCostBank" JSON NOT NULL DEFAULT '{}',
    "economyStats.sacrificedBank" JSON NOT NULL DEFAULT '{}',
    "economyStats.wintertodtCost" JSON NOT NULL DEFAULT '{}',
    "economyStats.wintertodtLoot" JSON NOT NULL DEFAULT '{}',
    "economyStats.fightCavesCost" JSON NOT NULL DEFAULT '{}',
    "economyStats.PVMCost" JSON NOT NULL DEFAULT '{}',
    "economyStats.thievingCost" JSON NOT NULL DEFAULT '{}',
    "gp_sell" BIGINT NOT NULL DEFAULT 0,
    "gp_pvm" BIGINT NOT NULL DEFAULT 0,
    "gp_alch" BIGINT NOT NULL DEFAULT 0,
    "gp_pickpocket" BIGINT NOT NULL DEFAULT 0,
    "gp_dice" BIGINT NOT NULL DEFAULT 0,
    "gp_open" BIGINT NOT NULL DEFAULT 0,
    "gp_daily" BIGINT NOT NULL DEFAULT 0,
    "gp_luckypick" BIGINT NOT NULL DEFAULT 0,
    "gp_slots" BIGINT NOT NULL DEFAULT 0,
    "gp_hotcold" BIGINT NOT NULL DEFAULT 0,
    "custom_prices" JSON NOT NULL DEFAULT '{}',
    "nightmare_cost" JSON NOT NULL DEFAULT '{}',
    "create_cost" JSON NOT NULL DEFAULT '{}',
    "create_loot" JSON NOT NULL DEFAULT '{}',
    "tob_cost" JSON NOT NULL DEFAULT '{}',
    "tob_loot" JSON NOT NULL DEFAULT '{}',
    "degraded_items_cost" JSON NOT NULL DEFAULT '{}',
    "tks_cost" JSON NOT NULL DEFAULT '{}',
    "tks_loot" JSON NOT NULL DEFAULT '{}',
    "disabled_commands" VARCHAR(32)[] DEFAULT ARRAY[]::VARCHAR(32)[],
    "gp_tax_balance" BIGINT NOT NULL DEFAULT 0,
    "gotr_cost" JSON NOT NULL DEFAULT '{}',
    "gotr_loot" JSON NOT NULL DEFAULT '{}',
    "gf_cost" JSON NOT NULL DEFAULT '{}',
    "gf_loot" JSON NOT NULL DEFAULT '{}',
    "nmz_cost" JSON NOT NULL DEFAULT '{}',
    "toa_cost" JSON NOT NULL DEFAULT '{}',
    "toa_loot" JSON NOT NULL DEFAULT '{}',
    "ourania_loot" JSON NOT NULL DEFAULT '{}',
    "colo_cost" JSON NOT NULL DEFAULT '{}',
    "colo_loot" JSON NOT NULL DEFAULT '{}',
    "grand_exchange_is_locked" BOOLEAN NOT NULL DEFAULT false,
    "grand_exchange_total_tax" BIGINT NOT NULL DEFAULT 0,
    "grand_exchange_tax_bank" BIGINT NOT NULL DEFAULT 0,
    "maxing_message" TEXT NOT NULL DEFAULT 'Congratulations on maxing!',
    "gp_ic" BIGINT NOT NULL DEFAULT 0,
    "double_loot_finish_time" BIGINT NOT NULL DEFAULT 0,
    "gp_pet" BIGINT NOT NULL DEFAULT 0,
    "ignecarus_cost" JSON NOT NULL DEFAULT '{}',
    "ignecarus_loot" JSON NOT NULL DEFAULT '{}',
    "kibble_cost" JSON NOT NULL DEFAULT '{}',
    "mr_cost" JSON NOT NULL DEFAULT '{}',
    "mr_loot" JSON NOT NULL DEFAULT '{}',
    "item_contract_cost" JSON NOT NULL DEFAULT '{}',
    "item_contract_loot" JSON NOT NULL DEFAULT '{}',
    "kg_cost" JSON NOT NULL DEFAULT '{}',
    "kg_loot" JSON NOT NULL DEFAULT '{}',
    "nex_cost" JSON NOT NULL DEFAULT '{}',
    "nex_loot" JSON NOT NULL DEFAULT '{}',
    "kk_cost" JSON NOT NULL DEFAULT '{}',
    "kk_loot" JSON NOT NULL DEFAULT '{}',
    "vasa_cost" JSON NOT NULL DEFAULT '{}',
    "vasa_loot" JSON NOT NULL DEFAULT '{}',
    "ods_cost" JSON NOT NULL DEFAULT '{}',
    "ods_loot" JSON NOT NULL DEFAULT '{}',
    "naxxus_loot" JSON NOT NULL DEFAULT '{}',
    "naxxus_cost" JSON NOT NULL DEFAULT '{}',
    "tame_merging_cost" JSON NOT NULL DEFAULT '{}',
    "trip_doubling_loot" JSON NOT NULL DEFAULT '{}',
    "fc_cost" JSON NOT NULL DEFAULT '{}',
    "fc_loot" JSON NOT NULL DEFAULT '{}',
    "zippy_loot" JSON NOT NULL DEFAULT '{}',
    "market_prices" JSON NOT NULL DEFAULT '{}',
    "bb_cost" JSON NOT NULL DEFAULT '{}',
    "bb_loot" JSON NOT NULL DEFAULT '{}',
    "moktang_cost" JSON NOT NULL DEFAULT '{}',
    "moktang_loot" JSON NOT NULL DEFAULT '{}',
    "doa_cost" JSON NOT NULL DEFAULT '{}',
    "doa_loot" JSON NOT NULL DEFAULT '{}',
    "lottery_is_active" BOOLEAN NOT NULL DEFAULT false,
    "items_disassembled_cost" JSON NOT NULL DEFAULT '{}',
    "invention_materials_cost" JSON NOT NULL DEFAULT '{}',
    "invention_prizes_remaining" JSON NOT NULL DEFAULT '{}',
    "clue_upgrader_loot" JSON NOT NULL DEFAULT '{}',
    "portable_tanner_loot" JSON NOT NULL DEFAULT '{}',
    "last_bso_giveaways_ping" TIMESTAMP(6),
    "last_giveaway_doubleloot" TIMESTAMP(6),
    "xmas_ironman_food_bank" JSON NOT NULL DEFAULT '{}',
    "turaels_trials_cost_bank" JSON NOT NULL DEFAULT '{}',
    "turaels_trials_loot_bank" JSON NOT NULL DEFAULT '{}',
    "dominion_cost" JSON NOT NULL DEFAULT '{}',
    "dominion_loot" JSON NOT NULL DEFAULT '{}',

    CONSTRAINT "clientStorage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buy_command_transaction" (
    "id" UUID NOT NULL,
    "date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" BIGINT NOT NULL,
    "cost_gp" BIGINT NOT NULL,
    "cost_bank_excluding_gp" JSON,
    "loot_bank" JSON,

    CONSTRAINT "buy_command_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gear_presets" (
    "user_id" VARCHAR(19) NOT NULL,
    "name" VARCHAR(24) NOT NULL,
    "two_handed" INTEGER,
    "body" INTEGER,
    "cape" INTEGER,
    "feet" INTEGER,
    "hands" INTEGER,
    "head" INTEGER,
    "legs" INTEGER,
    "neck" INTEGER,
    "ring" INTEGER,
    "shield" INTEGER,
    "weapon" INTEGER,
    "ammo" INTEGER,
    "ammo_qty" INTEGER,
    "times_equipped" INTEGER NOT NULL DEFAULT 0,
    "pinned_setup" "GearSetupType",

    CONSTRAINT "gear_presets_pkey" PRIMARY KEY ("user_id","name")
);

-- CreateTable
CREATE TABLE "giveaway" (
    "id" INTEGER NOT NULL,
    "user_id" VARCHAR(19) NOT NULL,
    "start_date" TIMESTAMP(6) NOT NULL,
    "finish_date" TIMESTAMP(6) NOT NULL,
    "duration" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL,
    "channel_id" VARCHAR(19) NOT NULL,
    "loot" JSON NOT NULL,
    "message_id" VARCHAR(19) NOT NULL,
    "reaction_id" VARCHAR(19),
    "users_entered" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "giveaway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guilds" (
    "id" VARCHAR(19) NOT NULL,
    "disabledCommands" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "petchannel" VARCHAR(19),
    "staffOnlyChannels" VARCHAR(19)[] DEFAULT ARRAY[]::VARCHAR(19)[],
    "mega_duck_location" JSON NOT NULL DEFAULT '{"x":1356,"y":209,"usersParticipated":{}}',

    CONSTRAINT "guilds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "new_users" (
    "id" VARCHAR(19) NOT NULL,
    "pizazz_points" INTEGER NOT NULL DEFAULT 0,
    "minigame_id" INTEGER,

    CONSTRAINT "new_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poh" (
    "user_id" VARCHAR(19) NOT NULL,
    "background_id" INTEGER NOT NULL DEFAULT 1,
    "altar" INTEGER,
    "throne" INTEGER,
    "mounted_cape" INTEGER,
    "mounted_fish" INTEGER,
    "mounted_head" INTEGER,
    "mounted_item" INTEGER,
    "jewellery_box" INTEGER,
    "prayer_altar" INTEGER,
    "spellbook_altar" INTEGER,
    "guard" INTEGER,
    "torch" INTEGER,
    "dungeon_decoration" INTEGER,
    "prison" INTEGER,
    "pool" INTEGER,
    "teleport" INTEGER,
    "garden_decoration" INTEGER,
    "amulet" INTEGER,

    CONSTRAINT "poh_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "slayer_tasks" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantity" SMALLINT NOT NULL,
    "quantity_remaining" SMALLINT NOT NULL,
    "slayer_master_id" SMALLINT NOT NULL,
    "monster_id" INTEGER NOT NULL,
    "skipped" BOOLEAN NOT NULL,
    "user_id" VARCHAR(19) NOT NULL,

    CONSTRAINT "slayer_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(19) NOT NULL,
    "last_command_date" TIMESTAMP(6),
    "minion_bought_date" TIMESTAMP(6),
    "minion.hasBought" BOOLEAN NOT NULL DEFAULT false,
    "minion.ironman" BOOLEAN NOT NULL DEFAULT false,
    "premium_balance_tier" INTEGER,
    "premium_balance_expiry_date" BIGINT,
    "RSN" TEXT,
    "pets" JSON NOT NULL DEFAULT '{}',
    "sacrificedValue" BIGINT NOT NULL DEFAULT 0,
    "GP" BIGINT NOT NULL DEFAULT 0,
    "QP" INTEGER NOT NULL DEFAULT 0,
    "bank" JSON NOT NULL DEFAULT '{}',
    "collectionLogBank" JSONB NOT NULL DEFAULT '{}',
    "blowpipe" JSON NOT NULL DEFAULT '{"scales":0,"dartID":null,"dartQuantity":0}',
    "slayer.unlocks" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "slayer.blocked_ids" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "slayer.last_task" INTEGER NOT NULL DEFAULT 0,
    "badges" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "bitfield" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "temp_cl" JSON NOT NULL DEFAULT '{}',
    "last_temp_cl_reset" TIMESTAMP(6),
    "minion.equippedPet" INTEGER,
    "minion.farmingContract" JSON,
    "minion.birdhouseTraps" JSON,
    "finished_quest_ids" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "minion.defaultCompostToUse" "CropUpgradeType" NOT NULL DEFAULT 'compost',
    "auto_farm_filter" "AutoFarmFilterEnum" NOT NULL DEFAULT 'AllFarm',
    "favoriteItems" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "favorite_alchables" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "favorite_food" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "favorite_bh_seeds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "minion.defaultPay" BOOLEAN NOT NULL DEFAULT false,
    "minion.icon" TEXT,
    "minion.name" TEXT,
    "bank_bg_hex" TEXT,
    "bankBackground" INTEGER NOT NULL DEFAULT 1,
    "attack_style" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "combat_options" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "slayer.remember_master" TEXT,
    "slayer.autoslay_options" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "bank_sort_method" VARCHAR(16),
    "bank_sort_weightings" JSON NOT NULL DEFAULT '{}',
    "gambling_lockout_expiry" TIMESTAMP(3),
    "icon_pack_id" TEXT,
    "skills.agility" BIGINT NOT NULL DEFAULT 0,
    "skills.cooking" BIGINT NOT NULL DEFAULT 0,
    "skills.fishing" BIGINT NOT NULL DEFAULT 0,
    "skills.mining" BIGINT NOT NULL DEFAULT 0,
    "skills.smithing" BIGINT NOT NULL DEFAULT 0,
    "skills.woodcutting" BIGINT NOT NULL DEFAULT 0,
    "skills.firemaking" BIGINT NOT NULL DEFAULT 0,
    "skills.runecraft" BIGINT NOT NULL DEFAULT 0,
    "skills.crafting" BIGINT NOT NULL DEFAULT 0,
    "skills.prayer" BIGINT NOT NULL DEFAULT 0,
    "skills.fletching" BIGINT NOT NULL DEFAULT 0,
    "skills.thieving" BIGINT NOT NULL DEFAULT 0,
    "skills.farming" BIGINT NOT NULL DEFAULT 0,
    "skills.herblore" BIGINT NOT NULL DEFAULT 0,
    "skills.hunter" BIGINT NOT NULL DEFAULT 0,
    "skills.construction" BIGINT NOT NULL DEFAULT 0,
    "skills.magic" BIGINT NOT NULL DEFAULT 0,
    "skills.ranged" BIGINT NOT NULL DEFAULT 0,
    "skills.attack" BIGINT NOT NULL DEFAULT 0,
    "skills.strength" BIGINT NOT NULL DEFAULT 0,
    "skills.defence" BIGINT NOT NULL DEFAULT 0,
    "skills.slayer" BIGINT NOT NULL DEFAULT 0,
    "skills.hitpoints" BIGINT NOT NULL DEFAULT 1154,
    "gear.melee" JSON,
    "gear.mage" JSON,
    "gear.range" JSON,
    "gear.misc" JSON,
    "gear.skilling" JSON,
    "gear.wildy" JSON,
    "gear.fashion" JSON,
    "gear.other" JSON,
    "tentacle_charges" INTEGER NOT NULL DEFAULT 0,
    "sang_charges" INTEGER NOT NULL DEFAULT 0,
    "celestial_ring_charges" INTEGER NOT NULL DEFAULT 0,
    "ash_sanctifier_charges" INTEGER NOT NULL DEFAULT 0,
    "serp_helm_charges" INTEGER NOT NULL DEFAULT 0,
    "blood_fury_charges" INTEGER NOT NULL DEFAULT 0,
    "tum_shadow_charges" INTEGER NOT NULL DEFAULT 0,
    "blood_essence_charges" INTEGER NOT NULL DEFAULT 0,
    "trident_charges" INTEGER NOT NULL DEFAULT 0,
    "venator_bow_charges" INTEGER NOT NULL DEFAULT 0,
    "scythe_of_vitur_charges" INTEGER NOT NULL DEFAULT 0,
    "lms_points" INTEGER NOT NULL DEFAULT 0,
    "volcanic_mine_points" INTEGER NOT NULL DEFAULT 0,
    "nmz_points" INTEGER NOT NULL DEFAULT 0,
    "carpenter_points" INTEGER NOT NULL DEFAULT 0,
    "zeal_tokens" INTEGER NOT NULL DEFAULT 0,
    "slayer.points" INTEGER NOT NULL DEFAULT 0,
    "completed_ca_task_ids" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "nursery" JSON,
    "selected_tame" INTEGER,
    "monkeys_fought" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "emerged_inferno_attempts" INTEGER NOT NULL DEFAULT 0,
    "skills.dungeoneering" BIGINT NOT NULL DEFAULT 0,
    "ourania_tokens" INTEGER NOT NULL DEFAULT 0,
    "total_item_contracts" INTEGER NOT NULL DEFAULT 0,
    "last_item_contract_date" BIGINT NOT NULL DEFAULT 0,
    "current_item_contract" INTEGER,
    "lastSpawnLamp" BIGINT NOT NULL DEFAULT 1,
    "last_spawn_box_date" BIGINT,
    "lastGivenBoxx" BIGINT NOT NULL DEFAULT 1,
    "dungeoneering_tokens" INTEGER NOT NULL DEFAULT 0,
    "item_contract_streak" INTEGER NOT NULL DEFAULT 0,
    "item_contract_bank" JSON NOT NULL DEFAULT '{}',
    "void_staff_charges" INTEGER NOT NULL DEFAULT 0,
    "last_patron_double_time_trigger" TIMESTAMP(6),
    "lottery_input" JSON NOT NULL DEFAULT '{}',
    "gear_template" SMALLINT NOT NULL DEFAULT 0,
    "unlocked_gear_templates" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "last_bonanza_date" TIMESTAMP(6),
    "painted_items_tuple" JSON,
    "skills.invention" BIGINT NOT NULL DEFAULT 0,
    "materials_owned" JSON NOT NULL DEFAULT '{}',
    "disassembled_items_bank" JSON NOT NULL DEFAULT '{}',
    "researched_materials_bank" JSON NOT NULL DEFAULT '{}',
    "unlocked_blueprints" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "disabled_inventions" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "bso_mystery_trail_current_step_id" INTEGER,
    "store_bitfield" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "farmingPatches.herb" JSON,
    "farmingPatches.fruit tree" JSON,
    "farmingPatches.tree" JSON,
    "farmingPatches.allotment" JSON,
    "farmingPatches.hops" JSON,
    "farmingPatches.cactus" JSON,
    "farmingPatches.bush" JSON,
    "farmingPatches.spirit" JSON,
    "farmingPatches.hardwood" JSON,
    "farmingPatches.seaweed" JSON,
    "farmingPatches.vine" JSON,
    "farmingPatches.calquat" JSON,
    "farmingPatches.redwood" JSON,
    "farmingPatches.crystal" JSON,
    "farmingPatches.celastrus" JSON,
    "farmingPatches.hespori" JSON,
    "farmingPatches.flower" JSON,
    "farmingPatches.mushroom" JSON,
    "farmingPatches.belladonna" JSON,
    "username" TEXT,
    "username_with_badges" TEXT,
    "skills.divination" BIGINT NOT NULL DEFAULT 0,
    "guthixian_cache_boosts_available" INTEGER NOT NULL DEFAULT 0,
    "disabled_portent_ids" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "smokey_lottery_tickets" JSON,
    "grinchions_caught" INTEGER NOT NULL DEFAULT 0,
    "last_giveaway_ticket_given_date" TIMESTAMP(6),
    "cl_array" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "completed_achievement_diaries" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "island_upgrades" JSONB DEFAULT '{}',
    "prismare_ring_charges" INTEGER DEFAULT 0,
    "island_contributions" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mortimer_trick" (
    "id" SERIAL NOT NULL,
    "trickster_id" VARCHAR(19) NOT NULL,
    "target_id" VARCHAR(19) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mortimer_trick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reclaimable_item" (
    "user_id" VARCHAR(19) NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "item_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "reclaimable_item_pkey" PRIMARY KEY ("user_id","key")
);

-- CreateTable
CREATE TABLE "webhook_table" (
    "channel_id" VARCHAR(19) NOT NULL,
    "webhook_id" VARCHAR(19) NOT NULL,
    "webhook_token" VARCHAR(100) NOT NULL,

    CONSTRAINT "webhook_table_pkey" PRIMARY KEY ("channel_id")
);

-- CreateTable
CREATE TABLE "xp_gains" (
    "id" SERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "skill" "xp_gains_skill_enum" NOT NULL,
    "xp" INTEGER NOT NULL,
    "artificial" BOOLEAN,
    "post_max" BOOLEAN NOT NULL DEFAULT false,
    "source" "XpGainSource",

    CONSTRAINT "xp_gains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metrics" (
    "timestamp" BIGINT NOT NULL,
    "eventLoopDelayMin" REAL NOT NULL,
    "eventLoopDelayMax" REAL NOT NULL,
    "eventLoopDelayMean" REAL NOT NULL,
    "memorySizeTotal" BIGINT NOT NULL,
    "memorySizeUsed" BIGINT NOT NULL,
    "memorySizeExternal" BIGINT NOT NULL,
    "memorySizeRSS" BIGINT NOT NULL,
    "cpuUser" REAL NOT NULL,
    "cpuSystem" REAL NOT NULL,
    "cpuPercent" REAL NOT NULL,

    CONSTRAINT "PK_dc6f197424b326d462eb953eca6" PRIMARY KEY ("timestamp")
);

-- CreateTable
CREATE TABLE "minigames" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(19) NOT NULL,
    "tithe_farm" INTEGER NOT NULL DEFAULT 0,
    "wintertodt" INTEGER NOT NULL DEFAULT 0,
    "tempoross" INTEGER NOT NULL DEFAULT 0,
    "sepulchre" INTEGER NOT NULL DEFAULT 0,
    "fishing_trawler" INTEGER NOT NULL DEFAULT 0,
    "barb_assault" INTEGER NOT NULL DEFAULT 0,
    "pyramid_plunder" INTEGER NOT NULL DEFAULT 0,
    "agility_arena" INTEGER NOT NULL DEFAULT 0,
    "champions_challenge" INTEGER NOT NULL DEFAULT 0,
    "mahogany_homes" INTEGER NOT NULL DEFAULT 0,
    "gnome_restaurant" INTEGER NOT NULL DEFAULT 0,
    "soul_wars" INTEGER NOT NULL DEFAULT 0,
    "rogues_den" INTEGER NOT NULL DEFAULT 0,
    "gauntlet" INTEGER NOT NULL DEFAULT 0,
    "corrupted_gauntlet" INTEGER NOT NULL DEFAULT 0,
    "castle_wars" INTEGER NOT NULL DEFAULT 0,
    "raids" INTEGER NOT NULL DEFAULT 0,
    "raids_challenge_mode" INTEGER NOT NULL DEFAULT 0,
    "magic_training_arena" INTEGER NOT NULL DEFAULT 0,
    "big_chompy_bird_hunting" INTEGER NOT NULL DEFAULT 0,
    "temple_trekking" INTEGER NOT NULL DEFAULT 0,
    "pest_control" INTEGER NOT NULL DEFAULT 0,
    "inferno" INTEGER NOT NULL DEFAULT 0,
    "volcanic_mine" INTEGER NOT NULL DEFAULT 0,
    "tears_of_guthix" INTEGER NOT NULL DEFAULT 0,
    "tob" INTEGER NOT NULL DEFAULT 0,
    "tob_hard" INTEGER NOT NULL DEFAULT 0,
    "lms" INTEGER NOT NULL DEFAULT 0,
    "trouble_brewing" INTEGER NOT NULL DEFAULT 0,
    "puro_puro" INTEGER NOT NULL DEFAULT 0,
    "giants_foundry" INTEGER NOT NULL DEFAULT 0,
    "guardians_of_the_rift" INTEGER NOT NULL DEFAULT 0,
    "nmz" INTEGER NOT NULL DEFAULT 0,
    "shades_of_morton" INTEGER NOT NULL DEFAULT 0,
    "tombs_of_amascut" INTEGER NOT NULL DEFAULT 0,
    "colosseum" INTEGER NOT NULL DEFAULT 0,
    "ourania_delivery_service" INTEGER NOT NULL DEFAULT 0,
    "monkey_rumble" INTEGER NOT NULL DEFAULT 0,
    "emerged_inferno" INTEGER NOT NULL DEFAULT 0,
    "fishing_contest" INTEGER NOT NULL DEFAULT 0,
    "bax_baths" INTEGER NOT NULL DEFAULT 0,
    "fist_of_guthix" INTEGER NOT NULL DEFAULT 0,
    "stealing_creation" INTEGER NOT NULL DEFAULT 0,
    "tinkering_workshop" INTEGER NOT NULL DEFAULT 0,
    "balthazars_big_bonanza" INTEGER NOT NULL DEFAULT 0,
    "depths_of_atlantis" INTEGER NOT NULL DEFAULT 0,
    "depths_of_atlantis_cm" INTEGER NOT NULL DEFAULT 0,
    "guthixian_cache" INTEGER NOT NULL DEFAULT 0,
    "turaels_trials" INTEGER NOT NULL DEFAULT 0,
    "brimstone_distillery" INTEGER NOT NULL DEFAULT 0,
    "construction_contracts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "minigames_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boss_event" (
    "id" SERIAL NOT NULL,
    "start_date" TIMESTAMP(6) NOT NULL,
    "boss_id" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL,
    "data" JSON NOT NULL,

    CONSTRAINT "boss_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tame_activity" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(19) NOT NULL,
    "start_date" TIMESTAMP(6) NOT NULL,
    "finish_date" TIMESTAMP(6) NOT NULL,
    "duration" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL,
    "type" VARCHAR NOT NULL,
    "channel_id" VARCHAR(19),
    "data" JSON NOT NULL,
    "tame_id" INTEGER NOT NULL,
    "fake_duration" INTEGER,
    "deaths" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PK_ff3610ef0ab0a39a22496e130e9" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tames" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(19) NOT NULL,
    "date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nickname" VARCHAR(64),
    "species_id" INTEGER NOT NULL,
    "growth_stage" "tame_growth" NOT NULL,
    "growth_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "max_combat_level" INTEGER NOT NULL,
    "max_artisan_level" INTEGER NOT NULL,
    "max_gatherer_level" INTEGER NOT NULL,
    "max_support_level" INTEGER NOT NULL,
    "max_total_loot" JSON NOT NULL DEFAULT '{}',
    "fed_items" JSON NOT NULL DEFAULT '{}',
    "species_variant" INTEGER NOT NULL DEFAULT 1,
    "equipped_primary" INTEGER,
    "equipped_armor" INTEGER,
    "total_cost" JSON NOT NULL DEFAULT '{}',
    "demonic_jibwings_saved_cost" JSONB NOT NULL DEFAULT '{}',
    "third_age_jibwings_loot" JSONB NOT NULL DEFAULT '{}',
    "abyssal_jibwings_loot" JSONB NOT NULL DEFAULT '{}',
    "implings_loot" JSONB NOT NULL DEFAULT '{}',
    "elder_knowledge_loot_bank" JSONB NOT NULL DEFAULT '{}',
    "last_activity_date" TIMESTAMP(6),
    "levels_from_egg_feed" INTEGER,
    "custom_icon_id" VARCHAR(19),

    CONSTRAINT "PK_1defac3bf951ca2b2de3f944702" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "command_usage" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" BIGINT NOT NULL,
    "command_name" "command_name_enum" NOT NULL,
    "is_continue" BOOLEAN NOT NULL DEFAULT false,
    "inhibited" BOOLEAN DEFAULT false,
    "is_mention_command" BOOLEAN NOT NULL DEFAULT false,
    "args" JSON,
    "channel_id" BIGINT,
    "guild_id" BIGINT,
    "continue_delta_millis" BIGINT,

    CONSTRAINT "command_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fishing_contest_catch" (
    "id" SERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "length_cm" SMALLINT NOT NULL,

    CONSTRAINT "fishing_contest_catch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loot_track" (
    "id" UUID NOT NULL,
    "key" VARCHAR(32) NOT NULL,
    "type" "loot_track_type" NOT NULL,
    "total_duration" INTEGER NOT NULL,
    "total_kc" INTEGER NOT NULL,
    "loot" JSON NOT NULL DEFAULT '{}',
    "cost" JSON NOT NULL DEFAULT '{}',
    "user_id" BIGINT,

    CONSTRAINT "loot_track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "economy_item" (
    "item_id" INTEGER NOT NULL,
    "quantity" BIGINT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "economy_item_pkey" PRIMARY KEY ("item_id","date")
);

-- CreateTable
CREATE TABLE "economy_item_banks" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bank" JSONB NOT NULL,

    CONSTRAINT "economy_item_banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lms_games" (
    "id" SERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "position" SMALLINT NOT NULL,
    "kills" SMALLINT NOT NULL,

    CONSTRAINT "lms_games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "economy_transaction" (
    "id" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sender" BIGINT NOT NULL,
    "recipient" BIGINT NOT NULL,
    "guild_id" BIGINT,
    "type" "economy_transaction_type" NOT NULL,
    "items_sent" JSON DEFAULT '{}',
    "items_received" JSON DEFAULT '{}',

    CONSTRAINT "economy_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stash_unit" (
    "stash_id" INTEGER NOT NULL,
    "user_id" BIGINT NOT NULL,
    "items_contained" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "has_built" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "user_stats" (
    "user_id" BIGINT NOT NULL,
    "sell_gp" BIGINT NOT NULL DEFAULT 0,
    "items_sold_bank" JSON NOT NULL DEFAULT '{}',
    "puropuro_implings_bank" JSON NOT NULL DEFAULT '{}',
    "passive_implings_bank" JSON NOT NULL DEFAULT '{}',
    "create_cost_bank" JSON NOT NULL DEFAULT '{}',
    "create_loot_bank" JSON NOT NULL DEFAULT '{}',
    "bird_eggs_offered_bank" JSON NOT NULL DEFAULT '{}',
    "scattered_ashes_bank" JSON NOT NULL DEFAULT '{}',
    "gf_weapons_made" JSON NOT NULL DEFAULT '{}',
    "gf_cost" JSON NOT NULL DEFAULT '{}',
    "gf_loot" JSON NOT NULL DEFAULT '{}',
    "ash_sanctifier_prayer_xp" BIGINT NOT NULL DEFAULT 0,
    "gotr_rift_searches" INTEGER NOT NULL DEFAULT 0,
    "farming_plant_cost_bank" JSON NOT NULL DEFAULT '{}',
    "farming_harvest_loot_bank" JSON NOT NULL DEFAULT '{}',
    "cl_array" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "cl_array_length" INTEGER NOT NULL DEFAULT 0,
    "bars_from_adze_bank" JSON NOT NULL DEFAULT '{}',
    "ores_from_spirits_bank" JSON NOT NULL DEFAULT '{}',
    "bars_from_klik_bank" JSON NOT NULL DEFAULT '{}',
    "portable_tanner_bank" JSON NOT NULL DEFAULT '{}',
    "clue_upgrader_bank" JSON NOT NULL DEFAULT '{}',
    "ic_cost_bank" JSON NOT NULL DEFAULT '{}',
    "ic_loot_bank" JSON NOT NULL DEFAULT '{}',
    "loot_from_zippy_bank" JSON NOT NULL DEFAULT '{}',
    "peky_loot_bank" JSON NOT NULL DEFAULT '{}',
    "obis_loot_bank" JSON NOT NULL DEFAULT '{}',
    "brock_loot_bank" JSON NOT NULL DEFAULT '{}',
    "wilvus_loot_bank" JSON NOT NULL DEFAULT '{}',
    "doug_loot_bank" JSON NOT NULL DEFAULT '{}',
    "harry_loot_bank" JSON NOT NULL DEFAULT '{}',
    "smokey_loot_bank" JSON NOT NULL DEFAULT '{}',
    "doubled_loot_bank" JSON NOT NULL DEFAULT '{}',
    "silverhawk_boots_passive_xp" BIGINT NOT NULL DEFAULT 0,
    "bonecrusher_prayer_xp" BIGINT NOT NULL DEFAULT 0,
    "ic_donations_given_bank" JSON NOT NULL DEFAULT '{}',
    "ic_donations_received_bank" JSON NOT NULL DEFAULT '{}',
    "lamped_xp" JSON NOT NULL DEFAULT '{}',
    "tame_cl_bank" JSONB NOT NULL DEFAULT '{}',
    "tinker_workshop_mats_bank" JSON NOT NULL DEFAULT '{}',
    "buy_cost_bank" JSON NOT NULL DEFAULT '{}',
    "buy_loot_bank" JSON NOT NULL DEFAULT '{}',
    "tworkshop_material_cost_bank" JSON NOT NULL DEFAULT '{}',
    "tworkshop_xp_gained" INTEGER NOT NULL DEFAULT 0,
    "shades_of_morton_cost_bank" JSON NOT NULL DEFAULT '{}',
    "gp_from_agil_pyramid" INTEGER NOT NULL DEFAULT 0,
    "random_event_completions_bank" JSON NOT NULL DEFAULT '{}',
    "death_touched_darts_used" INTEGER NOT NULL DEFAULT 0,
    "toa_attempts" INTEGER NOT NULL DEFAULT 0,
    "toa_cost" JSON NOT NULL DEFAULT '{}',
    "toa_loot" JSON NOT NULL DEFAULT '{}',
    "total_toa_points" INTEGER NOT NULL DEFAULT 0,
    "toa_raid_levels_bank" JSON NOT NULL DEFAULT '{}',
    "total_toa_duration_minutes" INTEGER NOT NULL DEFAULT 0,
    "on_task_monster_scores" JSON NOT NULL DEFAULT '{}',
    "on_task_with_mask_monster_scores" JSON NOT NULL DEFAULT '{}',
    "deaths" INTEGER NOT NULL DEFAULT 0,
    "pk_evasion_exp" INTEGER NOT NULL DEFAULT 0,
    "dice_wins" INTEGER NOT NULL DEFAULT 0,
    "dice_losses" INTEGER NOT NULL DEFAULT 0,
    "duel_losses" INTEGER NOT NULL DEFAULT 0,
    "duel_wins" INTEGER NOT NULL DEFAULT 0,
    "fight_caves_attempts" INTEGER NOT NULL DEFAULT 0,
    "firecapes_sacrificed" INTEGER NOT NULL DEFAULT 0,
    "tithe_farms_completed" INTEGER NOT NULL DEFAULT 0,
    "tithe_farm_points" INTEGER NOT NULL DEFAULT 0,
    "pest_control_points" INTEGER NOT NULL DEFAULT 0,
    "inferno_attempts" INTEGER NOT NULL DEFAULT 0,
    "infernal_cape_sacrifices" INTEGER NOT NULL DEFAULT 0,
    "tob_attempts" INTEGER NOT NULL DEFAULT 0,
    "foundry_reputation" INTEGER NOT NULL DEFAULT 0,
    "tob_hard_attempts" INTEGER NOT NULL DEFAULT 0,
    "total_cox_points" INTEGER NOT NULL DEFAULT 0,
    "honour_level" INTEGER NOT NULL DEFAULT 1,
    "high_gambles" INTEGER NOT NULL DEFAULT 0,
    "honour_points" INTEGER NOT NULL DEFAULT 0,
    "slayer_task_streak" INTEGER NOT NULL DEFAULT 0,
    "slayer_wildy_task_streak" INTEGER NOT NULL DEFAULT 0,
    "slayer_superior_count" INTEGER NOT NULL DEFAULT 0,
    "slayer_unsired_offered" INTEGER NOT NULL DEFAULT 0,
    "slayer_chewed_offered" INTEGER NOT NULL DEFAULT 0,
    "tob_cost" JSONB NOT NULL DEFAULT '{}',
    "tob_loot" JSONB NOT NULL DEFAULT '{}',
    "creature_scores" JSONB NOT NULL DEFAULT '{}',
    "monster_scores" JSONB NOT NULL DEFAULT '{}',
    "laps_scores" JSONB NOT NULL DEFAULT '{}',
    "sacrificed_bank" JSONB NOT NULL DEFAULT '{}',
    "openable_scores" JSONB NOT NULL DEFAULT '{}',
    "gp_luckypick" BIGINT NOT NULL DEFAULT 0,
    "gp_dice" BIGINT NOT NULL DEFAULT 0,
    "gp_slots" BIGINT NOT NULL DEFAULT 0,
    "gp_hotcold" BIGINT NOT NULL DEFAULT 0,
    "total_gp_traded" BIGINT NOT NULL DEFAULT 0,
    "last_daily_timestamp" BIGINT NOT NULL DEFAULT 0,
    "last_tears_of_guthix_timestamp" BIGINT NOT NULL DEFAULT 0,
    "herbs_cleaned_while_farming_bank" JSON NOT NULL DEFAULT '{}',
    "forestry_event_completions_bank" JSON NOT NULL DEFAULT '{}',
    "main_server_challenges_won" INTEGER NOT NULL DEFAULT 0,
    "doa_attempts" INTEGER NOT NULL DEFAULT 0,
    "doa_cost" JSONB NOT NULL DEFAULT '{}',
    "doa_loot" JSONB NOT NULL DEFAULT '{}',
    "doa_room_attempts_bank" JSON NOT NULL DEFAULT '{}',
    "doa_total_minutes_raided" INTEGER NOT NULL DEFAULT 0,
    "chincannon_destroyed_loot_bank" JSON NOT NULL DEFAULT '{}',
    "comp_cape_percent" DECIMAL(65,30),
    "untrimmed_comp_cape_percent" DECIMAL(65,30),
    "god_favour_bank" JSON,
    "god_items_sacrificed_bank" JSON NOT NULL DEFAULT '{}',
    "steal_cost_bank" JSON NOT NULL DEFAULT '{}',
    "steal_loot_bank" JSON NOT NULL DEFAULT '{}',
    "xp_from_graceful_portent" BIGINT NOT NULL DEFAULT 0,
    "xp_from_dungeon_portent" BIGINT NOT NULL DEFAULT 0,
    "xp_from_mining_portent" BIGINT NOT NULL DEFAULT 0,
    "xp_from_hunter_portent" BIGINT NOT NULL DEFAULT 0,
    "loot_from_rogues_portent" JSONB NOT NULL DEFAULT '{}',
    "loot_from_lucky_portent" JSONB NOT NULL DEFAULT '{}',
    "loot_destroyed_by_hunter_portent" JSONB NOT NULL DEFAULT '{}',
    "divination_loot" JSONB NOT NULL DEFAULT '{}',
    "octo_loot_bank" JSON NOT NULL DEFAULT '{}',
    "turaels_trials_cost_bank" JSON NOT NULL DEFAULT '{}',
    "turaels_trials_loot_bank" JSON NOT NULL DEFAULT '{}',
    "colo_cost" JSON NOT NULL DEFAULT '{}',
    "colo_loot" JSON NOT NULL DEFAULT '{}',
    "colo_kc_bank" JSON NOT NULL DEFAULT '{}',
    "colo_max_glory" INTEGER,
    "quivers_sacrificed" INTEGER NOT NULL DEFAULT 0,
    "recently_killed_monsters" INTEGER[] DEFAULT ARRAY[]::INTEGER[],

    CONSTRAINT "user_stats_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "farmed_crop" (
    "id" SERIAL NOT NULL,
    "user_id" VARCHAR(19) NOT NULL,
    "date_planted" TIMESTAMP(3) NOT NULL,
    "date_harvested" TIMESTAMP(3),
    "item_id" INTEGER NOT NULL,
    "quantity_planted" INTEGER NOT NULL,
    "upgrade_type" "CropUpgradeType",
    "was_autofarmed" BOOLEAN NOT NULL,
    "paid_for_protection" BOOLEAN NOT NULL,

    CONSTRAINT "farmed_crop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bot_item_sell" (
    "id" UUID NOT NULL,
    "date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "item_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "gp_received" BIGINT NOT NULL,
    "user_id" VARCHAR(19) NOT NULL,

    CONSTRAINT "bot_item_sell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pinned_trip" (
    "id" TEXT NOT NULL,
    "user_id" VARCHAR(19) NOT NULL,
    "activity_id" INTEGER NOT NULL,
    "emoji_id" VARCHAR(19),
    "activity_type" "activity_type_enum" NOT NULL,
    "data" JSON,
    "custom_name" VARCHAR(32),

    CONSTRAINT "pinned_trip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historical_data" (
    "user_id" VARCHAR(19) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cl_global_rank" SMALLINT NOT NULL,
    "cl_completion_percentage" DECIMAL(5,2) NOT NULL,
    "cl_completion_count" SMALLINT NOT NULL,
    "GP" DECIMAL(13,0) NOT NULL,
    "total_xp" DECIMAL(13,0) NOT NULL,
    "mastery_percentage" DECIMAL(5,2),
    "comp_cape_percent" DECIMAL(5,2),
    "comp_cape_percent_untrimmed" DECIMAL(5,2),

    CONSTRAINT "historical_data_pkey" PRIMARY KEY ("user_id","date")
);

-- CreateTable
CREATE TABLE "ge_listing" (
    "id" SERIAL NOT NULL,
    "type" "GEListingType" NOT NULL,
    "userfacing_id" TEXT NOT NULL,
    "user_id" VARCHAR(19),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelled_at" TIMESTAMP(3),
    "fulfilled_at" TIMESTAMP(3),
    "gp_refunded" BIGINT NOT NULL DEFAULT 0,
    "item_id" INTEGER NOT NULL,
    "asking_price_per_item" BIGINT NOT NULL,
    "total_quantity" INTEGER NOT NULL,
    "quantity_remaining" INTEGER NOT NULL,

    CONSTRAINT "ge_listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ge_transaction" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantity_bought" INTEGER NOT NULL,
    "price_per_item_before_tax" BIGINT NOT NULL,
    "price_per_item_after_tax" BIGINT NOT NULL,
    "tax_rate_percent" SMALLINT NOT NULL,
    "total_tax_paid" BIGINT NOT NULL,
    "buy_listing_id" INTEGER NOT NULL,
    "sell_listing_id" INTEGER NOT NULL,

    CONSTRAINT "ge_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ge_bank" (
    "item_id" INTEGER NOT NULL,
    "quantity" BIGINT NOT NULL,

    CONSTRAINT "ge_bank_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "bingo" (
    "id" SERIAL NOT NULL,
    "creator_id" VARCHAR(19) NOT NULL,
    "is_global" BOOLEAN NOT NULL DEFAULT false,
    "organizers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "start_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration_days" INTEGER NOT NULL,
    "team_size" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "notifications_channel_id" VARCHAR(19) NOT NULL,
    "ticket_price" BIGINT NOT NULL,
    "bingo_tiles" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "was_finalized" BOOLEAN NOT NULL DEFAULT false,
    "guild_id" VARCHAR(19) NOT NULL,
    "extra_gp" BIGINT NOT NULL DEFAULT 0,
    "trophies_apply" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "bingo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bingo_team" (
    "id" SERIAL NOT NULL,
    "bingo_id" INTEGER NOT NULL,

    CONSTRAINT "bingo_team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bingo_participant" (
    "tickets_bought" INTEGER NOT NULL,
    "bingo_id" INTEGER NOT NULL,
    "user_id" VARCHAR(19) NOT NULL,
    "bingo_team_id" INTEGER NOT NULL,
    "cl" JSON NOT NULL DEFAULT '{}'
);

-- CreateTable
CREATE TABLE "gift_box" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "GiftBoxStatus" NOT NULL,
    "name" TEXT,
    "creator_id" VARCHAR(19),
    "owner_id" VARCHAR(19),
    "items" JSON NOT NULL DEFAULT '{}',
    "is_grinch_box" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "gift_box_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portent" (
    "item_id" INTEGER NOT NULL,
    "user_id" VARCHAR(19) NOT NULL,
    "total_charges" INTEGER NOT NULL,
    "charges_remaining" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "user_event" (
    "id" UUID NOT NULL,
    "date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "type" "UserEventType" NOT NULL,
    "skill" "xp_gains_skill_enum",
    "collection_log_name" TEXT,

    CONSTRAINT "user_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "name" TEXT NOT NULL,
    "total_items" INTEGER NOT NULL,
    "counts" BOOLEAN NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "category_items" (
    "category_name" TEXT NOT NULL,
    "item_id" INTEGER NOT NULL,

    CONSTRAINT "category_items_pkey" PRIMARY KEY ("category_name","item_id")
);

-- CreateTable
CREATE TABLE "user_counter" (
    "user_id" BIGINT NOT NULL,
    "key" TEXT NOT NULL,
    "value" DECIMAL(13,3) NOT NULL,

    CONSTRAINT "user_counter_pkey" PRIMARY KEY ("user_id","key")
);

-- CreateTable
CREATE TABLE "table_bank" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "TableBankType" NOT NULL,

    CONSTRAINT "table_bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "table_bank_item" (
    "bank_id" INTEGER NOT NULL,
    "item_id" INTEGER NOT NULL,
    "quantity" BIGINT NOT NULL,

    CONSTRAINT "table_bank_item_pkey" PRIMARY KEY ("bank_id","item_id")
);

-- CreateTable
CREATE TABLE "halloween_event" (
    "user_id" VARCHAR(19) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "candy_in_bowl" INTEGER NOT NULL DEFAULT 0,
    "trick_or_treaters_seen" INTEGER NOT NULL DEFAULT 0,
    "total_candy_deposited" INTEGER NOT NULL DEFAULT 0,
    "last_trick_or_treat" TIMESTAMP(6),
    "items_waiting_for_pickup" JSON NOT NULL DEFAULT '{}',

    CONSTRAINT "halloween_event_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "json_bank" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "JsonBankType" NOT NULL,
    "bank" JSONB NOT NULL,

    CONSTRAINT "json_bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shooting_stars" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "has_been_mined" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "shooting_stars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArchonEvent" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "has_been_done" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArchonEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_logs" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "SystemLogsType" NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_logs" (
    "id" SERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "channel_id" BIGINT,
    "guild_id" BIGINT,
    "message_id" BIGINT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "UserLogType" NOT NULL,
    "data" JSONB NOT NULL,

    CONSTRAINT "user_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_user_id_completed_finish_date_idx" ON "activity"("user_id", "completed", "finish_date");

-- CreateIndex
CREATE INDEX "giveaway_completed_finish_date_idx" ON "giveaway"("completed", "finish_date");

-- CreateIndex
CREATE UNIQUE INDEX "new_users_minigame_id_key" ON "new_users"("minigame_id");

-- CreateIndex
CREATE INDEX "slayer_task_quantity_remaining" ON "slayer_tasks"("user_id", "quantity_remaining");

-- CreateIndex
CREATE INDEX "users_id_last_command_date_idx" ON "users"("id", "last_command_date");

-- CreateIndex
CREATE INDEX "users_bitfield_gin" ON "users" USING GIN ("bitfield" gin__int_ops);

-- CreateIndex
CREATE INDEX "users_clarray_gin" ON "users" USING GIN ("cl_array" gin__int_ops);

-- CreateIndex
CREATE INDEX "xp_gains_date_skill_idx" ON "xp_gains"("date", "skill");

-- CreateIndex
CREATE UNIQUE INDEX "minigames_user_id_key" ON "minigames"("user_id");

-- CreateIndex
CREATE INDEX "minigames_user_id_idx" ON "minigames"("user_id");

-- CreateIndex
CREATE INDEX "boss_event_completed_idx" ON "boss_event"("completed");

-- CreateIndex
CREATE INDEX "tame_activity_completed_idx" ON "tame_activity"("completed");

-- CreateIndex
CREATE INDEX "tame_activity_tame_id_idx" ON "tame_activity"("tame_id");

-- CreateIndex
CREATE INDEX "tames_user_id_idx" ON "tames"("user_id");

-- CreateIndex
CREATE INDEX "loot_track_key_user_id_idx" ON "loot_track"("key", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "stash_unit_stash_id_user_id_key" ON "stash_unit"("stash_id", "user_id");

-- CreateIndex
CREATE INDEX "farmed_crop_user_id_date_planted_idx" ON "farmed_crop"("user_id", "date_planted");

-- CreateIndex
CREATE INDEX "ge_listing_type_cancelled_at_fulfilled_at_user_id_item_id_a_idx" ON "ge_listing"("type", "cancelled_at", "fulfilled_at", "user_id", "item_id", "asking_price_per_item", "created_at");

-- CreateIndex
CREATE INDEX "idx_ge_listing_buy_filter_sort" ON "ge_listing"("type", "fulfilled_at", "cancelled_at", "user_id", "asking_price_per_item" DESC, "created_at");

-- CreateIndex
CREATE INDEX "idx_ge_listing_sell_filter_sort" ON "ge_listing"("type", "fulfilled_at", "cancelled_at", "user_id", "asking_price_per_item", "created_at");

-- CreateIndex
CREATE INDEX "ge_transaction_sell_listing_id_idx" ON "ge_transaction"("sell_listing_id");

-- CreateIndex
CREATE INDEX "ge_transaction_created_at_idx" ON "ge_transaction"("created_at");

-- CreateIndex
CREATE INDEX "ge_transaction_sell_listing_id_created_at_idx" ON "ge_transaction"("sell_listing_id", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "bingo_participant_user_id_bingo_id_key" ON "bingo_participant"("user_id", "bingo_id");

-- CreateIndex
CREATE INDEX "portent_user_id_idx" ON "portent"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "portent_item_id_user_id_key" ON "portent"("item_id", "user_id");

-- CreateIndex
CREATE INDEX "category_items_item_id_idx" ON "category_items"("item_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_counter_user_id_key_key" ON "user_counter"("user_id", "key");

-- CreateIndex
CREATE UNIQUE INDEX "table_bank_user_id_type_key" ON "table_bank"("user_id", "type");

-- CreateIndex
CREATE UNIQUE INDEX "json_bank_user_id_type_key" ON "json_bank"("user_id", "type");

-- CreateIndex
CREATE INDEX "shooting_stars_user_id_expires_at_idx" ON "shooting_stars"("user_id", "expires_at");

-- CreateIndex
CREATE INDEX "user_logs_user_id_date_idx" ON "user_logs"("user_id", "date");

-- AddForeignKey
ALTER TABLE "new_users" ADD CONSTRAINT "new_users_minigame_id_fkey" FOREIGN KEY ("minigame_id") REFERENCES "minigames"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slayer_tasks" ADD CONSTRAINT "FK_43bf436cc70acda1752fb6e6006" FOREIGN KEY ("user_id") REFERENCES "new_users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tame_activity" ADD CONSTRAINT "FK_aa012dd3d9d58b8acb4e2cffd4d" FOREIGN KEY ("tame_id") REFERENCES "tames"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "farmed_crop" ADD CONSTRAINT "farmed_crop_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bot_item_sell" ADD CONSTRAINT "bot_item_sell_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pinned_trip" ADD CONSTRAINT "pinned_trip_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pinned_trip" ADD CONSTRAINT "pinned_trip_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historical_data" ADD CONSTRAINT "historical_data_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ge_listing" ADD CONSTRAINT "ge_listing_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ge_transaction" ADD CONSTRAINT "ge_transaction_buy_listing_id_fkey" FOREIGN KEY ("buy_listing_id") REFERENCES "ge_listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ge_transaction" ADD CONSTRAINT "ge_transaction_sell_listing_id_fkey" FOREIGN KEY ("sell_listing_id") REFERENCES "ge_listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bingo" ADD CONSTRAINT "bingo_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bingo_team" ADD CONSTRAINT "bingo_team_bingo_id_fkey" FOREIGN KEY ("bingo_id") REFERENCES "bingo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bingo_participant" ADD CONSTRAINT "bingo_participant_bingo_id_fkey" FOREIGN KEY ("bingo_id") REFERENCES "bingo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bingo_participant" ADD CONSTRAINT "bingo_participant_bingo_team_id_fkey" FOREIGN KEY ("bingo_team_id") REFERENCES "bingo_team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bingo_participant" ADD CONSTRAINT "bingo_participant_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_box" ADD CONSTRAINT "gift_box_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gift_box" ADD CONSTRAINT "gift_box_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portent" ADD CONSTRAINT "portent_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_items" ADD CONSTRAINT "category_items_category_name_fkey" FOREIGN KEY ("category_name") REFERENCES "categories"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "table_bank_item" ADD CONSTRAINT "table_bank_item_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "table_bank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

