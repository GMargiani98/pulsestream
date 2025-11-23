import { Global, Module } from '@nestjs/common';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const DB_CONNECTION = 'DB_CONNECTION';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DB_CONNECTION,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new Kysely<any>({
          dialect: new PostgresDialect({
            pool: new Pool({
              host: configService.getOrThrow<string>('DB_HOST'),
              port: configService.getOrThrow<number>('DB_PORT'),
              user: configService.getOrThrow<string>('DB_USER'),
              password: configService.getOrThrow<string>('DB_PASSWORD'),
              database: configService.getOrThrow<string>('DB_NAME'),
            }),
          }),
        });
      },
    },
  ],
  exports: [DB_CONNECTION],
})
export class DatabaseModule {}
