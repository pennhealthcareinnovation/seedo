import { DBSQLClient, LogLevel } from '@databricks/sql';
import { ConnectionOptions } from '@databricks/sql/dist/contracts/IDBSQLClient';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabricksService {
  private readonly logger = new Logger(DatabricksService.name)
  private client: DBSQLClient
  private connectionConfig: ConnectionOptions

  constructor(
    private config: ConfigService
  ) {
    this.client = new DBSQLClient({
      logger: {
        log: (level: LogLevel, message: string) => {
          switch (level) {
            case 'warn': this.logger.warn(message); break;
            case 'error': this.logger.error(message); break;
            case 'debug': this.logger.debug(message); break;
            case 'info': this.logger.log(message); break;
            default: this.logger.log(message); break;
          }
        }
      }
    })

    this.connectionConfig = {
      token: this.config.getOrThrow('DATABRICKS_TOKEN'),
      host: this.config.getOrThrow('DATABRICKS_HOSTNAME'),
      path: this.config.getOrThrow('DATABRICKS_HTTP_PATH'),
    }
  }

  /** Startup the SQL endpoint by opening a session so it is ready for query */
  async startEndpoint() {
    await this.client.connect(this.connectionConfig)
    const session = await this.client.openSession()
    await session.close()
    await this.client.close()
    this.logger.log('Databricks SQL endpoint started')
  }

  async query(queryString: string) {
    try {
      await this.client.connect(this.connectionConfig)
      const session = await this.client.openSession()
      const queryOperation = await session.executeStatement(queryString,
        { runAsync: true, maxRows: 10000 }
      )
      const result = await queryOperation.fetchAll({
        progress: false,
        callback: () => { },
      });
      await queryOperation.close();
      await session.close();
      this.client.close();
      return result

    } catch (e) {
      console.error(e)
      throw Error(e.message)
    }
  }

  /**
   * @param queryString - the SQL query to run
   * @param chunk - retrieve this many rows at a time
   * @param chunkCallback - run this function with each chunk of results
   */
  async queryChunks({queryString, chunkSize, chunkCallback}: {queryString: string, chunkSize: number, chunkCallback: (rows: any[]) => Promise<void>}) {
    try {
      await this.client.connect(this.connectionConfig)
      const session = await this.client.openSession()
      const queryOperation = await session.executeStatement(queryString,
        { runAsync: true, maxRows: chunkSize }
      )
      
      let chunkResult = await queryOperation.fetchChunk({ progress: false, maxRows: chunkSize })
      await chunkCallback(chunkResult)
      
      while (chunkResult?.length == chunkSize) {
        chunkResult = await queryOperation.fetchChunk({ progress: false, maxRows: chunkSize })
        await chunkCallback(chunkResult)
      }
      
      await queryOperation.close();
      await session.close();
      this.client.close();

    } catch (e) {
      console.error(e)
      throw Error(e.message)
    }
  }
}
