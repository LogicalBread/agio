import type { D1Database } from '@cloudflare/workers-types';
import type { Message } from '../domain/model/message';
import type { PersonalTarget } from '../domain/model/personal';
import type { ChatRepositoryExt } from '../domain/repository/chat';

export class ChatRepositoryImpl implements ChatRepositoryExt {
  private readonly db;

  constructor(db: D1Database) {
    this.db = db;
  }

  async getLatestMessageCount(
    channelId: string,
    target: PersonalTarget,
  ): Promise<number> {
    const res = await this.db
      .prepare(
        'SELECT MAX(index_number) FROM messages WHERE channel_id = ? AND target = ?',
      )
      .bind(channelId, target)
      .first<{ index_number: number }>();

    return res?.index_number ?? 0;
  }

  async persistMessages(
    channelId: string,
    target: PersonalTarget,
    messages: Message[],
  ): Promise<void> {
    const prepares = messages.map((m) =>
      this.db
        .prepare(
          'INSERT INTO messages (channel_id, target, role, content, index_number) VALUES (?, ?, ?, ?, ?)',
        )
        .bind(channelId, target, m.role, m.content, m.index),
    );

    await this.db.batch(prepares);
  }

  async resetMessages(
    channelId: string,
    target: PersonalTarget,
  ): Promise<void> {
    await this.db
      .prepare('DELETE FROM messages WHERE channel_id = ? AND target = ?')
      .bind(channelId, target)
      .run();
  }

  async fetchMessages(
    channelId: string,
    target: PersonalTarget,
  ): Promise<Message[]> {
    type Queryable = {
      role: string;
      content: string;
      index_number: number;
    };

    const rows = await this.db
      .prepare(
        'SELECT role, content, index_number FROM messages WHERE channel_id = ? AND target = ?',
      )
      .bind(channelId, target)
      .all<Queryable>();

    return rows.results.map((row) => ({
      role: row.role as 'system' | 'user',
      content: row.content,
      index: row.index_number,
    }));
  }
}
