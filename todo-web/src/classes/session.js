export default class Session {
  /**@private {number} */
  userID;
  /**@private {string} */
  username;
  /** @private {Promise} */
  initialized;

  constructor() {
    this.initialized = this.init();
  }

  /** @private */
  init() {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch("/api/v1/session", {
          cache: "no-cache"
        });
        if (!response.ok && response.status !== 200) {
          resolve(false);
          return
        }
        const { userID, username } = await response.json();
        this.userID = userID;
        this.username = username;
        resolve(true);
      } catch (e) {
        reject(e)
      }
    });
  }

  /**
   * @returns {Promise}
   * */
  async isValid() {
    return this.initialized;
  }

  get userID() {
    return this.userID;
  }

  get username() {
    return this.username;
  }
}