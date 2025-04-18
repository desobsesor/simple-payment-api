import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway({
    cors: {
        origin: ['http://192.168.101.72:5173', 'http://localhost:5173'],
        methods: ['GET', 'POST'],
        credentials: true,
    },
    /*pingInterval: 10000, // Intervalo de ping en ms (10 segundos)
    pingTimeout: 5000,   // Tiempo de espera para respuesta de ping
    transports: ['websocket', 'polling'], // Permitir fallback a polling
    */
    reconnection: true,  // Habilitar reconexión automática
    /*reconnectionAttempts: 5, // Número máximo de intentos de reconexión
    reconnectionDelay: 1000, // Retraso inicial entre intentos de reconexión
    reconnectionDelayMax: 5000, // Retraso máximo entre intentos
    //namespace: 'stock',
    */
})
export class StockUpdatesGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly logger = new Logger(StockUpdatesGateway.name);

    @WebSocketServer()
    server: Server;

    afterInit() {
        this.logger.log('Stock WebSocket Gateway initialized');
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
        //this.server.emit('connect', {})
        //this.server.emit('product_stock_updated', { productId: 0, stock: 0 });
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    // Método para enviar eventos a todos los clientes
    broadcastEvent(eventName: string, data: any) {
        this.server.emit(eventName, data);
    }

    // Método para enviar eventos a un cliente específico
    sendToClient(clientId: string, eventName: string, data: any) {
        this.server.to(clientId).emit(eventName, data);
    }

    /*@OnEvent('product_stock_updated')
    handleProductStockUpdated(payload: any) {
        this.logger.log(`Stock updated for product ${payload.productId}: ${payload.stock}`);
        //this.server.emit('product_stock_updated', payload);
    }*/
}