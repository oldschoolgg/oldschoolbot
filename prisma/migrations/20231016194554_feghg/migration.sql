-- CreateEnum
CREATE TYPE "GearSetupType" AS ENUM ('melee', 'range', 'mage', 'misc', 'skilling', 'wildy', 'fashion', 'other');

-- CreateEnum
CREATE TYPE "bank_sort_method_enum" AS ENUM ('value', 'alch', 'name', 'quantity');

-- CreateEnum
CREATE TYPE "XpGainSource" AS ENUM ('TombsOfAmascut', 'UnderwaterAgilityThieving', 'ChambersOfXeric', 'TheatreOfBlood', 'NightmareZone', 'AshSanctifier', 'OfferingBones', 'TempleTrekking', 'DarkAltar', 'MotherlodeMine', 'Birdhouses', 'GuardiansOfTheRift', 'BuryingBones', 'ScatteringAshes', 'Zalcano', 'Wintertodt', 'FishingTrawler', 'Tempoross', 'TearsOfGuthix', 'ShadesOfMorton', 'PuroPuro', 'MahoganyHomes', 'AerialFishing', 'CleaningHerbsWhileFarming');

-- CreateEnum
CREATE TYPE "loot_track_type" AS ENUM ('Monster', 'Minigame', 'Skilling');

-- CreateEnum
CREATE TYPE "economy_transaction_type" AS ENUM ('trade', 'giveaway', 'duel', 'gri');

-- CreateEnum
CREATE TYPE "CropUpgradeType" AS ENUM ('compost', 'supercompost', 'ultracompost');

-- CreateEnum
CREATE TYPE "command_usage_status" AS ENUM ('Unknown', 'Success', 'Error', 'Inhibited');

-- CreateEnum
CREATE TYPE "activity_type_enum" AS ENUM ('Agility', 'Cooking', 'MonsterKilling', 'GroupMonsterKilling', 'ClueCompletion', 'Fishing', 'Mining', 'Smithing', 'Woodcutting', 'Questing', 'Firemaking', 'Runecraft', 'TiaraRunecraft', 'Smelting', 'Crafting', 'Burying', 'Scattering', 'Offering', 'FightCaves', 'Wintertodt', 'Tempoross', 'TitheFarm', 'Fletching', 'Pickpocket', 'Herblore', 'Hunter', 'Birdhouse', 'Alching', 'AnimatedArmour', 'Cyclops', 'Sawmill', 'Butler', 'Nightmare', 'Sepulchre', 'Plunder', 'FishingTrawler', 'Zalcano', 'Farming', 'Construction', 'Enchanting', 'Casting', 'GloryCharging', 'WealthCharging', 'BarbarianAssault', 'AgilityArena', 'ChampionsChallenge', 'AerialFishing', 'DriftNet', 'MahoganyHomes', 'GnomeRestaurant', 'SoulWars', 'RoguesDenMaze', 'Gauntlet', 'CastleWars', 'MageArena', 'Raids', 'Collecting', 'MageTrainingArena', 'CutLeapingFish', 'MotherlodeMining', 'BlastFurnace', 'MageArena2', 'BigChompyBirdHunting', 'DarkAltar', 'Trekking', 'PestControl', 'VolcanicMine', 'KourendFavour', 'Inferno', 'TearsOfGuthix', 'TheatreOfBlood', 'LastManStanding', 'BirthdayEvent', 'TokkulShop', 'Nex', 'TroubleBrewing', 'PuroPuro', 'Easter', 'ShootingStars', 'GiantsFoundry', 'GuardiansOfTheRift', 'HalloweenEvent', 'NightmareZone', 'ShadesOfMorton', 'TombsOfAmascut', 'UnderwaterAgilityThieving', 'StrongholdOfSecurity', 'SpecificQuest');

-- CreateEnum
CREATE TYPE "xp_gains_skill_enum" AS ENUM ('agility', 'cooking', 'fishing', 'mining', 'smithing', 'woodcutting', 'firemaking', 'runecraft', 'crafting', 'prayer', 'fletching', 'farming', 'herblore', 'thieving', 'hunter', 'construction', 'attack', 'defence', 'strength', 'ranged', 'magic', 'hitpoints', 'slayer');

-- CreateEnum
CREATE TYPE "AutoFarmFilterEnum" AS ENUM ('AllFarm', 'Replant');

-- CreateEnum
CREATE TYPE "GEListingType" AS ENUM ('Buy', 'Sell');

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
    "channel_id" BIGINT NOT NULL,
    "data" JSON NOT NULL,

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
    "gpLuckypick" BIGINT,
    "gpSlots" BIGINT,
    "gpHotCold" BIGINT,

    CONSTRAINT "analytics_table_pkey" PRIMARY KEY ("timestamp")
);

-- CreateTable
CREATE TABLE "clientStorage" (
    "id" VARCHAR(19) NOT NULL,
    "userBlacklist" VARCHAR(19)[],
    "guildBlacklist" VARCHAR(19)[],
    "commandStats" JSON NOT NULL DEFAULT '{}',
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
    "nex_cost" JSON NOT NULL DEFAULT '{}',
    "nex_loot" JSON NOT NULL DEFAULT '{}',
    "degraded_items_cost" JSON NOT NULL DEFAULT '{}',
    "tks_cost" JSON NOT NULL DEFAULT '{}',
    "tks_loot" JSON NOT NULL DEFAULT '{}',
    "disabled_commands" VARCHAR(32)[],
    "gp_tax_balance" BIGINT NOT NULL DEFAULT 0,
    "gotr_cost" JSON NOT NULL DEFAULT '{}',
    "gotr_loot" JSON NOT NULL DEFAULT '{}',
    "gf_cost" JSON NOT NULL DEFAULT '{}',
    "gf_loot" JSON NOT NULL DEFAULT '{}',
    "nmz_cost" JSON NOT NULL DEFAULT '{}',
    "toa_cost" JSON NOT NULL DEFAULT '{}',
    "toa_loot" JSON NOT NULL DEFAULT '{}',
    "grand_exchange_is_locked" BOOLEAN NOT NULL DEFAULT false,
    "grand_exchange_total_tax" BIGINT NOT NULL DEFAULT 0,
    "grand_exchange_tax_bank" BIGINT NOT NULL DEFAULT 0,

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
    "emoji_id" VARCHAR(19),
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
    "users_entered" TEXT[],

    CONSTRAINT "giveaway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guilds" (
    "id" VARCHAR(19) NOT NULL,
    "disabledCommands" TEXT[],
    "jmodComments" VARCHAR(19),
    "petchannel" VARCHAR(19),
    "tweetchannel" VARCHAR(19),
    "staffOnlyChannels" VARCHAR(19)[],

    CONSTRAINT "guilds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "new_users" (
    "id" VARCHAR(19) NOT NULL,
    "username" VARCHAR(32),
    "pizazz_points" INTEGER NOT NULL DEFAULT 0,
    "minigame_id" INTEGER,

    CONSTRAINT "new_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pingable_roles" (
    "id" SERIAL NOT NULL,
    "role_id" VARCHAR(19) NOT NULL,
    "name" VARCHAR(32) NOT NULL,

    CONSTRAINT "pingable_roles_pkey" PRIMARY KEY ("id")
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
    "ironman_alts" TEXT[],
    "main_account" TEXT,
    "slayer.unlocks" INTEGER[],
    "slayer.blocked_ids" INTEGER[],
    "slayer.last_task" INTEGER NOT NULL DEFAULT 0,
    "badges" INTEGER[],
    "bitfield" INTEGER[],
    "temp_cl" JSON NOT NULL DEFAULT '{}',
    "last_temp_cl_reset" TIMESTAMP(6),
    "minion.equippedPet" INTEGER,
    "minion.farmingContract" JSON,
    "minion.birdhouseTraps" JSON,
    "finished_quest_ids" INTEGER[],
    "minion.defaultCompostToUse" "CropUpgradeType" NOT NULL DEFAULT E'compost',
    "auto_farm_filter" "AutoFarmFilterEnum" NOT NULL DEFAULT E'AllFarm',
    "favoriteItems" INTEGER[],
    "favorite_alchables" INTEGER[],
    "favorite_food" INTEGER[],
    "minion.defaultPay" BOOLEAN NOT NULL DEFAULT false,
    "minion.icon" TEXT,
    "minion.name" TEXT,
    "bank_bg_hex" TEXT,
    "bankBackground" INTEGER NOT NULL DEFAULT 1,
    "attack_style" TEXT[],
    "combat_options" INTEGER[],
    "slayer.remember_master" TEXT,
    "slayer.autoslay_options" INTEGER[],
    "bank_sort_method" VARCHAR(16),
    "bank_sort_weightings" JSON NOT NULL DEFAULT '{}',
    "gambling_lockout_expiry" TIMESTAMP(3),
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
    "scythe_of_vitur_charges" INTEGER NOT NULL DEFAULT 0,
    "lms_points" INTEGER NOT NULL DEFAULT 0,
    "volcanic_mine_points" INTEGER NOT NULL DEFAULT 0,
    "nmz_points" INTEGER NOT NULL DEFAULT 0,
    "carpenter_points" INTEGER NOT NULL DEFAULT 0,
    "zeal_tokens" INTEGER NOT NULL DEFAULT 0,
    "slayer.points" INTEGER NOT NULL DEFAULT 0,
    "completed_ca_task_ids" INTEGER[],
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
    "kourend_favour" JSON,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
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
    "qps" REAL,
    "prisma_query_total_queries" INTEGER,
    "prisma_pool_active_connections" INTEGER,
    "prisma_pool_idle_connections" INTEGER,
    "prisma_pool_wait_count" INTEGER,
    "prisma_query_active_transactions" INTEGER,

    CONSTRAINT "metrics_pkey" PRIMARY KEY ("timestamp")
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

    CONSTRAINT "minigames_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "command_usage" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" BIGINT NOT NULL,
    "command_name" VARCHAR(32) NOT NULL,
    "status" "command_usage_status" NOT NULL DEFAULT E'Unknown',
    "is_continue" BOOLEAN NOT NULL DEFAULT false,
    "flags" JSONB,
    "inhibited" BOOLEAN DEFAULT false,
    "is_mention_command" BOOLEAN NOT NULL DEFAULT false,
    "args" JSON,
    "channel_id" BIGINT,
    "guild_id" BIGINT,
    "continue_delta_millis" BIGINT,

    CONSTRAINT "command_usage_pkey" PRIMARY KEY ("id")
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
    "items_contained" INTEGER[],
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
    "cl_array" INTEGER[],
    "cl_array_length" INTEGER NOT NULL DEFAULT 0,
    "buy_cost_bank" JSON NOT NULL DEFAULT '{}',
    "buy_loot_bank" JSON NOT NULL DEFAULT '{}',
    "shades_of_morton_cost_bank" JSON NOT NULL DEFAULT '{}',
    "gp_from_agil_pyramid" INTEGER NOT NULL DEFAULT 0,
    "random_event_completions_bank" JSON NOT NULL DEFAULT '{}',
    "toa_attempts" INTEGER NOT NULL DEFAULT 0,
    "toa_cost" JSON NOT NULL DEFAULT '{}',
    "toa_loot" JSON NOT NULL DEFAULT '{}',
    "total_toa_points" INTEGER NOT NULL DEFAULT 0,
    "toa_raid_levels_bank" JSON NOT NULL DEFAULT '{}',
    "total_toa_duration_minutes" INTEGER NOT NULL DEFAULT 0,
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
    "organizers" TEXT[],
    "start_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration_days" INTEGER NOT NULL,
    "team_size" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "notifications_channel_id" VARCHAR(19) NOT NULL,
    "ticket_price" BIGINT NOT NULL,
    "bingo_tiles" JSONB[],
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

-- CreateIndex
CREATE UNIQUE INDEX "activity_id_key" ON "activity"("id");

-- CreateIndex
CREATE INDEX "activity_user_id_finish_date_idx" ON "activity"("user_id", "finish_date");

-- CreateIndex
CREATE INDEX "activity_group_activity_idx" ON "activity"("group_activity");

-- CreateIndex
CREATE INDEX "activity_completed_idx" ON "activity"("completed");

-- CreateIndex
CREATE INDEX "activity_user_id_type_idx" ON "activity"("user_id", "type");

-- CreateIndex
CREATE INDEX "activity_finish_date_idx" ON "activity"("finish_date");

-- CreateIndex
CREATE INDEX "giveaway_completed_finish_date_idx" ON "giveaway"("completed", "finish_date");

-- CreateIndex
CREATE UNIQUE INDEX "new_users_minigame_id_key" ON "new_users"("minigame_id");

-- CreateIndex
CREATE UNIQUE INDEX "pingable_roles_role_id_key" ON "pingable_roles"("role_id");

-- CreateIndex
CREATE INDEX "slayer_tasks_user_id_quantity_remaining_idx" ON "slayer_tasks"("user_id", "quantity_remaining");

-- CreateIndex
CREATE INDEX "users_id_last_command_date_idx" ON "users"("id", "last_command_date");

-- CreateIndex
CREATE UNIQUE INDEX "reclaimable_item_user_id_key_key" ON "reclaimable_item"("user_id", "key");

-- CreateIndex
CREATE INDEX "xp_gains_date_skill_idx" ON "xp_gains"("date", "skill");

-- CreateIndex
CREATE UNIQUE INDEX "minigames_user_id_key" ON "minigames"("user_id");

-- CreateIndex
CREATE INDEX "minigames_user_id_idx" ON "minigames"("user_id");

-- CreateIndex
CREATE INDEX "loot_track_key_user_id_idx" ON "loot_track"("key", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "stash_unit_stash_id_user_id_key" ON "stash_unit"("stash_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "ge_listing_id_key" ON "ge_listing"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ge_transaction_id_key" ON "ge_transaction"("id");

-- CreateIndex
CREATE INDEX "ge_transaction_sell_listing_id_idx" ON "ge_transaction"("sell_listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "bingo_id_key" ON "bingo"("id");

-- CreateIndex
CREATE UNIQUE INDEX "bingo_team_id_key" ON "bingo_team"("id");

-- CreateIndex
CREATE UNIQUE INDEX "bingo_participant_user_id_bingo_id_key" ON "bingo_participant"("user_id", "bingo_id");

-- AddForeignKey
ALTER TABLE "new_users" ADD CONSTRAINT "new_users_minigame_id_fkey" FOREIGN KEY ("minigame_id") REFERENCES "minigames"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slayer_tasks" ADD CONSTRAINT "slayer_tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "new_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "ge_transaction" ADD CONSTRAINT "ge_transaction_buy_listing_id_fkey" FOREIGN KEY ("buy_listing_id") REFERENCES "ge_listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ge_transaction" ADD CONSTRAINT "ge_transaction_sell_listing_id_fkey" FOREIGN KEY ("sell_listing_id") REFERENCES "ge_listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bingo" ADD CONSTRAINT "bingo_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bingo_team" ADD CONSTRAINT "bingo_team_bingo_id_fkey" FOREIGN KEY ("bingo_id") REFERENCES "bingo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bingo_participant" ADD CONSTRAINT "bingo_participant_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bingo_participant" ADD CONSTRAINT "bingo_participant_bingo_id_fkey" FOREIGN KEY ("bingo_id") REFERENCES "bingo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bingo_participant" ADD CONSTRAINT "bingo_participant_bingo_team_id_fkey" FOREIGN KEY ("bingo_team_id") REFERENCES "bingo_team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
