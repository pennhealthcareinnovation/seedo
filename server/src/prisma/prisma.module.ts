import { DynamicModule, Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  exports: [ PrismaService ],
  providers: [ PrismaService ]
})
export class PrismaModule {}

// @Global()
// @Module()
// export class PrismaModule {
//   static forRoot(): DynamicModule {
//     providers:
//   }
// }