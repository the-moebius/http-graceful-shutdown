import {GracefulShutdownManager} from '../src/index';
import app from './express';

const PORT_NUMBER = 8080;

const server = app.listen(PORT_NUMBER, (error: any) => {
  if (!error) {
    console.log('Started Express server on port: %d', PORT_NUMBER);
  }
});

const shutdownManager = new GracefulShutdownManager(server);

process.on('SIGTERM', () => onProcessInterrupt('SIGTERM'));
process.on('SIGINT', () => onProcessInterrupt('SIGINT'));


function onProcessInterrupt(signal: string) {
  console.log('Termination signal is received from OS (' + signal + '), the application will terminate');
  //noinspection JSIgnoredPromiseFromCall
  shutdownManager.terminate(() => {
    console.log('Server is terminated');
  });
}
