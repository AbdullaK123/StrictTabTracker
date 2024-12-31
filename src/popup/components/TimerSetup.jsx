import React, { useState } from 'react';


const TimerSetup = ({ onSetLimit }) => {
    const [timeLimit, setTimeLimit] = useState(30); 
    
    return (
        <div className="p-6 bg-white rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Set Your Time Limit</h2>
            
            {/* Time Selection */}
            <div className="mb-6">
                <label className="block text-gray-700 mb-2">Time Limit (minutes)</label>
                <select 
                    value={timeLimit} 
                    onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                    className="w-full p-2 border rounded"
                >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                    <option value={180}>3 hours</option>
                    <option value={240}>4 hours</option>
                </select>
            </div>

            {/* Warning about no pausing */}
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded">
                <p className="font-bold">⚠️ Warning</p>
                <p>Once started, this timer CANNOT be paused or reset!</p>
            </div>

            {/* Start Button */}
            <button 
                onClick={() => onSetLimit(timeLimit)}
                className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 font-bold"
            >
                Start Strict Timer
            </button>
        </div>
    );
};

export default TimerSetup;