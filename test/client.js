const { expect } = require('chai');

const client = require('../lib/client.js');

describe('client', () => {
  beforeEach(async () => {
    await client.clearAll();
  });

  describe('seed()', () => {
    it('should return the ip address from 127.0.0.0 to 127.0.0.9', async () => {
      const res = await client.seed();

      expect(res).to.have.members([
        '127.0.0.0',
        '127.0.0.1',
        '127.0.0.2',
        '127.0.0.3',
        '127.0.0.4',
        '127.0.0.5',
        '127.0.0.6',
        '127.0.0.7',
        '127.0.0.8',
        '127.0.0.9',
      ]);
    });
  });

  describe('getAll()', () => {
    it('should return an empty array after clearAll()', async () => {
      await client.clearAll();

      const res = await client.getAll();

      expect(res).to.be.empty;
    });

    it('should return 127.0.0.0 to 127.0.0.9 after seed()', async () => {
      await client.seed();

      const res = await client.getAll();

      expect(res).to.have.members([
        '127.0.0.0',
        '127.0.0.1',
        '127.0.0.2',
        '127.0.0.3',
        '127.0.0.4',
        '127.0.0.5',
        '127.0.0.6',
        '127.0.0.7',
        '127.0.0.8',
        '127.0.0.9',
      ]);
    });
  });

  describe('clearAll()', () => {
    it('should return 0 if nothing was deleted', async () => {
      const res = await client.clearAll();

      expect(res).to.equal(0);
    });

    it('should return 10 after seed()', async () => {
      await client.seed();

      const res = await client.clearAll();

      expect(res).to.equal(10);
    });
  });

  describe('getRecordByIP()', () => {
    it('should retun 0 if not exist', async () => {
      const res = await client.getRecordByIP('test');

      expect(res).to.equal(0);
    });

    it('should return 1 after seed()', async () => {
      await client.seed();

      const res = await client.getRecordByIP('127.0.0.1');

      expect(res).to.equal(1);
    });

    it('should return the amount of the key', async () => {
      await client.addRecord('test');
      await client.addRecord('test');

      const res = await client.getRecordByIP('test');

      expect(res).to.equal(2);
    });
  });

  describe('deleteRecordByIP()', () => {
    it('should return 0 if not exist', async () => {
      const res = await client.deleteRecordByIP('test');

      expect(res).to.equal(0);
    });

    it('should return the amount of the deleted record', async () => {
      await client.seed();

      const res = await client.deleteRecordByIP('127.0.0.1');

      expect(res).to.equal(1);
    });
  });

  describe('addRecord()', () => {
    it('should set the record to 1 if not exist', async () => {
      const res = await client.addRecord('test');

      expect(res).to.equal(1);
    });

    it('should increase the record by 1', async () => {
      await client.seed();

      const res = await client.addRecord('127.0.0.1');

      expect(res).to.equal(2);
    });
  });
});
