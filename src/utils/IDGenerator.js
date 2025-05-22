const crypto = require("node:crypto");

class IDGenerator {
  /** @type {Set<string>} */
  #generatedIDs = new Set();
  #MAX_ATTEMPS = 200;

  generate() {
    const MaxRetry = this.#getMaxRetry();

    for (let i = 0, len = MaxRetry; i < len; i++) {
      const id = this.#randomId();

      if (this.#generatedIDs.has(id)) {
        continue; // skip duplicate.
      }

      this.#generatedIDs.add(id);
      return id;
    }

    const fallbackId = this.#fallbackId();
    this.#generatedIDs.add(fallbackId);
    return fallbackId;
  }

  #getMaxRetry() {
    return Math.max(this.#generatedIDs.size * 10, this.#MAX_ATTEMPS);
  }

  #randomId(length = 5) {
    return `#${crypto.randomBytes(length).toString("hex")}`;
  }

  /**
  * TRY TO NEVER REACH THIS FALLBACK CASE!!!!!
  */
  #fallbackId() {
    console.log(
      `[ ${IDGenerator.name} ]: FALLBACK ID GENERATION DETECTED!`
    )
    const rand = crypto.randomBytes(3).toString('hex');
    const nowDate = Date.now().toString()
    const nowSubDate = nowDate.substring(nowDate.length - 1);
    //       3 + 1-3  +  1  + 6 => 11-13 characters
    return `#FB${this.#generatedIDs.size + 1}${nowSubDate}${rand}`;
  }

  reset() {
    this.#generatedIDs.clear();
  }
}

module.exports = IDGenerator;