// BongoMain.tsx - Fixed Version
import { type FC, useCallback, useEffect, useState, useRef } from "react";
import { CELL_GRADIENT_COLORS, type CellState, type GameStatus} from "../types/bongotypes.ts";
import socketService from "../service/socketService.ts";
import '../assets/style.css'
import { BongoCanvas} from "./BongoCanvas.tsx";

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
                    color: CELL_GRADIENT_COLORS[id % CELL_GRADIENT_COLORS.length][0],
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
            console.log('📥 Received game state update:', gameState);

            if (gameState && gameState.cells) {
                // Use the server's cell state directly
                const serverCells = gameState.cells.map((cell: any) => ({
                    id: cell.id,
                    value: cell.value || cell.id + 1,
                    isRevealed: cell.isRevealed || false,
                    color: CELL_GRADIENT_COLORS[cell.id % CELL_GRADIENT_COLORS.length][0],
                    x: cell.x || cell.id % 4,
                    y: cell.y || Math.floor(cell.id / 4)
                }));

                console.log('🔄 Setting cells from server:', serverCells);
                setCells(serverCells);
            }
        });

        socketService.onCellRevealed((cellId: number) => {
            console.log('📥 Cell revealed from server:', cellId);
            // Update local state when server broadcasts a cell reveal
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
    }, [roomId]);

    // Generate room ID
    const generateRoomId = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    // Initialize cells on first render
    useEffect(() => {
        const initialCells = initializeCells();
        setCells(initialCells);
        cellsRef.current = initialCells;
        setGameStatus('playing');
    }, [initializeCells]);

    // Reveal cell function
    const revealCell = useCallback((cellId: number, isLocalClick = true) => {
        console.log('🔍 revealCell called with:', { cellId, isLocalClick });

        const currentCells = cellsRef.current;

        // Check if cell exists and isn't already revealed
        if (!currentCells[cellId]) {
            console.error(`Cell ${cellId} not found`);
            return;
        }

        if (currentCells[cellId].isRevealed) {
            console.log(`Cell ${cellId} already revealed, ignoring`);
            return;
        }

        console.log(`✅ Revealing cell ${cellId}, isLocalClick: ${isLocalClick}`);

        // Update state immediately for instant feedback
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

        // Broadcast to other devices if this was a local click
        if (isLocalClick && isConnected && socketRef.current) {
            console.log(`📡 Broadcasting cell ${cellId} to other players`);
            socketService.cellClicked(cellId);
        }
    }, [isConnected]);

    // Handle local cell click
    const handleCellClick = useCallback((id: number) => {
        console.log(`🎯 Cell clicked: ${id}`);
        revealCell(id, true);
    }, [revealCell]);

    return (
        <>
            <BongoCanvas
                cells={cells}
                gameStatus={gameStatus}
                onCellClick={handleCellClick}
                selectedCell={selectedCell}
                OnSetSelectedCell={setSelectedCell}
            />
        </>
    );
};