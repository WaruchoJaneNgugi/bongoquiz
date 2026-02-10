export type GameStatus = 'idle' | 'playing' | 'revealing' | 'completed';
export type CellState = {
    id: number;
    value: number; // 1-12
    isRevealed: boolean;
    color: string;
    x: number;
    y: number;
};

// Prize emojis
export const PRIZE_IMAGES = [
    '🏆', '🎮', '🎯', '🎁', '💰', '💎',
    '🌟', '⚡', '🔥', '💫', '🌈', '✨'
];

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