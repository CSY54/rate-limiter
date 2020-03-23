const http = require('http');
const chai = require('chai');
const { expect } = chai;
const chaiHttp = require('chai-http');
const sinon = require('sinon');

const client = require('../lib/client.js');

chai.use(chaiHttp);

function createServer(options) {
  const rateLimiter = require('..')(options);

  return http.createServer(async (req, res) => {
    await rateLimiter(req, res, () => {
      res.end();
    });
  });
}

describe('Rate Limiter middleware', () => {
  afterEach(() => {
    delete require.cache[require.resolve('..')];
  });

  describe('Redis record', () => {
    afterEach(async () => {
      await client.clearAll();
    });

    it('should get record from redis', async () => {
      const spy = sinon.spy(client, 'getRecordByIP');

      await chai.request(createServer()).get('/');

      expect(spy.calledOnce);
      expect(spy.calledWith('::ffff:127.0.0.1'));

      client.getRecordByIP.restore();
    });

    it('should set record to redis', async () => {
      const spy = sinon.spy(client, 'addRecord');

      await chai.request(createServer()).get('/');

      expect(spy.calledOnce);
      expect(spy.calledWith('::ffff:127.0.0.1'));

      client.addRecord.restore();
    });
  });

  describe('Cron job', () => {
    const cron = require('node-cron');

    it('should create a cron job', async () => {
      const spy = sinon.spy(cron, 'schedule');

      await require('..')();

      expect(spy.called);

      cron.schedule.restore();
    });

    it('should create the cron job only once', async () => {
      const spy = sinon.spy(cron, 'schedule');
      const requester = chai.request(createServer()).keepOpen();

      await requester.get('/');
      await requester.get('/');

      expect(spy.calledOnce);

      cron.schedule.restore();
    });

    it('should clear all existing records', async () => {
      const spy = sinon.spy(client, 'clearAll');

      await client.seed();

      await chai.request(createServer({
        cron: '* * * * * *',
      })).get('/')
        .then(async () => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        });

      expect(spy.calledOnce);

      client.clearAll.restore();
    });
  });

  describe('Behavior', () => {
    let requester;

    beforeEach(() => {
      requester = chai.request(createServer({
        maxRequest: 3,
      })).keepOpen();
    });

    afterEach(async () => {
      await client.clearAll();
    });

    it('should be created without error', async () => {
      await requester.get('/')
        .then((res) => {
          expect(res).to.have.status(200);
          expect(res).to.have.header('X-RateLimit-Remaining', /\d+/u);
          expect(res).to.have.header('X-RateLimit-Reset');
        });
    });


    it('should have status code 200 ' + 
        'if request limit not reached', async () => {
      await requester.get('/')
        .then((res) => expect(res).to.have.status(200));

      await requester.get('/')
        .then((res) => expect(res).to.have.status(200));

      await requester.get('/')
        .then((res) => expect(res).to.have.status(200));
    });

    it('should have status code 429 '
        + 'if request limit reached', async () => {
      await requester.get('/');
      await requester.get('/');
      await requester.get('/');

      await requester.get('/')
        .then((res) => expect(res).to.have.status(429));
    });

    it('should return the correct remaining amount of request', async () => {
      await requester.get('/').then((res) => {
        expect(res).to.have.header('X-RateLimit-Remaining', '2');
      });

      await requester.get('/').then((res) => {
        expect(res).to.have.header('X-RateLimit-Remaining', '1');
      });

      await requester.get('/').then((res) => {
        expect(res).to.have.header('X-RateLimit-Remaining', '0');
      });
    });
  });
});

