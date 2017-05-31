# @moebius/http-graceful-shutdown

[![npm version](https://badge.fury.io/js/%40moebius%2Fhttp-graceful-shutdown.svg)](https://badge.fury.io/js/%40moebius%2Fhttp-graceful-shutdown)


This package for Node.js provides you with easy to use facilities
required to gracefully terminate HTTP servers.

It's designed to work with native `http.Server` implementation, so it
could be used for any server build on top of it (i.e. Express and other).
See [examples](#usage) below.


## Features

- Keeps track of all open connections and their status (active/idle)
- Gracefully terminates all connections by terminating the idle ones right away
  and waiting for pending requests to complete
- Very straightforward and simple API to use
- Minimal working implementation possible without extraneous functionality
- Written in TypeScript, but supports vanilla JavaScript


## Problem

When your application's process is interrupted by the operating system
(by passing SIGINT or SIGTERM signals) by default the server is terminated
right away and all open connections are brutally severed. This means that
if some client was in the process of sending or receiving data from your
server it will encounter an error. This could easily lead to escalating errors
down the chain and data corruption.

The better strategy would be to listen for interruption signals and to close
connections gracefully by closing only idle connections right away and waiting
for pending requests to properly complete.

This module solves exactly this problem (or at least the second part of it).


## Installation

Install package with yarn:

`yarn add @moebius/http-graceful-shutdown`

Or npm:

`npm i -S @moebius/http-graceful-shutdown`


## Usage

### Vanilla Server

```js
const http = require('http');  
const GracefulShutdownManager = require('@moebius/http-graceful-shutdown').GracefulShutdownManager;


const server = http.createServer(/** … */);
const shutdownManager = new GracefulShutdownManager(server);

server.listen(8080);

process.on('SIGTERM', () => {
  shutdownManager.terminate(() => {
    console.log('Server is gracefully terminated');
  });
});
```

### Express Server

```js
const express = require('express');
const GracefulShutdownManager = require('@moebius/http-graceful-shutdown').GracefulShutdownManager;


const app = express();

const server = app.listen(8080);

const shutdownManager = new GracefulShutdownManager(server);

process.on('SIGTERM', () => {
  shutdownManager.terminate(() => {
    console.log('Server is gracefully terminated');
  });
});
```

## API

### GracefulShutdownManager Class

- `construct (server: http.Server)`

  Creates an instance of `GracefulShutdownManager` class.

  The `server` argument is a Node.js HTTP server instance, i.e. `http.Server`.
  If you are using Express, you can obtain it like this: `const server = app.listen(/** … */);`

- `terminate(callback: Function)`

  Initiates graceful termination of the server by closing all idle connections first and
  then by waiting for pending requests to finish. New requests are not accepted after calling this.


## Support

If you like this module please consider to add a star on [GitHub repository][repo-gh].

Thank you!


## License

The MIT License (MIT)

Copyright (c) 2017 Slava Fomin II, MOEBIUS FOUNDATION.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.


  [repo-gh]: https://github.com/moebiusmlm/http-graceful-shutdown
