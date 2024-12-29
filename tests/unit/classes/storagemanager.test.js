// import the storage manager class
import StorageManager from '../../../src/classes/StorageManager';

// Mock storage manager with correct chrome.storage.local API methods
const mockStorageManager = {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),  // Changed from delete to remove
    clear: jest.fn()
}

const mockChromeRuntime = {
    lastError: null
}

// Mock chrome local storage and chrome runtime
global.chrome = {
    storage: {
        local: mockStorageManager
    },
    runtime: mockChromeRuntime
}

// Test suite for StorageManager class
describe('Storage Manager', () => {
    let storageManager;

    // Before each test case, reset the mock storage manager
    beforeEach(() => {
        jest.clearAllMocks();
        storageManager = new StorageManager();
        chrome.runtime.lastError = null;
    });

    // Test case for get method
    describe('get', () => {
        it('should return data from local storage', async () => {
            const mockData = { key: 'value' };
            mockStorageManager.get.mockImplementation((key, callback) => {
                callback(mockData);
            });

            const result = await storageManager.get('key');
            expect(result).toEqual(mockData);
        });

        it('should return all data when no key provided', async () => {
            const mockData = { key1: 'value1', key2: 'value2' };
            mockStorageManager.get.mockImplementation(function(key, callback) {
                callback(mockData);
            });

            const result = await storageManager.get();
            expect(result).toEqual(mockData);
        });

        it('should handle chrome runtime errors', async () => {
            const error = new Error('Storage error');
            mockStorageManager.get.mockImplementation((key, callback) => {
                chrome.runtime.lastError = error;
                callback(null);
            });

            await expect(storageManager.get('key')).rejects.toEqual(error);
        });
    });

    // Test case for set method
    describe('set', () => {
        it('should set data in local storage', async () => {
            const data = { key: 'value' };
            mockStorageManager.set.mockImplementation((data, callback) => {
                callback();
            });

            const result = await storageManager.set(data);
            expect(result).toEqual(data);
        });

        it('should handle chrome runtime errors', async () => {
            const error = new Error('Storage error');
            const data = { key: 'value' };
            mockStorageManager.set.mockImplementation((data, callback) => {
                chrome.runtime.lastError = error;
                callback();
            });

            await expect(storageManager.set(data)).rejects.toEqual(error);
        });

        it('should reject if data is not an object', async () => {
            await expect(storageManager.set('not an object')).rejects.toEqual('Data must be an object');
        });

        it('should reject if data exceeds storage limit', async () => {
            const largeData = { key: 'x'.repeat(5242880) };
            await expect(storageManager.set(largeData)).rejects.toEqual('Storage is full');
        });
    });

    // Test case for delete method
    describe('delete', () => {
        it('should delete data from local storage', async () => {
            mockStorageManager.remove.mockImplementation((key, callback) => {
                callback();
            });

            await storageManager.delete('key');
            expect(mockStorageManager.remove).toHaveBeenCalledWith('key', expect.any(Function));
        });

        it('should handle chrome runtime errors', async () => {
            const error = new Error('Storage error');
            mockStorageManager.remove.mockImplementation((key, callback) => {
                chrome.runtime.lastError = error;
                callback();
            });

            await expect(storageManager.delete('key')).rejects.toEqual(error);
        });
    });

    // Test case for clear method
    describe('clear', () => {
        it('should clear all data from local storage', async () => {
            mockStorageManager.clear.mockImplementation((callback) => {
                callback();
            });

            await storageManager.clear();
            expect(mockStorageManager.clear).toHaveBeenCalledWith(expect.any(Function));
        });

        it('should handle chrome runtime errors', async () => {
            const error = new Error('Storage error');
            mockStorageManager.clear.mockImplementation((callback) => {
                chrome.runtime.lastError = error;
                callback();
            });

            await expect(storageManager.clear()).rejects.toEqual(error);
        });
    });

    // Test case for update method
    describe('update', () => {
        it('should update data in local storage', async () => {
            const existingData = { key: 'old value' };
            const newValue = { newKey: 'new value' };
            const expectedData = { key: 'old value', newKey: 'new value' };

            mockStorageManager.get.mockImplementation((key, callback) => {
                callback({ key: existingData });
            });

            mockStorageManager.set.mockImplementation((data, callback) => {
                callback();
            });

            const result = await storageManager.update('key', newValue);
            expect(result).toEqual(expectedData);
        });

        it('should reject if key not found', async () => {
            mockStorageManager.get.mockImplementation((key, callback) => {
                callback({});  // Empty result
            });

            await expect(storageManager.update('key', { new: 'value' })).rejects.toEqual('Key not found');
        });

        it('should handle chrome runtime errors', async () => {
            const error = new Error('Storage error');
            mockStorageManager.get.mockImplementation((key, callback) => {
                chrome.runtime.lastError = error;
                callback(null);
            });

            await expect(storageManager.update('key', { new: 'value' })).rejects.toEqual(error);
        });
    });
});