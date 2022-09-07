import { Context } from "@azure/functions";
import { ConsoleLogger, ConsoleLoggerOptions, LogLevel, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LogService } from "./log.service";

interface AzureContextLoggerOptions extends ConsoleLoggerOptions {
  /** Azure context used for console output */
  azureContext: Context

  /** ConfigService used to generate configuration report */
  configService?: ConfigService
}

export class AzureContextLogService extends ConsoleLogger implements OnModuleInit {
  protected azureContext: Context
  protected configService: ConfigService

  constructor(context: string, options: AzureContextLoggerOptions) {
    super(context, options)
    this.azureContext = options.azureContext
    this.configService = options?.configService
  }

  setContext(context: string): void {
    this.context = context
  }

  onModuleInit() {
    this.setContext('LogService')
    this.debug(this?.configService?.get('REPORT'))
  }

  /** Don't add color, just return the string; Azure logs don't support color */
  protected colorize(message: string, logLevel: LogLevel): string {
    return message
  }

  protected printMessages(messages: unknown[], context?: string, logLevel?: LogLevel, writeStreamType?: "stdout" | "stderr"): void {
    messages.forEach(message => {
      const output = this.stringifyMessage(message, logLevel);
      const formattedMessage = `[Nest] - ${this.getTimestamp()} ${logLevel.toUpperCase().padStart(7, ' ')} [${context}] ${output}`;

      this.azureContext.log(formattedMessage)
    })

  }

}