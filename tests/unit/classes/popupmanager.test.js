import { expect, test, describe, beforeEach, mock } from "bun:test";
import PopupManager from '../../../src/classes/PopupManager';

describe('PopupManager', () => {
    let popupManager;
    let mockStorageManager;
    let mockTimeManager;

    beforeEach(() => {
        // Mock dependencies
        mockStorageManager = {
            get: mock(async () => ({})),
            set: mock(async () => {})
        };

        mockTimeManager = {
            timeLimit: 30,
            setTimeLimit: mock((limit) => { 
                mockTimeManager.timeLimit = limit; 
            })
        };

        // Mock chrome APIs
        global.chrome = {
            windows: {
                create: mock(async () => ({ id: 1 }))
            },
            runtime: {
                getURL: mock(() => 'mock-url'),
                sendMessage: mock(async () => {})
            }
        };

        popupManager = new PopupManager(mockStorageManager, mockTimeManager);
    });

    describe('Setup Flow', () => {
        test('should start in setup step', () => {
            expect(popupManager.currentStep).toBe('setup');
        });

        test('should show setup window', async () => {
            await popupManager.showInitialSetup();
            expect(chrome.windows.create).toHaveBeenCalledWith({
                url: expect.any(String),
                type: 'popup',
                width: 500,
                height: 600
            });
        });

        test('should handle time limit setting', async () => {
            await popupManager.handleTimeLimitSet(45);
            expect(mockStorageManager.set).toHaveBeenCalledWith({
                'timeLimit': 45
            });
            expect(mockTimeManager.timeLimit).toBe(45 * 60 * 1000);
            expect(popupManager.currentStep).toBe('warnings');
        });
    });

    describe('Warning Sequence', () => {
        test('should start warning sequence at step 0', async () => {
            await popupManager.startWarningSequence();
            expect(popupManager.warningStep).toBe(0);
            expect(chrome.windows.create).toHaveBeenCalled();
        });

        test('should progress through warning steps', async () => {
            await popupManager.showNextWarning();
            expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
                type: 'UPDATE_WARNING',
                step: expect.any(Number)
            });
            expect(popupManager.warningStep).toBe(1);
        });

        test('should return correct warning messages', () => {
            expect(popupManager.getWarningMessage()).toContain('POINT OF NO RETURN');
            popupManager.warningStep = 1;
            expect(popupManager.getWarningMessage()).toContain('FINAL WARNING');
            popupManager.warningStep = 2;
            expect(popupManager.getWarningMessage()).toContain('LAST CHANCE');
        });

        test('should complete warning sequence', async () => {
            await popupManager.completeWarnings();
            expect(popupManager.currentStep).toBe('active');
            expect(mockStorageManager.set).toHaveBeenCalled();
        });
    });

    describe('State Management', () => {
        test('should save state', async () => {
            popupManager.currentStep = 'warnings';
            popupManager.warningStep = 2;
            popupManager.disableAttempts = 1;

            await popupManager.saveState();
            expect(mockStorageManager.set).toHaveBeenCalledWith({
                'currentStep': 'warnings',
                'warningStep': 2,
                'disableAttempts': 1
            });
        });

        test('should load state', async () => {
            const mockState = {
                currentStep: 'warnings',
                warningStep: 2,
                disableAttempts: 1
            };
            mockStorageManager.get = mock(async () => mockState);

            await popupManager.loadState();
            expect(popupManager.currentStep).toBe('warnings');
            expect(popupManager.warningStep).toBe(2);
            expect(popupManager.disableAttempts).toBe(1);
        });

        test('should handle empty state load', async () => {
            mockStorageManager.get = mock(async () => null);
            
            await popupManager.loadState();
            expect(popupManager.currentStep).toBe('setup');
            expect(popupManager.warningStep).toBe(0);
            expect(popupManager.disableAttempts).toBe(0);
        });
    });

    describe('Validation', () => {
        test('should validate confirmation phrase correctly', () => {
            expect(popupManager.validateConfirmation('wrong phrase')).toBe(false);
            expect(popupManager.validateConfirmation('I want to indulge in distractions right now')).toBe(true);
        });

        test('should track disable attempts', async () => {
            await popupManager.logAttempt();
            expect(popupManager.disableAttempts).toBe(1);
            expect(mockStorageManager.set).toHaveBeenCalled();
        });
    });

    describe('Utility Methods', () => {
        test('should get current state', () => {
            popupManager.currentStep = 'warnings';
            popupManager.warningStep = 2;
            popupManager.disableAttempts = 1;

            const state = popupManager.getCurrentState();
            expect(state).toEqual({
                currentStep: 'warnings',
                warningStep: 2,
                disableAttempts: 1
            });
        });

        test('should get time limit', async () => {
            mockStorageManager.get = mock(async () => ({ timeLimit: 45 }));
            
            const limit = await popupManager.getTimeLimit();
            expect(limit).toBe(45);
        });

        test('should handle missing time limit', async () => {
            mockStorageManager.get = mock(async () => null);
            
            const limit = await popupManager.getTimeLimit();
            expect(limit).toBeNull();
        });
    });
});