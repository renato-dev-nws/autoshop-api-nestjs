import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FipeController } from './fipe.controller';
import { FipeService } from './fipe.service';

@Module({
  imports: [HttpModule],
  controllers: [FipeController],
  providers: [FipeService],
  exports: [FipeService],
})
export class FipeModule {}
