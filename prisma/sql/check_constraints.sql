-- User
SELECT add_constraint('users', 'users_gp', 'CHECK ("GP" >= 0)');
SELECT add_constraint('users', 'users_qp', 'CHECK ("QP" >= 0)');
SELECT add_constraint('users', 'chk_tentacle_charges_bounds', 'CHECK (tentacle_charges >= 0)');
SELECT add_constraint('users', 'chk_sang_charges_bounds', 'CHECK (sang_charges >= 0)');
SELECT add_constraint('users', 'chk_celestial_ring_charges_bounds', 'CHECK (celestial_ring_charges >= 0)');
SELECT add_constraint('users', 'chk_ash_sanctifier_charges_bounds', 'CHECK (ash_sanctifier_charges >= 0)');
SELECT add_constraint('users', 'chk_serp_helm_charges_bounds', 'CHECK (serp_helm_charges >= 0)');
SELECT add_constraint('users', 'chk_blood_fury_charges_bounds', 'CHECK (blood_fury_charges >= 0)');
SELECT add_constraint('users', 'chk_tum_shadow_charges_bounds', 'CHECK (tum_shadow_charges >= 0)');
SELECT add_constraint('users', 'chk_blood_essence_charges_bounds', 'CHECK (blood_essence_charges >= 0)');
SELECT add_constraint('users', 'chk_trident_charges_bounds', 'CHECK (trident_charges >= 0)');
SELECT add_constraint('users', 'chk_venator_bow_charges_bounds', 'CHECK (venator_bow_charges >= 0)');
SELECT add_constraint('users', 'chk_scythe_of_vitur_charges_bounds','CHECK (scythe_of_vitur_charges >= 0)');
SELECT add_constraint('users', 'chk_lms_points_bounds', 'CHECK (lms_points >= 0)');
SELECT add_constraint('users', 'chk_volcanic_mine_points_bounds', 'CHECK (volcanic_mine_points >= 0)');
SELECT add_constraint('users', 'chk_nmz_points_bounds', 'CHECK (nmz_points >= 0)');
SELECT add_constraint('users', 'chk_carpenter_points_bounds', 'CHECK (carpenter_points >= 0)');
SELECT add_constraint('users', 'chk_zeal_tokens_bounds', 'CHECK (zeal_tokens >= 0)');
SELECT add_constraint('users', 'chk_slayer_points_bounds', 'CHECK ("slayer.points" >= 0)');

-- User (Skills)
SELECT add_constraint('users', 'agility_bounds', 'CHECK ("skills.agility" BETWEEN 0 AND 200000000)');
SELECT add_constraint('users', 'cooking_bounds', 'CHECK ("skills.cooking" BETWEEN 0 AND 200000000)');
SELECT add_constraint('users', 'fishing_bounds', 'CHECK ("skills.fishing" BETWEEN 0 AND 200000000)');
SELECT add_constraint('users', 'mining_bounds', 'CHECK ("skills.mining" BETWEEN 0 AND 200000000)');
SELECT add_constraint('users', 'smithing_bounds', 'CHECK ("skills.smithing" BETWEEN 0 AND 200000000)');
SELECT add_constraint('users', 'woodcutting_bounds', 'CHECK ("skills.woodcutting" BETWEEN 0 AND 200000000)');
SELECT add_constraint('users', 'firemaking_bounds', 'CHECK ("skills.firemaking" BETWEEN 0 AND 200000000)');
SELECT add_constraint('users', 'runecraft_bounds', 'CHECK ("skills.runecraft" BETWEEN 0 AND 200000000)');
SELECT add_constraint('users', 'crafting_bounds', 'CHECK ("skills.crafting" BETWEEN 0 AND 200000000)');
SELECT add_constraint('users', 'prayer_bounds', 'CHECK ("skills.prayer" BETWEEN 0 AND 200000000)');
SELECT add_constraint('users', 'fletching_bounds', 'CHECK ("skills.fletching" BETWEEN 0 AND 200000000)');
SELECT add_constraint('users', 'farming_bounds', 'CHECK ("skills.farming" BETWEEN 0 AND 200000000)');
SELECT add_constraint('users', 'herblore_bounds', 'CHECK ("skills.herblore" BETWEEN 0 AND 200000000)');
SELECT add_constraint('users', 'thieving_bounds', 'CHECK ("skills.thieving" BETWEEN 0 AND 200000000)');
SELECT add_constraint('users', 'hunter_bounds', 'CHECK ("skills.hunter" BETWEEN 0 AND 200000000)');
SELECT add_constraint('users', 'construction_bounds', 'CHECK ("skills.construction" BETWEEN 0 AND 200000000)');
SELECT add_constraint('users', 'magic_bounds', 'CHECK ("skills.magic" BETWEEN 0 AND 200000000)');
SELECT add_constraint('users', 'attack_bounds', 'CHECK ("skills.attack" BETWEEN 0 AND 200000000)');
SELECT add_constraint('users', 'strength_bounds', 'CHECK ("skills.strength" BETWEEN 0 AND 200000000)');
SELECT add_constraint('users', 'defence_bounds', 'CHECK ("skills.defence" BETWEEN 0 AND 200000000)');
SELECT add_constraint('users', 'ranged_bounds', 'CHECK ("skills.ranged" BETWEEN 0 AND 200000000)');
SELECT add_constraint('users', 'hitpoints_bounds', 'CHECK ("skills.hitpoints" BETWEEN 0 AND 200000000)');
SELECT add_constraint('users', 'slayer_bounds', 'CHECK ("skills.slayer" BETWEEN 0 AND 200000000)');

-- User Stats
SELECT add_constraint('user_stats', 'user_stats_deaths_bounds', 'CHECK (deaths >= 0)');
SELECT add_constraint('user_stats', 'user_stats_pk_evasion_exp_bounds', 'CHECK (pk_evasion_exp >= 0)');
SELECT add_constraint('user_stats', 'user_stats_dice_wins_bounds', 'CHECK (dice_wins >= 0)');
SELECT add_constraint('user_stats', 'user_stats_dice_losses_bounds', 'CHECK (dice_losses >= 0)');
SELECT add_constraint('user_stats', 'user_stats_duel_losses_bounds', 'CHECK (duel_losses >= 0)');
SELECT add_constraint('user_stats', 'user_stats_duel_wins_bounds', 'CHECK (duel_wins >= 0)');
SELECT add_constraint('user_stats', 'user_stats_fight_caves_attempts_bounds', 'CHECK (fight_caves_attempts >= 0)');
SELECT add_constraint('user_stats', 'user_stats_firecapes_sacrificed_bounds', 'CHECK (firecapes_sacrificed >= 0)');
SELECT add_constraint('user_stats', 'user_stats_tithe_farms_completed_bounds', 'CHECK (tithe_farms_completed >= 0)');
SELECT add_constraint('user_stats', 'user_stats_tithe_farm_points_bounds', 'CHECK (tithe_farm_points >= 0)');
SELECT add_constraint('user_stats', 'user_stats_pest_control_points_bounds', 'CHECK (pest_control_points >= 0)');
SELECT add_constraint('user_stats', 'user_stats_inferno_attempts_bounds', 'CHECK (inferno_attempts >= 0)');
SELECT add_constraint('user_stats', 'user_stats_infernal_cape_sacrifices_bounds', 'CHECK (infernal_cape_sacrifices >= 0)');
SELECT add_constraint('user_stats', 'user_stats_tob_attempts_bounds', 'CHECK (tob_attempts >= 0)');
SELECT add_constraint('user_stats', 'user_stats_foundry_reputation_bounds', 'CHECK (foundry_reputation >= 0)');
SELECT add_constraint('user_stats', 'user_stats_tob_hard_attempts_bounds', 'CHECK (tob_hard_attempts >= 0)');
SELECT add_constraint('user_stats', 'user_stats_total_cox_points_bounds', 'CHECK (total_cox_points >= 0)');
SELECT add_constraint('user_stats', 'user_stats_honour_level_bounds', 'CHECK (honour_level >= 0)');
SELECT add_constraint('user_stats', 'user_stats_high_gambles_bounds', 'CHECK (high_gambles >= 0)');
SELECT add_constraint('user_stats', 'user_stats_honour_points_bounds', 'CHECK (honour_points >= 0)');
SELECT add_constraint('user_stats', 'user_stats_slayer_task_streak_bounds', 'CHECK (slayer_task_streak >= 0)');
SELECT add_constraint('user_stats', 'user_stats_slayer_wildy_task_streak_bounds', 'CHECK (slayer_wildy_task_streak >= 0)');
SELECT add_constraint('user_stats', 'user_stats_slayer_superior_count_bounds', 'CHECK (slayer_superior_count >= 0)');
SELECT add_constraint('user_stats', 'user_stats_slayer_unsired_offered_bounds', 'CHECK (slayer_unsired_offered >= 0)');
SELECT add_constraint('user_stats', 'user_stats_slayer_chewed_offered_bounds', 'CHECK (slayer_chewed_offered >= 0)');
SELECT add_constraint('user_stats', 'user_stats_total_toa_points_bounds', 'CHECK (total_toa_points >= 0)');
SELECT add_constraint('user_stats', 'user_stats_total_toa_duration_minutes_bounds','CHECK (total_toa_duration_minutes >= 0)');
SELECT add_constraint('user_stats', 'user_stats_toa_attempts_bounds', 'CHECK (toa_attempts >= 0)');

-- GE
SELECT add_constraint('ge_listing', 'asking_price_per_item_min', 'CHECK (asking_price_per_item >= 1)');
SELECT add_constraint('ge_listing', 'total_quantity_min', 'CHECK (total_quantity >= 1)');
SELECT add_constraint('ge_listing', 'quantity_remaining_min', 'CHECK (quantity_remaining >= 0)');
SELECT add_constraint('ge_transaction', 'quantity_bought_min', 'CHECK (quantity_bought >= 0)');
SELECT add_constraint('ge_transaction', 'price_per_item_before_tax_min', 'CHECK (price_per_item_before_tax >= 1)');
SELECT add_constraint('ge_transaction', 'price_per_item_after_tax_min', 'CHECK (price_per_item_after_tax >= 1)');
SELECT add_constraint('ge_transaction', 'tax_rate_percent_min', 'CHECK (tax_rate_percent >= 1)');
SELECT add_constraint('ge_transaction', 'total_tax_paid_min', 'CHECK (total_tax_paid >= 0)');
SELECT add_constraint('ge_bank', 'ge_bank_quantity_min', 'CHECK (quantity >= 0)');

-- Misc
SELECT add_constraint('slayer_tasks', 'slayer_tasks_qty_bounds', 'CHECK (quantity BETWEEN 0 AND 10000)');
SELECT add_constraint('slayer_tasks', 'slayer_tasks_qty_remaining_bounds', 'CHECK (quantity_remaining BETWEEN 0 AND 10000)');
SELECT add_constraint('activity', 'activity_duration_bounds', 'CHECK (duration > 0 AND duration <= 86400000)'); -- Max 24 hours
SELECT add_constraint('giveaway', 'giveaway_duration_bounds', 'CHECK (duration > 0 AND duration <= 864000000)'); -- Max 10 days
SELECT add_constraint('table_bank_item', 'table_bank_quantity_min', 'CHECK (quantity >= 0)');
SELECT add_constraint('farmed_crop', 'quantity_planted_bounds', 'CHECK (quantity_planted BETWEEN 1 AND 5000)');
SELECT add_constraint('xp_gains', 'xp_gains_bounds', 'CHECK (xp BETWEEN 0 AND 200000000)');
SELECT add_constraint('bot_item_sell', 'bot_item_sell_qty_bounds', 'CHECK (quantity > 0)');
SELECT add_constraint('bot_item_sell', 'bot_item_sell_gp_received_bounds', 'CHECK (gp_received >= 0)');
