
import * as express from 'express';
import {NextFunction, Request, Response} from 'express';
import {GracefulShutdownManager} from '../src/index';


const PORT_NUMBER = 8080;


const app = express();

app.get('/quick', (req: Request, res: Response, next: NextFunction): any => {
  res.send('quick response');
});

app.get('/slow', (req: Request, res: Response, next: NextFunction): any => {
  setTimeout(() => res.send('slow response'), 3000);
});

const server = app.listen(PORT_NUMBER, (error: any) => {
  if (!error) {
    console.log('Started Express server on port: %d', PORT_NUMBER);
  }
});

const shutdownManager = new GracefulShutdownManager(server);

process.on('SIGTERM', () => onProcessInterrupt('SIGTERM'));
process.on('SIGINT', () => onProcessInterrupt('SIGINT'));


function onProcessInterrupt (signal: string) {
  console.log('Termination signal is received from OS (' + signal + '), the application will terminate');
  //noinspection JSIgnoredPromiseFromCall
  shutdownManager.terminate(() => {
    console.log('Server is terminated');
  });
}
