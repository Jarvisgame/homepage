-- 访客计数器表：单行记录
CREATE TABLE IF NOT EXISTS counter (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  count INTEGER NOT NULL DEFAULT 0
);

INSERT OR IGNORE INTO counter (id, count) VALUES (1, 0);
