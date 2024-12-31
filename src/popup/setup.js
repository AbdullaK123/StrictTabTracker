import React from 'react';
import { createRoot } from 'react-dom/client';
import TimerSetupComponent from './components/TimerSetupComponent';

const root = createRoot(document.getElementById('setup-root'));

root.render(
    <TimerSetupComponent 
        onSetLimit={(limit) => {
            chrome.runtime.sendMessage({ 
                type: 'SET_TIME_LIMIT', 
                limit 
            });
        }}
    />
);