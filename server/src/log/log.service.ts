import { ConsoleLogger, Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class LogService extends ConsoleLogger implements OnModuleInit {
  constructor(
    private configService: ConfigService,
  ) {
    super()
  }

  setContext(context) {
    this.context = context
  }

  configReport() {
    this.debug(this.configService.get('REPORT'))
  }

  onModuleInit() {
    this.configReport()
  }
}