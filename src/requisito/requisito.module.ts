import { Module } from '@nestjs/common';
import { RequisitoService } from './requisito.service';
import { RequisitoController } from './requisito.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Requisito } from './entities/requisito.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Requisito])],
  controllers: [RequisitoController],
  providers: [RequisitoService],
})
export class RequisitoModule { }
