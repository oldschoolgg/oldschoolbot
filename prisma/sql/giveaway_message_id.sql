ALTER TABLE giveaway ALTER COLUMN id TYPE varchar(19) USING id::text;
