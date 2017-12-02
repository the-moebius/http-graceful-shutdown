
import * as express from 'express';
import {Request, Response, Application} from 'express';


const app: Application = express();

app.get('/quick', (req: Request, res: Response): any => {
  res.send('quick response');
});

app.get('/slow', (req: Request, res: Response): any => {
  setTimeout(() => res.send('slow response'), 3000);
});

app.get('/progress', (req: Request, res: Response): any => {
  const socket = res.connection;
  socket.setNoDelay(true);
  res.writeHead(200, {
    'Content-Type': 'text/html',
    // 'Content-Type': 'application/octet-stream',
    'Transfer-Encoding': 'chunked'
  });
  res.write(`buffer: ${socket.bufferSize} <br>\n`);
  const time = 8000;
  (new Array(10)).fill(0).forEach((zero: number, i: number) => {
    const delay = Math.round(i * time / 10);
    setTimeout(() => res.write(`slow response chunk #${i} <small>(${delay} ms)</small><br>\n`), delay);
  });
  setTimeout(() => res.end(), time);
});

export default app;
