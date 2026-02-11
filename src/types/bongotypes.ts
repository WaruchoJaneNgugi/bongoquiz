
export interface CellState {
    id: number;
    x: number;
    y: number;
    value: number;
    isRevealed: boolean;
    revealedBy?: string;
    revealedAt?: Date;
    prizeItem?: PrizeItem;
}

export interface PrizeItem {
    id: number;
    name: string;
    img: string;
    description?: string; // Optional description
    effect?: string; // Optional game effect
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

// Master list of all available prize items
export const PRIZE_ITEMS: PrizeItem[] = [
    { id: 1, name: "Bonus Time", img: BonusTime, description: "Extra time added to your turn" },
    { id: 2, name: "Borrowed Brain", img: BorrowedBrain, description: "Steal an answer from another player" },
    { id: 3, name: "Disqualified", img: Disqualified, description: "You are disqualified from this round" },
    { id: 4, name: "Double Or Nothing", img: DoubleOrNothing, description: "Risk your points for double or nothing" },
    { id: 5, name: "Double Points", img: DoublePoints, description: "Earn double points for your next answer" },
    { id: 6, name: "Freeze Frame", img: FreezeFrame, description: "Freeze another player's turn" },
    { id: 7, name: "Insurance", img: Insurance, description: "Protect your points from being stolen" },
    { id: 8, name: "Mirror Effect", img: MirrorEffect, description: "Mirror another player's score" },
    { id: 9, name: "No Penalty", img: NoPenalty, description: "Avoid penalty for wrong answer" },
    { id: 10, name: "Point Chance Brain", img: PointChanceBrain, description: "50% chance to double your points" },
    { id: 11, name: "Point Gamble", img: PointGamble, description: "Gamble your points on the next question" },
    { id: 12, name: "Question Swap", img: QuestionSwap, description: "Swap the current question" },
    { id: 13, name: "Second Chance", img: SecondChance, description: "Get a second chance on wrong answer" },
    { id: 14, name: "Steal A Point", img: StealAPoint, description: "Steal a point from another player" },
    { id: 15, name: "Sudden Death Disqualified", img: SuddenDeathDisqualified, description: "Sudden death - next wrong answer loses" },
    { id: 16, name: "Swap Fate", img: SwapFate, description: "Swap scores with another player" },
    { id: 17, name: "Time Tax", img: TimeTax, description: "Pay time penalty for advantage" }
];

// Custom list 1: Classic Mix
export const CUSTOM_PRIZE_LIST_1: PrizeItem[] = [
    PRIZE_ITEMS.find(item => item.name === "Double Points")!,
    PRIZE_ITEMS.find(item => item.name === "Second Chance")!,
    PRIZE_ITEMS.find(item => item.name === "Steal A Point")!,
    PRIZE_ITEMS.find(item => item.name === "Insurance")!,
    PRIZE_ITEMS.find(item => item.name === "Freeze Frame")!,
    PRIZE_ITEMS.find(item => item.name === "No Penalty")!,
    PRIZE_ITEMS.find(item => item.name === "Bonus Time")!,
    PRIZE_ITEMS.find(item => item.name === "Question Swap")!,
    PRIZE_ITEMS.find(item => item.name === "Mirror Effect")!,
    PRIZE_ITEMS.find(item => item.name === "Point Gamble")!,
    PRIZE_ITEMS.find(item => item.name === "Swap Fate")!,
    PRIZE_ITEMS.find(item => item.name === "Time Tax")!,
];

// Custom list 2: High Risk
export const CUSTOM_PRIZE_LIST_2: PrizeItem[] = [
    PRIZE_ITEMS.find(item => item.name === "Double Or Nothing")!,
    PRIZE_ITEMS.find(item => item.name === "Point Gamble")!,
    PRIZE_ITEMS.find(item => item.name === "Sudden Death Disqualified")!,
    PRIZE_ITEMS.find(item => item.name === "Disqualified")!,
    PRIZE_ITEMS.find(item => item.name === "Double Points")!,
    PRIZE_ITEMS.find(item => item.name === "Steal A Point")!,
    PRIZE_ITEMS.find(item => item.name === "Swap Fate")!,
    PRIZE_ITEMS.find(item => item.name === "Time Tax")!,
    PRIZE_ITEMS.find(item => item.name === "Borrowed Brain")!,
    PRIZE_ITEMS.find(item => item.name === "Mirror Effect")!,
    PRIZE_ITEMS.find(item => item.name === "Point Chance Brain")!,
    PRIZE_ITEMS.find(item => item.name === "Freeze Frame")!,
];

// Custom list 3: Friendly Game
export const CUSTOM_PRIZE_LIST_3: PrizeItem[] = [
    PRIZE_ITEMS.find(item => item.name === "Bonus Time")!,
    PRIZE_ITEMS.find(item => item.name === "Second Chance")!,
    PRIZE_ITEMS.find(item => item.name === "No Penalty")!,
    PRIZE_ITEMS.find(item => item.name === "Insurance")!,
    PRIZE_ITEMS.find(item => item.name === "Double Points")!,
    PRIZE_ITEMS.find(item => item.name === "Question Swap")!,
    PRIZE_ITEMS.find(item => item.name === "Time Tax")!,
    PRIZE_ITEMS.find(item => item.name === "Point Chance Brain")!,
    PRIZE_ITEMS.find(item => item.name === "Borrowed Brain")!,
    PRIZE_ITEMS.find(item => item.name === "Steal A Point")!,
    PRIZE_ITEMS.find(item => item.name === "Freeze Frame")!,
    PRIZE_ITEMS.find(item => item.name === "Mirror Effect")!,
];

export type PrizeSelectionMode = 'random' | 'custom1' | 'custom2' | 'custom3' | 'custom4';

// Function to get prizes based on selection mode
export const getPrizeItemsByMode = (
    mode: PrizeSelectionMode = 'random',
    count: number = 12
): PrizeItem[] => {
    switch (mode) {
        case 'custom1':
            return CUSTOM_PRIZE_LIST_1.slice(0, count);
        case 'custom2':
            return CUSTOM_PRIZE_LIST_2.slice(0, count);
        case 'custom3':
            return CUSTOM_PRIZE_LIST_3.slice(0, count);
        case 'random':
        default:
            return getRandomPrizeItems(count);
    }
};

// Original random function
export const getRandomPrizeItems = (count: number = 12): PrizeItem[] => {
    const allItems = [...PRIZE_ITEMS];

    for (let i = allItems.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allItems[i], allItems[j]] = [allItems[j], allItems[i]];
    }

    return allItems.slice(0, count);
};

// Function to assign prizes to cells with custom mode
export const assignPrizesToCells = (
    cells: CellState[],
    prizeItems: PrizeItem[]
): CellState[] => {
    const items = prizeItems.slice(0, cells.length);

    return cells.map((cell, index) => ({
        ...cell,
        prizeItem: items[index]
    }));
};

// Cell colors
export const CELL_SOLID_COLORS = [
    '#F44336', '#2196F3', '#4CAF50', '#FF9800',
    '#9C27B0', '#3F51B5', '#009688', '#FF5722',
    '#673AB7', '#00BCD4', '#8BC34A', '#FFC107',
];

export const CELL_GRADIENT_COLORS = [
    ['#0A82E8', '#02469f'],
    ['#9556CE', '#5f027c'],
    ['#5f6372', '#1c202a'],
    ['#F9A825', '#ffdd00'],
    ['#0e9b15', '#00ff13'],
    ['#FBC02D', '#F57F17'],
    ['#0754a1', '#0050ff'],
    ['#7B1FA2', '#bf00ff'],
    ['#1976D2', '#00c4ff'],
    ['#ff00d5', '#570017'],
    ['#555761', 'rgba(0,0,0,0.15)'],
    ['#fd0000', '#651503'],
];