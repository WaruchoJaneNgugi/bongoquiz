// BongoMain.tsx - Simplified Version
import { type FC, useCallback, useEffect, useState, useRef } from "react";
import { CELL_GRADIENT_COLORS, type CellState, type GameStatus} from "../types/bongotypes.ts";
import { BingoCanvas } from "./BongoCanvas.tsx";
import socketService from "../service/socketService.ts";
import '../assets/style.css'

export const BongoMain: FC = () => {
    const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
    const [cells, setCells] = useState<CellState[]>([]);
    const [selectedCell, setSelectedCell] = useState<number | null>(null);
    const [roomId, setRoomId] = useState<string>('');
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<any>(null);

    // Store cells in ref for use in callbacks
    const cellsRef = useRef<CellState[]>([]);

    // Update refs when state changes
    useEffect(() => {
        cellsRef.current = cells;
    }, [cells]);

    // Initialize game grid
    // In BongoMain.tsx, update the initializeCells function:
    const initializeCells = useCallback(() => {
        const gridCols = 4;
        const gridRows = 3;
        const newCells: CellState[] = [];

        for (let y = 0; y < gridRows; y++) {
            for (let x = 0; x < gridCols; x++) {
                const id = y * gridCols + x;
                const value = id + 1; // 1-12

                newCells.push({
                    id,
                    value,
                    isRevealed: false,
                    color: CELL_GRADIENT_COLORS[id % CELL_GRADIENT_COLORS.length][0], // Use first color as base
                    x,
                    y,
                });
            }
        }

        return newCells;
    }, []);

    // Generate or get room ID
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        let roomIdFromUrl = urlParams.get('room');

        if (!roomIdFromUrl) {
            roomIdFromUrl = generateRoomId();
            const newUrl = `${window.location.pathname}?room=${roomIdFromUrl}`;
            window.history.replaceState({}, '', newUrl);
        }

        setRoomId(roomIdFromUrl);
    }, []);

    // Connect to socket when roomId is available
    useEffect(() => {
        if (!roomId) return;

        const socket = socketService.connect(roomId);
        socketRef.current = socket;

        // Setup socket event listeners
        socketService.onGameStateUpdate((gameState: any) => {
            if (gameState && gameState.cells) {
                const currentCells = cellsRef.current;
                const mergedCells = gameState.cells.map((cell: any, index: number) => {
                    const existingCell = currentCells[index] || {
                        id: index,
                        value: index + 1,
                        x: index % 4,
                        y: Math.floor(index / 4),
                        color: CELL_COLORS[index % CELL_COLORS.length],
                        isRevealed: false
                    };

                    return {
                        ...existingCell,
                        isRevealed: cell.isRevealed || false
                    };
                });

                setCells(mergedCells.length > 0 ? mergedCells : initializeCells());
            }
        });

        socketService.onCellRevealed((cellId: number) => {
            setTimeout(() => {
                revealCell(cellId, false);
            }, 50);
        });

        socket.on('connect', () => {
            console.log('✅ Connected to multiplayer server');
            setIsConnected(true);
            socketService.joinGame(roomId, `Player_${Date.now()}`);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        return () => {
            socketService.disconnect();
        };
    }, [roomId, initializeCells]);

    // Generate room ID
    const generateRoomId = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    // Initialize cells on first render
    useEffect(() => {
        const initialCells = initializeCells();
        setCells(initialCells);
        cellsRef.current = initialCells;
    }, [initializeCells]);

    // Reveal cell function
    const revealCell = useCallback((cellId: number, isLocalClick = true) => {
        const currentCells = cellsRef.current;

        if (!currentCells[cellId] || currentCells[cellId].isRevealed) {
            return;
        }

        // Set selected cell for animation
        setSelectedCell(cellId);

        // Update cell state
        setTimeout(() => {
            setCells(prev => {
                const newCells = [...prev];
                if (newCells[cellId]) {
                    newCells[cellId] = {
                        ...newCells[cellId],
                        isRevealed: true
                    };
                }
                return newCells;
            });

            // Broadcast to other devices if local click
            if (isLocalClick && isConnected) {
                socketService.cellClicked(cellId);
            }

            // Reset selected cell
            setTimeout(() => {
                setSelectedCell(null);
            }, 500);
        }, 300);
    }, [isConnected]);

    // Handle local cell click
    const handleCellClick = useCallback((id: number) => {
        revealCell(id, true);
    }, [revealCell]);

    // Start/Restart game
    const handleStartGame = useCallback(() => {
        const newCells = initializeCells();
        setCells(newCells);
        cellsRef.current = newCells;
        setGameStatus('playing');
        setSelectedCell(null);
    }, [initializeCells]);

    // Auto-start game
    useEffect(() => {
        if (gameStatus === 'idle' || gameStatus === 'completed') {
            setTimeout(() => {
                handleStartGame();
            }, 2000);
        }
    }, [gameStatus, handleStartGame]);

    return (
        <>
                <BingoCanvas
                    cells={cells}
                    gameStatus={gameStatus}
                    onCellClick={handleCellClick}
                    selectedCell={selectedCell}
                />


            {/*<footer className="game-footer" style={{*/}
            {/*    padding: '20px',*/}
            {/*    textAlign: 'center',*/}
            {/*    width: '100%',*/}
            {/*    backgroundColor: '#FFFFFF',*/}
            {/*    borderTop: '2px solid #E0E0E0'*/}
            {/*}}>*/}
            {/*    <div className="connection-status" style={{*/}
            {/*        marginBottom: '10px',*/}
            {/*        fontSize: '14px'*/}
            {/*    }}>*/}
            {/*        <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>*/}
            {/*            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}*/}
            {/*        </div>*/}
            {/*        <div className="room-info" style={{ marginTop: '5px' }}>*/}
            {/*            <span>Room: <strong>{roomId}</strong></span>*/}
            {/*        </div>*/}
            {/*    </div>*/}

            {/*    <div className="instructions" style={{*/}
            {/*        fontSize: '12px',*/}
            {/*        color: '#666'*/}
            {/*    }}>*/}
            {/*        <p>✨ Click any box to reveal prizes!</p>*/}
            {/*        <p>📱 Share the room link for multiplayer</p>*/}
            {/*    </div>*/}
            {/*</footer>*/}
        </>
    );
};