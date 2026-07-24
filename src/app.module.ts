import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressEntity } from './entities/addresses.entity';
import { AppVersionEntity } from './entities/app-version.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { UserEntity } from './entities/user.entity';
import { AddressesModule } from './modules/addresses.module';
import { AppVersionModule } from './modules/app-version.module';
import { AuthModule } from './modules/auth.module';
import { OrderModule } from './modules/order.module';
import { UserModule } from './modules/user.module';
import { AppController } from './app.controller';

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
        entities: [
          UserEntity,
          AppVersionEntity,
          AddressEntity,
          Order,
          OrderItem,
        ],
        ssl:
          configService.get<string>('DB_SSL') === 'true'
            ? {
                rejectUnauthorized: false,
              }
            : false,
        synchronize: true,
      }),
    }),
    AddressesModule,
    AppVersionModule,
    AuthModule,
    OrderModule,
    UserModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
