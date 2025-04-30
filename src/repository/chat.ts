import type { D1Database } from '@cloudflare/workers-types';
import type { Message } from '../domain/model/message';
import type { ChatRepositoryExt } from '../domain/repository/chat';
import type { PersonalTarget } from '../gen/target';

export class ChatRepositoryImpl implements ChatRepositoryExt {
  private readonly db;

  constructor(db: D1Database) {
    this.db = db;
  }

  async getLatestMessageCount(
    channelId: string,
    userId: string,
    target: PersonalTarget,
  ): Promise<number> {
    const res = await this.db
      .prepare(
        'SELECT MAX(index_number) FROM messages WHERE channel_id = ? AND user_id = ? AND target = ?',
      )
      .bind(channelId, userId, target)
      .first<{ index_number: number }>();

    return res?.index_number ?? 0;
  }

  async persistMessages(
    channelId: string,
    userId: string,
    target: PersonalTarget,
    messages: Message[],
  ): Promise<void> {
    const prepares = messages.map((m) =>
      this.db
        .prepare(
          'INSERT INTO messages (channel_id, user_id, target, role, content, index_number) VALUES (?, ?, ?, ?, ?, ?)',
        )
        .bind(channelId, userId, target, m.role, m.content, m.index),
    );

    await this.db.batch(prepares);
  }

  async resetMessages(
    channelId: string,
    userId: string,
    target: PersonalTarget,
  ): Promise<void> {
    await this.db
      .prepare(
        'DELETE FROM messages WHERE channel_id = ? AND user_id = ? AND target = ?',
      )
      .bind(channelId, userId, target)
      .run();
  }

  async fetchMessages(
    channelId: string,
    userId: string,
    target: PersonalTarget,
  ): Promise<Message[]> {
    type Queryable = {
      role: string;
      content: string;
      index_number: number;
    };

    const rows = await this.db
      .prepare(
        'SELECT role, content, index_number FROM messages WHERE channel_id = ? AND target = ? AND user_id = ? ORDER BY index_number ASC',
      )
      .bind(channelId, target, userId)
      .all<Queryable>();

    return rows.results.map((row) => ({
      role: row.role as 'system' | 'user',
      content: row.content,
      index: row.index_number,
    }));
  }
}
