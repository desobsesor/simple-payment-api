import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { StockUpdatesGateway } from './stock-updates.gateway';

@Module({
    imports: [
        EventEmitterModule.forRoot({
            wildcard: false,
            delimiter: '.',
            newListener: false,
            removeListener: false,
            maxListeners: 10,
            verboseMemoryLeak: false,
            ignoreErrors: false,
        }),
    ],
    providers: [StockUpdatesGateway],
    exports: [StockUpdatesGateway],
})
export class WebsocketsModule { }