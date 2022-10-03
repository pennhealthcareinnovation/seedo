import { ConsoleLogger, Injectable, type OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class LogService extends ConsoleLogger implements OnModuleInit {
  constructor(
    private configService: ConfigService,
  ) {
    super()
  }

  setContext(context: any) {
    this.context = context
  }

  configReport() {
    this.log(this.configService.get('REPORT'), LogService.name)
  }

  onModuleInit() {
    this.configReport()
  }
}