
import {IncomingMessage, Server as HttpServer, ServerResponse} from 'http';
import {Server as HttpsServer} from 'https';

import Socket = NodeJS.Socket;


interface SocketsMap {
  [key: number]: Socket
}


export class GracefulShutdownManager {

  // Map for tracking opened connections.
  private connections: SocketsMap = {};

  private nextConnectionId = 1;

  // Flag indicating if server is terminating at the moment.
  private terminating = false;


  constructor (private server: HttpServer | HttpsServer) {
    this.startWatchingServer();
  }


  /**
   * Initiates graceful termination of the server.
   * It first asks server to stop accepting new requests and then
   * terminates all open idle connections.
   * By putting the server into termination phase all active connections
   * would be automatically terminated after requests are properly complete.
   */
  public terminate (callback: () => void) {

    this.terminating = true;

    this.server.close(callback);

    for (const connectionId in this.connections) {
      if (this.connections.hasOwnProperty(connectionId)) {
        const socket = this.connections[connectionId];
        this.closeIdleConnection(socket);
      }
    }

  }


  private startWatchingServer () {
    this.server.on('connection', this.onConnection.bind(this));
    this.server.on('request', this.onRequest.bind(this));
  }

  /**
   * Initializes new connection by adding idle flag to it and
   * tracks the connection inside of internal list.
   */
  private onConnection (connection: Socket | any) {

    const connectionId = this.nextConnectionId++;

    // Marking connection as idle initially.
    connection.$$isIdle = true;

    // Adding connection to the list.
    this.connections[connectionId] = connection;

    // Removing connection from the list when it's closed.
    connection.on('close', () => delete this.connections[connectionId]);

  }

  /**
   * Changes connection status to active during the request.
   * Makes sure that connection is closed when request is finished during
   * shutdown phase.
   */
  private onRequest (request: IncomingMessage, response: ServerResponse) {

    const connection = (request.connection as any);

    // Marking connection as active.
    connection.$$isIdle = false;

    response.on('finish', () => {

      // Marking connection as idle.
      connection.$$isIdle = true;

      // Closing the connection after request is processed when
      // we are in termination phase.
      if (this.terminating) {
        this.closeIdleConnection(connection);
      }

    });

  }

  /**
   * Destroys the connection if it's inactive.
   */
  private closeIdleConnection (connection: Socket | any) {
    if (connection.$$isIdle) {
      connection.destroy();
    }
  }

}
