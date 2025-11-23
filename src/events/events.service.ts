import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Kysely, sql } from 'kysely';
import Redis from 'ioredis';
import { DB_CONNECTION } from '../database/database.module';
import { Database } from '../database/types';
import { REDIS_CONNECTION } from '../redis/redis.module';

@Injectable()
export class EventsService implements OnModuleInit {
  private readonly logger = new Logger(EventsService.name);
  private readonly BATCH_SIZE = 1000;

  constructor(
    @Inject(DB_CONNECTION) private readonly db: Kysely<Database>,
    @Inject(REDIS_CONNECTION) private readonly redis: Redis,
  ) {}

  onModuleInit() {
    setInterval(() => {
      this.flushEvents();
    }, 5000);
  }

  async createEventBuffered(type: string, payload: Record<string, any>) {
    const eventData = JSON.stringify({ type, payload });

    await this.redis.rpush('events_queue', eventData);

    return { status: 'buffered' };
  }

  private async flushEvents() {
    const length = await this.redis.llen('events_queue');
    if (length === 0) return;

    this.logger.log(`Flushing ${length} events to Database...`);

    const rawEvents = await this.redis.lpop('events_queue', this.BATCH_SIZE);

    if (!rawEvents || rawEvents.length === 0) return;

    const insertRows = rawEvents.map((raw) => {
      const parsed = JSON.parse(raw);
      return {
        type: parsed.type,
        payload: parsed.payload,
      };
    });

    try {
      await this.db.insertInto('events').values(insertRows).execute();

      this.logger.log(`Successfully saved ${insertRows.length} events.`);
    } catch (error) {
      this.logger.error('Failed to flush events', error);
    }
  }

  async getStats() {
    const byType = await this.db
      .selectFrom('events')
      .select(['type', this.db.fn.count('id').as('count')])
      .groupBy('type')
      .execute();

    const byMinute = await this.db
      .selectFrom('events')
      .select((eb) => [
        sql<string>`date_trunc('minute', ${eb.ref('created_at')})`.as('minute'),
        eb.fn.count('id').as('count'),
      ])
      .where('created_at', '>', sql<Date>`now() - interval '1 hour'`)
      .groupBy('minute')
      .orderBy('minute', 'desc')
      .execute();

    return {
      summary: byType,
      timeline: byMinute,
    };
  }
}
