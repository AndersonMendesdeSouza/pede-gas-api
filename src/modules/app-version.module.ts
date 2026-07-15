import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppVersionController } from 'src/controllers/app-version.controller';
import { AppVersionEntity } from 'src/entities/app-version.entity';
import { AppVersionService } from 'src/services/app-version.service';

@Module({
  imports: [TypeOrmModule.forFeature([AppVersionEntity])],
  controllers: [AppVersionController],
  providers: [AppVersionService],
  exports: [AppVersionService],
})
export class AppVersionModule {}
