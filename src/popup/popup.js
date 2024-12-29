import React from 'react';
import { createRoot } from 'react-dom/client';
import { WarningPopupSystem } from './components/WarningPopupSystem';
import { PopupLayout } from './components/PopupLayout';

// Initialize popup
const root = createRoot(document.getElementById('root'));

root.render(
    <PopupLayout>
        <WarningPopupSystem />
    </PopupLayout>
);