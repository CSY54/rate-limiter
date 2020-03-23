# Rate Limiter

A middleware to limit the request amount of the IP address in the specific amount of time.

This project is based on `redis` and `node-cron`.

It will set the `X-RateLimit-Remaining` and `X-RateLimit-Reset` headers representing the remaining amount of requests and the next reset time, respectively.

## Usage

```js
const express = require('express');
const rateLimiter = require('rate-limiter');

const app = express();

app.use(rateLimiter());
```

### Configuration

**cron**

This parameter follows the format of cron time string.

default: `0 * * * *` (per hour)

**maxRequest**

The max amount of requests in the interval.

default: `1000`

### Example

The example below set the limit to 1000 requests per hour.

```js
app.use({
  cron: '0 * * * *',
  maxRequest: 1000,
});
```
