import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppVersionEntity } from './entities/app-version.entity';
import { UserEntity } from './entities/user.entity';
import { AppVersionModule } from './modules/app-version.module';
import { AuthModule } from './modules/auth.module';
import { UserModule } from './modules/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: Number(configService.get<string>('DB_PORT', '5432')),
        username: configService.get<string>('DB_USERNAME', 'andersonmendes'),
        password: configService.get<string>('DB_PASSWORD', 'root'),
        database: configService.get<string>('DB_DATABASE', 'pedegas'),
        schema: configService.get<string>('DB_SCHEMA', 'public'),
        entities: [UserEntity, AppVersionEntity],
        ssl:
          configService.get<string>('DB_SSL') === 'true'
            ? {
                rejectUnauthorized: false,
              }
            : false,
        synchronize: true,
      }),
    }),
    AppVersionModule,
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
