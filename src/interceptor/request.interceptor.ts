import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { promisify } from 'node:util';
import { writeFile } from 'node:fs';

@Injectable()
export class RequestInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = new Date();
    // console.log(context.switchToHttp().getRequest().body); // body
    // console.log(request.connection.remoteAddress); // ipAdress
    const request = context.switchToHttp().getRequest();

    const route = request.url;
    const params = request.params;
    const ipAdress = request.connection.remoteAddress;

    const record: string = `Ip Address : ${ipAdress}, Route: ${String(
      route,
    )}, Parameters: ${JSON.stringify(params)}, Time : ${now}\n`;

    const writeFileAsync = promisify(writeFile);

    const filePath = './logs.txt';

    writeFileAsync(filePath, record, { flag: 'a' });

    return next.handle();
  }
}
