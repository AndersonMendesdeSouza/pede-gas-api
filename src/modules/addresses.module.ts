import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressesController } from 'src/controllers/addresses.controller';
import { AddressEntity } from 'src/entities/addresses.entity';
import { AddressesService } from 'src/services/addresses.service';

@Module({
  imports: [TypeOrmModule.forFeature([AddressEntity])],
  controllers: [AddressesController],
  providers: [AddressesService],
  exports: [AddressesService],
})
export class AddressesModule {}
