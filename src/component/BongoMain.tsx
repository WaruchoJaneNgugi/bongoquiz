// BongoMain.tsx - Updated with randomized prizes
import { type FC, useCallback, useEffect, useState, useRef } from "react";
import { type CellState, type PrizeItem, getRandomPrizeItems, assignPrizesToCells } from "../types/bongotypes.ts";
import '../assets/style.css'
import { BongoCanvas} from "./BongoCanvas.tsx";

export const BongoMain: FC = () => {
    const [cells, setCells] = useState<CellState[]>([]);
    const [prizeItems, setPrizeItems] = useState<PrizeItem[]>([]);
    const cellsRef = useRef<CellState[]>([]);

    // Update refs when state changes
    useEffect(() => {
        cellsRef.current = cells;
    }, [cells]);

    // Initialize game grid with randomized prizes
    const initializeCells = useCallback(() => {
        const gridCols = 4;
        const gridRows = 3;
        const newCells: CellState[] = [];

        // Get random prize items
        const randomPrizes = getRandomPrizeItems(12);
        setPrizeItems(randomPrizes);

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
                    prizeItem: randomPrizes[id] // Assign prize item to cell
                });
            }
        }

        return newCells;
    }, []);

    // Initialize cells on first render
    useEffect(() => {
        const initialCells = initializeCells();
        setCells(initialCells);
        cellsRef.current = initialCells;
    }, [initializeCells]);

    const revealCell = useCallback((cellId: number, isLocalClick = true) => {
        const currentCells = cellsRef.current;

        if (!currentCells[cellId]) {
            console.error(`Cell ${cellId} not found`);
            return;
        }

        if (currentCells[cellId].isRevealed) {
            console.log(`Cell ${cellId} already revealed, ignoring`);
            return;
        }

        console.log(`✅ Revealing cell ${cellId}, isLocalClick: ${isLocalClick}`);

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

    // Function to reshuffle prizes (for testing or game reset)
    const reshufflePrizes = useCallback(() => {
        const newPrizeItems = getRandomPrizeItems(12);
        setPrizeItems(newPrizeItems);

        setCells(prev => prev.map((cell, index) => ({
            ...cell,
            isRevealed: false, // Reset revealed state
            prizeItem: newPrizeItems[index]
        })));
    }, []);

    return (
        <>
            <BongoCanvas
                cells={cells}
                onCellClick={handleCellClick}
            />

            {/* Optional: Add a button to reshuffle prizes */}
            <button
                onClick={reshufflePrizes}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    padding: '10px 20px',
                    background: 'linear-gradient(90deg, #4ECDC4, #06D6A0)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    zIndex: 100
                }}
            >
                Reshuffle Prizes
            </button>
        </>
    );
};