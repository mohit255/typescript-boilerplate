import { Server } from './core/server';

const server = new Server({
  port: 4000, // override default
  enableLogs: true,
  secretId: 'qa/sb-backoffice',
});

server.bootstrap();
