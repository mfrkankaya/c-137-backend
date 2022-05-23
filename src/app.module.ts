import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DenemeModule } from './deneme/deneme.module';

@Module({
  imports: [ConfigModule.forRoot(), DenemeModule],
})
export class AppModule {}
