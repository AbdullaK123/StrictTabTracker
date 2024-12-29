// import necessary stuff
import React, { useEffect, useState } from 'react';

const BlockPage = ({ timeSpent, totalAttempts, domain }) => {
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isShaking, setIsShaking] = useState(false);

    // Update elapsed time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeElapsed(prev => prev + 1000);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (ms) => {
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor(ms / (1000 * 60 * 60));
        return `${hours}h ${minutes}m ${seconds}s`;
    };

    const getProductivityComparison = (time) => {
        const hours = time / (1000 * 60 * 60);
        return {
            books: Math.floor(hours * 0.05), // Pages per hour reading
            exercise: Math.floor(hours * 2),  // Exercises you could have done
            learning: Math.floor(hours * 0.1) // New skills you could have learned
        };
    };

    const handleAttemptToLeave = () => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 1000);
    };

    const productivity = getProductivityComparison(timeSpent);

    return (
        <div className={`min-h-screen bg-black text-white p-8 ${isShaking ? 'animate-shake' : ''}`}>
            {/* Main Warning */}
            <div className="text-center mb-12">
                <h1 className="text-6xl font-bold text-red-500 animate-pulse mb-4">
                    ⚠️ TIME'S UP! ⚠️
                </h1>
                <p className="text-2xl text-red-300">
                    Your productivity is crying in the corner.
                </p>
            </div>

            {/* Time Stats */}
            <div className="max-w-2xl mx-auto bg-red-900/30 p-6 rounded-lg mb-8 animate-fadeIn">
                <h2 className="text-3xl font-bold mb-4 text-red-400">Time Wasted on {domain}</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-red-900/50 rounded">
                        <p className="text-lg">Today</p>
                        <p className="text-2xl font-bold">{formatTime(timeSpent)}</p>
                    </div>
                    <div className="text-center p-4 bg-red-900/50 rounded">
                        <p className="text-lg">Currently Blocked For</p>
                        <p className="text-2xl font-bold">{formatTime(timeElapsed)}</p>
                    </div>
                </div>
            </div>

            {/* Productivity Comparison */}
            <div className="max-w-2xl mx-auto bg-red-900/30 p-6 rounded-lg mb-8">
                <h2 className="text-2xl font-bold mb-4 text-red-400">
                    In this time, you could have:
                </h2>
                <ul className="space-y-4">
                    <li className="flex items-center">
                        <span className="text-xl">📚</span>
                        <span className="ml-2">Read {productivity.books} books</span>
                    </li>
                    <li className="flex items-center">
                        <span className="text-xl">💪</span>
                        <span className="ml-2">Done {productivity.exercise} workouts</span>
                    </li>
                    <li className="flex items-center">
                        <span className="text-xl">🎯</span>
                        <span className="ml-2">Learned {productivity.learning} new skills</span>
                    </li>
                </ul>
            </div>

            {/* Wall of Shame */}
            <div className="max-w-2xl mx-auto bg-red-900/30 p-6 rounded-lg mb-8">
                <h2 className="text-2xl font-bold mb-4 text-red-400">Wall of Shame</h2>
                <p className="text-xl">
                    You've tried to disable this {totalAttempts} times today. 
                    Your future self is disappointed.
                </p>
            </div>

            {/* Motivational Quote */}
            <div className="text-center mt-12">
                <p className="text-xl italic text-gray-400">
                    "Time you enjoy wasting was not wasted. But was this really enjoyable? 🤔"
                </p>
            </div>

            {/* Leave Button (that doesn't work) */}
            <div className="fixed bottom-8 right-8">
                <button
                    onClick={handleAttemptToLeave}
                    className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-600 transition-all"
                >
                    Try to Leave Anyway 😏
                </button>
            </div>
        </div>
    );
};

export default BlockPage;