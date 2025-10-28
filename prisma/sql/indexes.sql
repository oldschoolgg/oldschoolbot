CREATE UNIQUE INDEX IF NOT EXISTS activity_only_one_task
ON activity (user_id, completed) WHERE NOT completed;

CREATE INDEX IF NOT EXISTS activity_completed_finishdate_idx
ON activity (finish_date)
WHERE completed = false;

CREATE INDEX IF NOT EXISTS activity_user_recent_done_idx
ON activity (user_id, finish_date DESC, id DESC)
INCLUDE (type)
WHERE completed = true
  AND finish_date >= DATE '2025-06-06';

CREATE INDEX IF NOT EXISTS idx_ge_listing_buy_filter_sort
ON ge_listing (type, fulfilled_at, cancelled_at, user_id, asking_price_per_item DESC, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_ge_listing_sell_filter_sort
ON ge_listing (type, fulfilled_at, cancelled_at, user_id, asking_price_per_item ASC, created_at ASC);

CREATE INDEX IF NOT EXISTS ge_transaction_sell_listing_id_created_at_idx
ON ge_transaction (sell_listing_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ge_listing_lookup_idx
ON ge_listing (user_id, userfacing_id)
WHERE cancelled_at IS NULL
  AND fulfilled_at IS NULL
  AND quantity_remaining > 0;

CREATE INDEX IF NOT EXISTS users_clarray_gin
ON users USING gin (cl_array gin__int_ops);

CREATE INDEX IF NOT EXISTS users_bitfield_gin
ON users USING gin (bitfield gin__int_ops);

CREATE INDEX IF NOT EXISTS users_rsn_lower_idx
ON users ((LOWER("RSN")))
WHERE "RSN" IS NOT NULL;
