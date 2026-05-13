import request from 'supertest';
import { App } from '../src/core/app';

describe('App', () => {
  let appInstance: Express.Application;

  beforeAll(() => {
    const app = new App();
    appInstance = app.instance;
  });

  it('should return 200 OK on /health', async () => {
    const res = await request(appInstance).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});