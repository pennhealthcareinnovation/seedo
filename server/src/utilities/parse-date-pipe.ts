import { type ArgumentMetadata, Injectable, type PipeTransform } from "@nestjs/common";

@Injectable()
export class ParseDatePipe implements PipeTransform<string, Date> {
  transform(value: string, metadata: ArgumentMetadata): Date {
    try {
      const date = new Date(value)
      return date
    } catch (e: any) {
      throw Error(`Unable to parse ${metadata.data} to date - ${e.message}`)
    }
  }
}