CREATE OR REPLACE FUNCTION add_item_to_bank(
    bank JSONB,
    key TEXT,
    quantity INT
) RETURNS JSONB LANGUAGE plpgsql AS $$
BEGIN
    RETURN (
        CASE
            WHEN bank ? key THEN
                jsonb_set(bank, ARRAY[key], to_jsonb((bank->>key)::INT + quantity))
            ELSE
                jsonb_set(bank, ARRAY[key], to_jsonb(quantity))
        END
    );
END;
$$;

CREATE OR REPLACE FUNCTION remove_item_from_bank(
    bank JSONB,
    key TEXT,
    quantity INT
) RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
    current_value INT;
BEGIN
    IF bank ? key THEN
        current_value := (bank->>key)::INT - quantity;
        IF current_value > 0 THEN
            RETURN jsonb_set(bank, ARRAY[key], to_jsonb(current_value));
        ELSE
            RETURN bank - key;
        END IF;
    ELSE
        RETURN bank;
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION add_constraint(
    t_name TEXT,
    c_name TEXT,
    constraint_sql TEXT
) RETURNS VOID AS $$
BEGIN
    IF NOT EXISTS (
        SELECT c.conname
        FROM pg_constraint AS c
        INNER JOIN pg_class AS t ON c.conrelid = t.oid
        WHERE t.relname = t_name AND c.conname = c_name
    ) THEN
        EXECUTE 'ALTER TABLE ' || quote_ident(t_name)
                || ' ADD CONSTRAINT ' || quote_ident(c_name)
                || ' ' || constraint_sql;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_recent_cl_array()
RETURNS void AS
$$
BEGIN
    UPDATE users
    SET "cl_array" = ARRAY(
        SELECT jsonb_object_keys("collectionLogBank")::int
    )
    WHERE last_command_date > now() - INTERVAL '1 week';
END;
$$ LANGUAGE plpgsql;
