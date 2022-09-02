import { Module } from '@nestjs/common';
import { ObserveModule } from '../observe/observe.module';
import { ViewController } from './view.controller';
import { ViewService } from './view.service';

@Module({
  imports: [ObserveModule],
  controllers: [ViewController],
  providers: [ViewService]
})
export class ViewModule { }
