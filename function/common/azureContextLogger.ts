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

  protected printMessages(messages: unknown[], context?: string, logLevel?: LogLevel, writeStreamType?: "stdout" | "stderr"): void {
    messages.forEach(message => {
      const output = this.stringifyMessage(message, logLevel);
      const pidMessage = this.colorize(`[Nest] - `, logLevel);
      const formattedLogLevel = this.colorize(logLevel.toUpperCase().padStart(7, ' '), logLevel);
      const formattedMessage = `${pidMessage}${this.getTimestamp()} ${formattedLogLevel} [${context}] ${output}`;

      this.azureContext.log(formattedMessage)
    })

  }

}