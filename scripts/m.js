import { Client } from 'pg';

const dbConnectionString = "postgresql://postgres:postgres@127.0.0.1:5435/osb_integration_test"

const client = new Client({ connectionString: dbConnectionString });
await client.connect();

while (true) {
	const res = await client.query(`WITH filtered AS (
  SELECT *
  FROM pg_stat_activity
  WHERE datname = 'osb_integration_test'
)
SELECT
  count(*) AS total_connections,
  count(*) FILTER (WHERE state = 'active') AS active_queries,
  count(*) FILTER (WHERE state = 'idle in transaction') AS idle_in_transaction,
  count(*) FILTER (WHERE state = 'idle') AS idle,
  jsonb_agg(
    jsonb_build_object(
      'pid', pid,
      'usename', usename,
      'state', state,
      'running_for', now() - query_start,
      'query', query
    )
  ) FILTER (WHERE state = 'active') AS active_query_list
FROM filtered;
`);
	const data = (res.rows[0]);
	console.log({ ...data, active_query_list: undefined });
	await new Promise(res => setTimeout(res, 500));
}

await client.end();
