import app from './express';
import * as cluster from 'cluster';
import {GracefulShutdownManager} from '../src/index';

const PORT_NUMBER = 8080;

if (cluster.isMaster) {
  let aliveForks = 2;
  cluster.fork();
  cluster.fork();
  cluster.on('exit', function (worker, exitCode) {
    console.log('Worker %d died :(, exitCode is %d', worker.id, exitCode);
    // if all workers died, then cluster is exiting
    if (!--aliveForks) {
      process.exit()
    }
  });
  // cluster should wait
  process.on('SIGTERM', () => console.log('master ignore SIGTERM'));
  process.on('SIGINT', () => console.log('master ignore SIGINT'));
} else {
  // Configure forks as usual, but exit on terminating
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
      // This is close the fork
      process.exit(0)
    });
  }
}
