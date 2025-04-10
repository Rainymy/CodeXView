const { performance } = require("node:perf_hooks");

const FLOAT_DIGITS = 2;

/**
* @param {Number} delta
* @returns
*/
function digitPrecision(delta) {
  const tens = 10 ** FLOAT_DIGITS;
  return Math.round(delta * tens) / tens;
}

/**
 * @template T
* @param {Promise<T>} promise
* @returns {Promise<[string, T]>}
*/
async function measureTime(promise) {
  const startTime = performance.now(); // start time
  const result = await promise;        // compute
  const endTime = performance.now();   // end time

  const totalTimeMS = digitPrecision(endTime - startTime);

  return [totalTimeMS.toString(), result];
}

module.exports = {
  measureTime: measureTime
}