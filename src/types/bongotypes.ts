// export type GameStatus = 'idle' | 'playing' | 'revealing' | 'completed' | 'waiting';

export interface CellState {
    id: number;
    x: number;
    y: number;
    value: number;
    isRevealed: boolean;
    revealedBy?: string;
    revealedAt?: Date;
    prizeItem?: PrizeItem; // Add prize item to cell
}

// export interface Player {
//     id: string;
//     name?: string;
//     color?: string;
//     joinedAt: Date;
// }

export interface PrizeItem {
    id: number;
    name: string;
    img: string;
}

// Import all the prize images
import BonusTime from "../assets/Items/BonusTime.png";
import BorrowedBrain from "../assets/Items/BorrowedBrain.png";
import Disqualified from "../assets/Items/Disqualified.png";
import DoubleOrNothing from "../assets/Items/DoubleorNothing.png";
import DoublePoints from "../assets/Items/DoublePoints2.png";
import FreezeFrame from "../assets/Items/FreezeFrame.png";
import Insurance from "../assets/Items/insurance.png";
import MirrorEffect from "../assets/Items/MirrorEffect.png";
import NoPenalty from "../assets/Items/nopenalty.png";
import PointChanceBrain from "../assets/Items/pointChanceBrain.png";
import PointGamble from "../assets/Items/PointGamble.png";
import QuestionSwap from "../assets/Items/questionswap.png";
import SecondChance from "../assets/Items/secondchance.png";
import StealAPoint from "../assets/Items/StealAPoint.png";
import SuddenDeathDisqualified from "../assets/Items/SuddenDeathDisqualified.png";
import SwapFate from "../assets/Items/SwapFate.png";
import TimeTax from "../assets/Items/TimeTax.png";

// Create prize items with IDs, names, and images
export const PRIZE_ITEMS: PrizeItem[] = [
    { id: 1, name: "Bonus Time", img: BonusTime },
    { id: 2, name: "Borrowed Brain", img: BorrowedBrain },
    { id: 3, name: "Disqualified", img: Disqualified },
    { id: 4, name: "Double Or Nothing", img: DoubleOrNothing },
    { id: 5, name: "Double Points", img: DoublePoints },
    { id: 6, name: "Freeze Frame", img: FreezeFrame },
    { id: 7, name: "Insurance", img: Insurance },
    { id: 8, name: "Mirror Effect", img: MirrorEffect },
    { id: 9, name: "No Penalty", img: NoPenalty },
    { id: 10, name: "Point Chance Brain", img: PointChanceBrain },
    { id: 11, name: "Point Gamble", img: PointGamble },
    { id: 12, name: "Question Swap", img: QuestionSwap },
    { id: 13, name: "Second Chance", img: SecondChance },
    { id: 14, name: "Steal A Point", img: StealAPoint },
    { id: 15, name: "Sudden Death Disqualified", img: SuddenDeathDisqualified },
    { id: 16, name: "Swap Fate", img: SwapFate },
    { id: 17, name: "Time Tax", img: TimeTax }
];

// Function to get random prize items (12 items for 12 boxes)
export const getRandomPrizeItems = (count: number = 12): PrizeItem[] => {
    // Create a copy of all prize items
    const allItems = [...PRIZE_ITEMS];

    // Shuffle the array using Fisher-Yates algorithm
    for (let i = allItems.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allItems[i], allItems[j]] = [allItems[j], allItems[i]];
    }

    // Take the first 'count' items
    return allItems.slice(0, count);
};

// Function to assign prize items to cells
export const assignPrizesToCells = (cells: CellState[], prizeItems: PrizeItem[]): CellState[] => {
    // Ensure we have enough prizes for cells
    const items = prizeItems.slice(0, cells.length);

    return cells.map((cell, index) => ({
        ...cell,
        prizeItem: items[index]
    }));
};
// Simple white color for all boxes (optional - you can keep colors for hover effects)export
export const CELL_SOLID_COLORS = [
    '#F44336', // 1 Red
    '#2196F3', // 2 Blue
    '#4CAF50', // 3 Green
    '#FF9800', // 4 Orange
    '#9C27B0', // 5 Purple
    '#3F51B5', // 6 Indigo
    '#009688', // 7 Teal
    '#FF5722', // 8 Deep Orange
    '#673AB7', // 9 Deep Purple
    '#00BCD4', // 10 Cyan
    '#8BC34A', // 11 Light Green
    '#FFC107', // 12 Amber
];
// bongotypes.ts - Update with gradient color pairs
// export const CELL_GRADIENT_COLORS = [
//     // Each pair is [topColor, bottomColor] for gradient
//     ['#FF6B6B', '#FF8E8E'], // Red gradient
//     ['#4ECDC4', '#6AFFEF'], // Teal gradient
//     ['#FFD166', '#FFE699'], // Yellow gradient
//     ['#06D6A0', '#0CF7B6'], // Green gradient
//     ['#118AB2', '#1AB2E8'], // Blue gradient
//     ['#EF476F', '#FF6B9D'], // Pink gradient
//     ['#7209B7', '#9D4EDD'], // Purple gradient
//     ['#F8961E', '#FFB347'], // Orange gradient
//     ['#43AA8B', '#5FD6AD'], // Mint gradient
//     ['#577590', '#7B9BC2'], // Steel blue gradient
//     ['#F94144', '#FF6B6B'], // Bright red gradient
//     ['#90BE6D', '#B0D68C'], // Lime gradient
// ];
export const CELL_GRADIENT_COLORS = [
    // Exact colors from your image - each is [topColor, bottomColor]
    // Row 1
    ['#0A82E8', '#02469f'], // Box 1 – Royal Blue
    ['#9556CE', '#5f027c'], // Box 2 – Game Show Red
    ['#5f6372', '#1c202a'], // Box 3 – Silver / Neutral
    ['#F9A825', '#ffdd00'], // Box 4 – Golden Orange

// Row 2
    ['#0e9b15', '#00ff13'], // Box 5 – Rich Green
    ['#FBC02D', '#F57F17'], // Box 6 – Bright Gold
    ['#0754a1', '#0050ff'], // Box 7 – Deep Navy
    ['#7B1FA2', '#bf00ff'], // Box 8 – Show Purple

// Row 3
    ['#1976D2', '#00c4ff'], // Box 9 – Bright Blue
    ['#ff00d5', '#570017'], // Box 10 – Magenta Pink

    ['#555761', 'rgba(0,0,0,0.15)'],// Box 11 – Premium Black
    ['#fd0000', '#651503'], // Box 12 – Light Silver

];