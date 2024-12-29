import React, { useState } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from '@/components/ui/alert-dialog';

const WarningPopupSystem = ({ onConfirm, onCancel }) => {
    const [step, setStep] = useState(0);
    const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);
    const [inputPhrase, setInputPhrase] = useState('');

    const warningSteps = [
        {
            title: "⚠️ POINT OF NO RETURN ⚠️",
            description: "Once you start this timer, there is NO GOING BACK. No pause button. No stop button. No escape. Are you really sure about this?",
            buttonText: "I think I can handle it..."
        },
        {
            title: "🚨 FINAL WARNING 🚨",
            description: "This is not like other timers. You can't pause it. You can't stop it. You can't negotiate with it. It's more stubborn than a toddler at bedtime.",
            buttonText: "I'm still brave enough..."
        },
        {
            title: "🔥 LAST CHANCE TO BACK OUT 🔥",
            description: "Even if your house is on fire, this timer will keep running. Even if your cat walks across your keyboard, it won't stop. Even if you try the puppy dog eyes, it won't care.",
            buttonText: "I accept these harsh terms"
        }
    ];

    const handleNext = () => {
        if (step < warningSteps.length - 1) {
            setStep(step + 1);
        } else {
            setShowFinalConfirmation(true);
        }
    };

    const handleFinalConfirmation = () => {
        if (inputPhrase === "I solemnly swear to accept the consequences of my actions") {
            onConfirm();
        }
    };

    return (
        <div className="fixed inset-0">
            {!showFinalConfirmation ? (
                <AlertDialog open={true}>
                    <AlertDialogContent className="max-w-xl bg-red-50 border-2 border-red-500">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-2xl text-red-600 animate-pulse">
                                {warningSteps[step].title}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-lg text-gray-700">
                                {warningSteps[step].description}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <div className="flex gap-4">
                                <AlertDialogAction
                                    onClick={onCancel}
                                    className="bg-gray-500 text-white hover:bg-gray-600 px-4 py-2 rounded"
                                >
                                    I'm not ready for this
                                </AlertDialogAction>
                                <AlertDialogAction
                                    onClick={handleNext}
                                    className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded font-bold animate-pulse"
                                >
                                    {warningSteps[step].buttonText}
                                </AlertDialogAction>
                            </div>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            ) : (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg max-w-xl w-full mx-4">
                        <h2 className="text-2xl font-bold text-red-600 mb-4 animate-bounce">
                            🔒 THE ULTIMATE COMMITMENT 🔒
                        </h2>
                        <p className="text-lg mb-6">
                            By proceeding, you're entering a binding contract with your future self. 
                            Type the following phrase to confirm your commitment:
                        </p>
                        <div className="space-y-4">
                            <p className="text-gray-700 font-mono bg-gray-100 p-3 rounded">
                                I solemnly swear to accept the consequences of my actions
                            </p>
                            <input 
                                type="text"
                                placeholder="Type the phrase exactly..."
                                value={inputPhrase}
                                onChange={(e) => setInputPhrase(e.target.value)}
                                className="w-full p-3 border-2 border-red-300 rounded focus:outline-none focus:border-red-500"
                            />
                            <div className="flex justify-between mt-4">
                                <button 
                                    onClick={onCancel}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    I'm having second thoughts...
                                </button>
                                <button
                                    onClick={handleFinalConfirmation}
                                    className={`bg-red-500 text-white px-6 py-3 rounded-lg font-bold transition-all 
                                        ${inputPhrase === "I solemnly swear to accept the consequences of my actions" 
                                            ? "opacity-100 hover:bg-red-600" 
                                            : "opacity-50 cursor-not-allowed"}`}
                                    disabled={inputPhrase !== "I solemnly swear to accept the consequences of my actions"}
                                >
                                    I Accept My Fate
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WarningPopupSystem;