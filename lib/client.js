const redis = require('promise-redis')();
const client = redis.createClient();

/**
 * Get record by IP.
 * @async
 * @param {string} ip IP address.
 * @return {number} The request amount of the IP.
 */
async function getRecordByIP(ip) {
  return parseInt(await client.get(ip) || 0, 10);
}

/**
 * Delete record by IP.
 * @async
 * @param {string} ip IP address.
 * @return {number} The amount of deleted ip.
 */
async function deleteRecordByIP(ip) {
  return parseInt(await client.del(ip) || 0, 10);
}

/**
 * Add record to IP.
 * @async
 * @param {string} ip IP address.
 * @return {number} The request amount after adding the record.
 */
async function addRecord(ip) {
  const res = await client.incr(ip);

  return parseInt(res || 0, 10);
}

/**
 * Get all records.
 * @async
 * @return {array<string>} Array of existing records.
 */
async function getAll() {
  const res = await client.keys('*');

  return res;
}

/**
 * Clear all records.
 * @async
 * @return {number} The amount of deleted records.
 */
async function clearAll() {
  const res = await client.keys('*').then(async (ips) => {
    for await (const ip of ips) {
      deleteRecordByIP(ip);
    }

    return Promise.resolve(ips.length);
  });

  return res;
}

/**
 * Seed for debugging.
 * @async
 * @return {array<string>} Array containing "127.0.0.0" ~ "127.0.0.9".
 */
async function seed() {
  const ips = [...Array(10).keys()];

  for await (const ip of ips) {
    addRecord(`127.0.0.${ip}`, ip + 1);
  }

  return ips.map((ip) => `127.0.0.${ip}`);
}

module.exports = {
  addRecord,
  clearAll,
  deleteRecordByIP,
  getAll,
  getRecordByIP,
  seed,
};
