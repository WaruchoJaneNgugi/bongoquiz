// BongoMain.tsx - Fixed Version
import { type FC, useCallback, useEffect, useState, useRef } from "react";
import { type CellState} from "../types/bongotypes.ts";
// import socketService from "../service/socketService.ts";
import '../assets/style.css'
import { BongoCanvas} from "./BongoCanvas.tsx";

export const BongoMain: FC = () => {
    const [cells, setCells] = useState<CellState[]>([]);
    // const [selectedCell, setSelectedCell] = useState<number | null>(null);
    // const [roomId, setRoomId] = useState<string>('');
    // const [isConnected, setIsConnected] = useState(false);
    // const socketRef = useRef<any>(null);

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
                    x,
                    y,
                });
            }
        }

        return newCells;
    }, []);


    // // Initialize cells on first render
    useEffect(() => {
        const initialCells = initializeCells();
        setCells(initialCells);
        cellsRef.current = initialCells;
    }, [initializeCells]);

    const revealCell = useCallback((cellId: number, isLocalClick = true) => {
        // console.log('🔍 revealCell called with:', { cellId, isLocalClick });

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

    }, []);
    const handleCellClick = useCallback((id: number) => {
        console.log(`🎯 Cell clicked: ${id}`);
        revealCell(id, true);
    }, [revealCell]);

    return (
        <>
            <BongoCanvas
                cells={cells}
                onCellClick={handleCellClick}
            />
        </>
    );
};