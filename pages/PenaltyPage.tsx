import React, { useState, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { LeaderboardEntry } from '../types';

type GameState = 'start' | 'aiming' | 'shot' | 'result';
type Target = 'top-left' | 'mid-left' | 'center' | 'mid-right' | 'top-right';
const targets: Target[] = ['top-left', 'mid-left', 'center', 'mid-right', 'top-right'];

const targetPositions: { [key in Target]: { top: string; left: string, transform: string } } = {
    'top-left': { top: '15%', left: '10%', transform: 'translate(-50%, -50%) scale(2)' },
    'mid-left': { top: '60%', left: '15%', transform: 'translate(-50%, -50%) scale(1.5)' },
    'center': { top: '65%', left: '50%', transform: 'translate(-50%, -50%) scale(1.2)' },
    'mid-right': { top: '60%', left: '85%', transform: 'translate(-50%, -50%) scale(1.5)' },
    'top-right': { top: '15%', left: '90%', transform: 'translate(-50%, -50%) scale(2)' },
};

const keeperPositions: { [key in Target]: React.CSSProperties } = {
    'top-left': { transform: 'translateX(-120%) translateY(-60%) rotate(-45deg) scale(1.1)', top: '50%' },
    'mid-left': { transform: 'translateX(-100%) translateY(0%)', top: '50%' },
    'center': { transform: 'translateY(10%)', top: '50%' },
    'mid-right': { transform: 'translateX(100%) translateY(0%)', top: '50%' },
    'top-right': { transform: 'translateX(120%) translateY(-60%) rotate(45deg) scale(1.1)', top: '50%' },
};

const Goalkeeper: React.FC = () => {
    return (
        <svg viewBox="0 0 40 60" className="w-full h-full drop-shadow-md">
            {/* Head */}
            <circle cx="20" cy="8" r="7" fill="#1F2937" />
            {/* Jersey */}
            <path d="M5,16 h30 l-5,30 h-20 Z" fill="#FBBF24" />
            {/* Shorts */}
            <path d="M10,46 h20 l-2,12 h-16 Z" fill="#1F2937" />
        </svg>
    );
};

const PenaltyPage: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('start');
    const [currentScore, setCurrentScore] = useState(0);
    const [highScore, setHighScore] = useLocalStorage<number>('penalty_highscore', 0);
    const [leaderboard, setLeaderboard] = useLocalStorage<LeaderboardEntry[]>('penalty_leaderboard', []);
    const [playerName, setPlayerName] = useLocalStorage<string>('penalty_playername', 'Joueur 1');
    const [shotResult, setShotResult] = useState<'goal' | 'saved' | null>(null);

    // Animation state
    const [ballPosition, setBallPosition] = useState<{top: string, left: string, transform: string}>({ top: '90%', left: '50%', transform: 'translate(-50%, -50%) scale(1)'});
    const [keeperPosition, setKeeperPosition] = useState<React.CSSProperties>({ transform: 'translateY(0)', top: '50%' });
    
    const topPlayer = leaderboard.length > 0 ? leaderboard[0] : null;

    const handleShoot = (target: Target) => {
        if (gameState !== 'aiming') return;

        setGameState('shot');
        const keeperChoice = targets[Math.floor(Math.random() * targets.length)];

        setBallPosition(targetPositions[target]);

        setTimeout(() => {
            setKeeperPosition(keeperPositions[keeperChoice]);
            const isGoal = target !== keeperChoice;

            setTimeout(() => {
                setShotResult(isGoal ? 'goal' : 'saved');
                if (isGoal) {
                    setCurrentScore(prev => prev + 1);
                } else {
                    updateScores();
                }
                setGameState('result');
            }, 500);
        }, 200);
    };
    
    const updateScores = () => {
        if (currentScore > highScore) {
            setHighScore(currentScore);
        }

        const newLeaderboard = [...leaderboard, { name: playerName, score: currentScore }];
        newLeaderboard.sort((a, b) => b.score - a.score);
        setLeaderboard(newLeaderboard.slice(0, 10));
    };

    const nextRound = () => {
        setGameState('aiming');
        setShotResult(null);
        setBallPosition({ top: '90%', left: '50%', transform: 'translate(-50%, -50%) scale(1)'});
        setKeeperPosition({ transform: 'translateY(0)', top: '50%' });
    };
    
    const playAgain = () => {
        setCurrentScore(0);
        nextRound();
    };

    const LeaderboardDisplay = useMemo(() => (
        <div className="bg-gray-800/50 rounded-lg p-4 sm:p-6 border border-gray-700 w-full">
            <h3 className="text-xl sm:text-2xl font-bold text-[#fd6c9e] mb-4 text-center">LEADERBOARD</h3>
            <div className="space-y-2">
                {leaderboard.length > 0 ? leaderboard.map((entry, index) => (
                    <div key={index} className={`flex justify-between items-center p-2 rounded ${index === 0 ? 'bg-yellow-500/20' : 'bg-gray-700/50'}`}>
                        <span className="font-bold text-white">#{index + 1} {entry.name}</span>
                        <span className="text-lg font-bold text-[#fd6c9e]">{entry.score}</span>
                    </div>
                )) : <p className="text-center text-gray-400">Aucun score pour le moment.</p>}
            </div>
        </div>
    ), [leaderboard]);

    if (gameState === 'start') {
        return (
            <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-8 text-center">
                <h2 className="text-4xl font-bold text-[#fd6c9e]">PENALTY SHOOTOUT</h2>
                <p className="text-lg text-gray-300 max-w-2xl">Marquez le plus de buts consécutifs possible pour atteindre le meilleur score. Choisissez une des 5 cibles pour tirer.</p>
                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 w-full flex flex-col items-center justify-center">
                        <label htmlFor="playerName" className="block text-lg font-medium text-gray-300 mb-2">Votre Pseudo</label>
                        <input
                            type="text"
                            id="playerName"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            className="text-center block w-full max-w-xs bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-rose-500 focus:border-rose-500"
                        />
                         <p className="text-sm mt-4 text-gray-400">Record Personnel: <span className="font-bold text-white">{highScore}</span></p>
                        <button onClick={() => setGameState('aiming')} className="mt-6 w-full max-w-xs justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-rose-500 transition-transform transform hover:scale-105">
                            Commencer
                        </button>
                    </div>
                    {LeaderboardDisplay}
                </div>
            </div>
        );
    }
    

    return (
        <div className="container mx-auto px-4 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 flex flex-col items-center gap-4">
                    <div className="grid grid-cols-3 divide-x divide-gray-600 w-full max-w-2xl text-center bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                        <div>
                            <p className="text-sm text-[#fd6c9e] font-bold">SCORE ACTUEL</p>
                            <p className="text-4xl font-bold">{currentScore}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-400 font-bold">RECORD PERSO</p>
                            <p className="text-4xl font-bold">{highScore}</p>
                        </div>
                         <div>
                            <p className="text-sm text-yellow-500 font-bold">MEILLEUR SCORE</p>
                            {topPlayer ? (
                                <>
                                    <p className="text-4xl font-bold">{topPlayer.score}</p>
                                    <p className="text-xs text-gray-300 -mt-1">{topPlayer.name}</p>
                                </>
                            ) : (
                                <p className="text-4xl font-bold">-</p>
                            )}
                        </div>
                    </div>
                    <div className="relative w-full max-w-2xl aspect-[4/3] bg-green-600 bg-opacity-20 border-4 border-white rounded-lg overflow-hidden select-none">
                        {/* Field Background */}
                        <div className="absolute inset-0 bg-no-repeat bg-center bg-cover" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/lined-paper-2.png')", opacity: 0.1}}></div>
                        {/* Goal */}
                        <div className="absolute top-[10%] left-[5%] w-[90%] h-[50%] border-4 border-l-white border-r-white border-t-white border-b-transparent">
                            {/* Net pattern */}
                             <div className="absolute inset-0 bg-repeat bg-center" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.2\" fill-rule=\"evenodd\"%3E%3Cpath d=\"M0 0h20v1H0zM0 2h20v1H0zM0 4h20v1H0zM0 6h20v1H0zM0 8h20v1H0zM0 10h20v1H0zM0 12h20v1H0zM0 14h20v1H0zM0 16h20v1H0zM0 18h20v1H0z\"/%3E%3C/g%3E%3C/svg%3E')"}}></div>
                        </div>

                        {/* Game Elements */}
                        <div className="absolute top-0 left-0 w-full h-full">
                             {/* Goalkeeper */}
                            <div className="absolute left-1/2 -translate-x-1/2 w-16 h-24 transition-transform duration-300 ease-out" style={keeperPosition}>
                                <Goalkeeper />
                            </div>

                            {/* Ball */}
                            <div className="absolute w-8 h-8 bg-white rounded-full transition-all duration-500 ease-in-out" style={ballPosition}></div>
                        </div>
                        

                        {/* Targets overlay */}
                        {gameState === 'aiming' && (
                            <div className="absolute inset-0">
                                {targets.map(target => (
                                    <button key={target} onClick={() => handleShoot(target)} className="absolute w-1/5 h-1/4 bg-white/20 hover:bg-white/40 rounded-full border-2 border-dashed border-white/50 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer" style={{ top: targetPositions[target].top, left: targetPositions[target].left }} aria-label={`Tirer vers ${target}`}></button>
                                ))}
                            </div>
                        )}

                        {/* Result Message Overlay */}
                        {gameState === 'result' && (
                            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-center">
                                {shotResult === 'goal' && (
                                    <>
                                        <h2 className="text-7xl font-extrabold text-green-400 drop-shadow-lg">BUT!</h2>
                                        <button onClick={nextRound} className="mt-4 bg-white text-black px-6 py-2 rounded-lg font-bold">Tir Suivant</button>
                                    </>
                                )}
                                {shotResult === 'saved' && (
                                    <>
                                        <h2 className="text-7xl font-extrabold text-red-500 drop-shadow-lg">ARRÊTÉ!</h2>
                                        <p className="text-2xl mt-2">Score Final: {currentScore}</p>
                                        <button onClick={playAgain} className="mt-4 bg-rose-600 text-white px-6 py-2 rounded-lg font-bold">Rejouer</button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="w-full lg:col-span-1">
                    {LeaderboardDisplay}
                </div>
            </div>
        </div>
    );
};

export default PenaltyPage;