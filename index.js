const cron = require('node-cron');
const parser = require('cron-parser');

const client = require('./lib/client.js');

let created = false;

/**
 * Rate Limiter
 * @pubilc
 * @param {Object} [options]
 * @return {Function}
 */
function rateLimiter(options = {}) {
  const opt = {
    cron: options.cron || '0 * * * *',
    maxRequest: options.maxRequest || 1000,
  };

  if (!created) {
    cron.schedule(opt.cron, async () => {
      await client.clearAll();
    });

    created = true;
  }


  return async function _rateLimiter(req, res, next) {
    const ip = req.connection.remoteAddress;
    const record = await client.getRecordByIP(ip);

    res.setHeader('X-RateLimit-Reset', parser.parseExpression(opt.cron).next());

    if (record + 1 <= opt.maxRequest) {
      await client.addRecord(ip);
      res.setHeader('X-RateLimit-Remaining', opt.maxRequest - record - 1);
    } else {
      res.setHeader('X-RateLimit-Remaining', 0);
      res.statusCode = 429;
    }

    next();
  };
}

module.exports = rateLimiter;
