// GamePage.tsx - OPTIMIZED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { BongoCanvas } from './BongoCanvas';
import { getSocket } from '../service/socket-service';
import type { CellState, GameState, GameStatus } from "../types/bongotypes.ts";

export const GameLobby: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [cells, setCells] = useState<CellState[]>([]);
    const [gameStatus, setGameStatus] = useState<GameStatus>('waiting');
    const [players, setPlayers] = useState<any[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize socket only once
    const socket = React.useMemo(() => getSocket(), []);

    useEffect(() => {
        if (!gameId) {
            setError("No game ID provided");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        // Connection handlers
        const handleConnect = () => {
            console.log('Socket connected');
            setIsConnected(true);
        };

        const handleDisconnect = () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        };

        // Game event handlers
        const handleGameState = (data: any) => {
            console.log('Game state received:', data);
            setGameState(data.gameState);
            setCells(data.gameState.cells || []);
            setGameStatus(data.gameState.gameStatus || 'waiting');
            setPlayers(data.gameState.players || []);
            setLoading(false);
        };

        const handlePlayerJoined = (data: any) => {
            setPlayers(data.players || []);
        };

        const handlePlayerLeft = (data: any) => {
            setPlayers(data.players || []);
        };

        const handleError = (data: any) => {
            console.error('Socket error:', data);
            setError(data.message || 'Connection error');
            setLoading(false);
        };

        // Setup event listeners
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('GAME_STATE', handleGameState);
        socket.on('GAME_UPDATE', handleGameState);
        socket.on('PLAYER_JOINED', handlePlayerJoined);
        socket.on('PLAYER_LEFT', handlePlayerLeft);
        socket.on('ERROR', handleError);

        // Connect to game
        const playerId = localStorage.getItem('playerId') || `player_${Date.now()}`;
        if (!localStorage.getItem('playerId')) {
            localStorage.setItem('playerId', playerId);
        }

        // Join game with timeout
        const joinTimeout = setTimeout(() => {
            if (loading) {
                setError('Connection timeout. Please refresh.');
                setLoading(false);
            }
        }, 5000);

        socket.emit('JOIN_GAME', {
            type: 'JOIN_GAME',
            gameId,
            playerId
        });

        // Check if already connected
        if (socket.connected) {
            setIsConnected(true);
        }

        return () => {
            clearTimeout(joinTimeout);
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('GAME_STATE', handleGameState);
            socket.off('GAME_UPDATE', handleGameState);
            socket.off('PLAYER_JOINED', handlePlayerJoined);
            socket.off('PLAYER_LEFT', handlePlayerLeft);
            socket.off('ERROR', handleError);

            // Only leave if component is unmounting
            if (!gameId) {
                socket.emit('LEAVE_GAME', {
                    type: 'LEAVE_GAME',
                    gameId,
                    playerId
                });
            }
        };
    }, [gameId, socket]);

    // Memoized click handler
    const handleCellClick = useCallback((cellId: number) => {
        if (!gameId || !socket || !isConnected) {
            console.warn('Cannot click: not connected');
            return;
        }

        const playerId = localStorage.getItem('playerId') || 'anonymous';
        socket.emit('CELL_CLICK', {
            type: 'CELL_CLICK',
            gameId,
            playerId,
            cellId
        });
    }, [gameId, socket, isConnected]);

    const handleSetSelectedCell = useCallback((cellId: number | null) => {
        // Optional: Handle selection
    }, []);

    // Loading screen
    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#191425',
                color: 'white'
            }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    border: '5px solid #f3f3f3',
                    borderTop: '5px solid #0A82E8',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
                <p style={{ marginTop: '20px', fontSize: '18px' }}>
                    Connecting to game room...
                </p>
                {!isConnected && (
                    <p style={{ color: '#FFD700', marginTop: '10px' }}>
                        Establishing connection...
                    </p>
                )}
            </div>
        );
    }

    // Error screen
    if (error) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#191425',
                color: 'white',
                padding: '20px',
                textAlign: 'center'
            }}>
                <h2 style={{ color: '#FF6B6B' }}>Connection Error</h2>
                <p>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        backgroundColor: '#0A82E8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Refresh Page
                </button>
            </div>
        );
    }

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#191425'
        }}>
            <div style={{
                padding: '15px',
                color: 'white',
                textAlign: 'center',
                backgroundColor: 'rgba(0,0,0,0.3)'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    <div style={{ textAlign: 'left' }}>
                        <h2 style={{ margin: 0 }}>Room: <strong>{gameId}</strong></h2>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            marginTop: '5px'
                        }}>
                            <div style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: isConnected ? '#4CAF50' : '#FF5722'
                            }} />
                            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <div>Players: <strong>{players.length}</strong></div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '5px',
                            marginTop: '5px',
                            flexWrap: 'wrap',
                            maxWidth: '300px'
                        }}>
                            {players.slice(0, 5).map(player => (
                                <span key={player.id} style={{
                                    padding: '3px 8px',
                                    backgroundColor: '#0A82E8',
                                    borderRadius: '10px',
                                    fontSize: '12px'
                                }}>
                                    {player.id.slice(0, 6)}...
                                </span>
                            ))}
                            {players.length > 5 && (
                                <span style={{
                                    padding: '3px 8px',
                                    backgroundColor: '#9556CE',
                                    borderRadius: '10px',
                                    fontSize: '12px'
                                }}>
                                    +{players.length - 5} more
                                </span>
                            )}
                        </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <div>Status: <strong>{gameStatus.toUpperCase()}</strong></div>
                        <button
                            onClick={() => navigator.clipboard.writeText(window.location.href)}
                            style={{
                                marginTop: '5px',
                                padding: '5px 10px',
                                backgroundColor: 'transparent',
                                color: 'white',
                                border: '1px solid white',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            Copy Link
                        </button>
                    </div>
                </div>
            </div>

            <div style={{
                flex: 1,
                minHeight: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}>
                <div style={{
                    width: '100%',
                    height: '100%',
                    maxWidth: '900px',
                    maxHeight: '700px'
                }}>
                    <BongoCanvas
                        cells={cells}
                        gameStatus={gameStatus}
                        onCellClick={handleCellClick}
                        selectedCell={null}
                        OnSetSelectedCell={handleSetSelectedCell}
                    />
                </div>
            </div>
        </div>
    );
};