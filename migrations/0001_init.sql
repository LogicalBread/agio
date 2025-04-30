-- Migration number: 0001 	 2025-04-30T08:01:47.112Z
CREATE TABLE messages (
	channel_id TEXT NOT NULL
	, user_id BIGINT NOT NULL
	, target TEXT NOT NULL
	, role TEXT NOT NULL
	, content TEXT NOT NULL
	, index_number INTEGER NOT NULL
);
