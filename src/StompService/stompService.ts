import { Client, Frame, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class StompService {
  private static instance: StompService;
  private client: Client;
  private constructor() {
    this.client = new Client();
  }

  public static getInstance(): StompService {
    if (!StompService.instance) {
      StompService.instance = new StompService();
    }
    return StompService.instance;
  }

  public connect(url: string, onConnectCallback?: () => void, onErrorCallback?: (error: Frame | string) => void): void {
    this.client.configure({
      webSocketFactory: () => new SockJS(url),
      onConnect: () => {
        console.log('Connected to WebSocket via STOMP');
        if (onConnectCallback) onConnectCallback();
      },
      onStompError: (frame: Frame) => {
        console.error('STOMP error:', frame);
        if (onErrorCallback) onErrorCallback(frame);
      },
    });

    this.client.activate();
  }

  public subscribe(topic: string, callback: (message: Message) => void): void {
    if (this.client && this.client.connected) {
      this.client.subscribe(topic, callback);
    } else {
      console.error('STOMP client is not connected. Cannot subscribe.');
    }
  }

  public sendMessage(destination: string, body: string, headers: any = {}): void {
    if (this.client && this.client.connected) {
      this.client.publish({ destination, body, headers });
    } else {
      console.error('STOMP client is not connected. Cannot send message.');
    }
  }

  public disconnect(): void {
    if (this.client) {
      this.client.deactivate();
    }
  }
}

export default StompService;
