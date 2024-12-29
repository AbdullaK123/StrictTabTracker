import { expect, test, describe, beforeEach, afterEach, mock } from "bun:test";
import TimeManager from '../../../src/classes/TimeManager';

describe('TimeManager', () => {
   let timeManager;
   let mockStorageManager;
   let originalConsoleError;

   beforeEach(() => {
       // Store and mock console.error
       originalConsoleError = console.error;
       console.error = mock(() => {});

       // Create fresh mock storage manager for each test
       mockStorageManager = {
           get: mock(async () => ({})),
           set: mock(async () => {}),
           delete: mock(async () => {}),
           clear: mock(async () => {}),
           update: mock(async () => {})
       };

       timeManager = new TimeManager(mockStorageManager);
   });

   afterEach(() => {
       // Restore console.error
       console.error = originalConsoleError;
   });

   describe('Timer Management', () => {
       test('should start timer for new tab', async () => {
           const tabId = 1;
           const tabUrl = 'https://example.com';
           
           await timeManager.startTimer(tabId, tabUrl);

           expect(timeManager.activeTab).toEqual({
               id: tabId,
               url: tabUrl,
               startTime: expect.any(Number)
           });
           expect(timeManager.currentTimer).toBeTruthy();
       });

       test('should stop existing timer when starting new one', async () => {
           await timeManager.startTimer(1, 'https://first.com');
           const firstTimer = timeManager.currentTimer;
           
           await timeManager.startTimer(2, 'https://second.com');
           
           expect(timeManager.currentTimer).not.toBe(firstTimer);
       });

       test('should stop timer for active tab', async () => {
           await timeManager.startTimer(1, 'https://example.com');
           await timeManager.stopTimer(1);

           expect(timeManager.activeTab).toBeNull();
           expect(timeManager.currentTimer).toBeNull();
       });

       test('should not stop timer for inactive tab', async () => {
           await timeManager.startTimer(1, 'https://example.com');
           await timeManager.stopTimer(2);

           expect(timeManager.activeTab).not.toBeNull();
           expect(timeManager.currentTimer).not.toBeNull();
       });
   });

   describe('Time Data Management', () => {
       test('should update time data', async () => {
           const url = 'https://example.com';
           const duration = 5000;

           await timeManager.updateTimeData(url, duration);

           expect(mockStorageManager.set.mock.calls.length).toBe(1);
       });

       test('should handle missing time data', async () => {
           mockStorageManager.get = mock(async () => null);
           
           await timeManager.updateTimeData('https://example.com', 1000);

           expect(mockStorageManager.set.mock.calls.length).toBe(1);
       });

       test('should get tab statistics', async () => {
           const today = new Date().toDateString();
           mockStorageManager.get = mock(async () => ({
               [today]: 3600000 // 1 hour
           }));
           
           const stats = await timeManager.getTabStats('https://example.com');

           expect(stats).toEqual({
               daily: 3600000,
               weekly: 3600000,
               average: 3600000
           });
       });

       test('should return null stats for non-existent url', async () => {
           mockStorageManager.get = mock(async () => null);
           
           const stats = await timeManager.getTabStats('https://nonexistent.com');
           
           expect(stats).toBeNull();
       });
   });

   describe('Date Management', () => {
       test('should detect date rollover', async () => {
           mockStorageManager.get = mock(async () => '2023-01-01');
           
           await timeManager.checkDateRollover();

           expect(mockStorageManager.set.mock.calls.length).toBeGreaterThan(0);
       });

       test('should not reset on same day', async () => {
           const today = new Date().toDateString();
           mockStorageManager.get = mock(async () => today);
           
           await timeManager.checkDateRollover();

           expect(mockStorageManager.set.mock.calls.length).toBe(0);
       });
   });

   describe('Utility Functions', () => {
       test('should format duration correctly', () => {
           const duration = 3661000; // 1h 1m 1s
           const formatted = timeManager.formatDuration(duration);
           
           expect(formatted).toBe('1h 1m 1s');
       });

       test('should format zero duration', () => {
           expect(timeManager.formatDuration(0)).toBe('0h 0m 0s');
       });

       test('should handle large durations', () => {
           const day = 24 * 60 * 60 * 1000; // 24 hours in ms
           const formatted = timeManager.formatDuration(day);
           
           expect(formatted).toBe('24h 0m 0s');
       });
   });

   describe('Error Handling', () => {
       test('should handle storage errors in updateTimeData', async () => {
           mockStorageManager.set = mock(async () => {
               throw new Error('Storage error');
           });

           await timeManager.updateTimeData('https://example.com', 1000);
           expect(console.error.mock.calls.length).toBeGreaterThan(0);
       });

       test('should handle storage errors in checkDateRollover', async () => {
           mockStorageManager.get = mock(async () => {
               throw new Error('Storage error');
           });

           await timeManager.checkDateRollover();
           expect(console.error.mock.calls.length).toBeGreaterThan(0);
       });
   });
});