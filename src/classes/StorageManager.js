/* Class to manage local storage */

class StorageManager {

    // constructor
    constructor() {
        // get chrome storage
        this.chromeStorage = chrome.storage.local;
    }

    // method to retrieve data from local storage
    async get(keys) {
        if (keys) {
            return new Promise((resolve, reject) => {
                this.chromeStorage.get(keys, (result) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(result);
                    }
                })
            })
        } else {
            return new Promise((resolve, reject) => {
                this.chromeStorage.get(null, (result) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        resolve(result);
                    }
                })
            })
        }
    }

    // method to save data to local storage
    async set(data) {
        // check if data is an object (must be json-like object not an array)
        if (typeof data !== 'object') {
            return Promise.reject('Data must be an object');
        }

        // check if storage is full 
        if (JSON.stringify(data).length >= 5242880) {
            return Promise.reject('Storage is full');
        }

        return new Promise((resolve, reject) => {
            this.chromeStorage.set(data, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(data);
                }
            })
        })
    }

    // method to delete data from local storage
    async delete(key) {
        return new Promise((resolve, reject) => {
            this.chromeStorage.remove(key, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            })
        })
    }

    // method to clear all data from local storage
    async clear() {
        return new Promise((resolve, reject) => {
            this.chromeStorage.clear(() => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve();
                }
            })
        })
    }

    // method to update data in local storage
    async update(key, newValue) {
        return new Promise((resolve, reject) => {
            if (key) {
                this.chromeStorage.get(key, (result) => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                    } else {
                        let data = result[key];
                        if (data) {
                            data = Object.assign(data, newValue);
                            this.chromeStorage.set({ [key]: data }, () => {
                                if (chrome.runtime.lastError) {
                                    reject(chrome.runtime.lastError);
                                } else {
                                    resolve(data);
                                }
                            })
                        } else {
                            reject('Key not found');
                        }
                    }
                })
            }
        })
    }
}

// export StorageManager class
export default StorageManager;