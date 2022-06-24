import { Global, Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';

@Global()
@Module({
  providers: [CryptoService]
})
export class UtilitiesModule { }
