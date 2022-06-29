import { Context } from "@azure/functions";
import { ConsoleLogger, ConsoleLoggerOptions, LogLevel } from "@nestjs/common";

interface AzureContextLoggerOptions extends ConsoleLoggerOptions {
  azureContext: Context
}

export class AzureContextLogger extends ConsoleLogger {
  protected azureContext: Context

  constructor(context: string, options: AzureContextLoggerOptions) {
    super(context, options)
    this.azureContext = options.azureContext
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