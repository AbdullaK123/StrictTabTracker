import React from 'react';

export const PopupLayout = ({ children }) => {
    return (
        <div className="w-96 min-h-[400px] p-4">
            <header className="text-center mb-4">
                <h1 className="text-2xl font-bold text-red-600">StrictTabTracker</h1>
                <p className="text-gray-600">No Mercy for Procrastination</p>
            </header>
            
            <main>
                {children}
            </main>

            <footer className="mt-4 text-center text-sm text-gray-500">
                <p>Once enabled, there's no going back!</p>
            </footer>
        </div>
    );
};