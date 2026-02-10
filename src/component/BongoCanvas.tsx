// BongoCanvas.tsx - With Gradient Colors
// BongoCanvas.tsx - With cells that fill the available height
import React, {useState, useCallback, useEffect, useRef, type Dispatch, type SetStateAction} from 'react';
import '../assets/style.css';
import {type CellState, type GameStatus, PRIZE_IMAGES, CELL_GRADIENT_COLORS} from "../types/bongotypes.ts";

// Canvas Component
export const BongoCanvas: React.FC<{
    cells: CellState[];
    gameStatus: GameStatus;
    onCellClick: (id: number) => void;
    selectedCell: number | null;
    OnSetSelectedCell:Dispatch<SetStateAction<number|null>>
}> = ({ cells, onCellClick,OnSetSelectedCell }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>(0);
    const hoveredCellRef = useRef<number | null>(null);
    // const timeRef = useRef<number>(0);
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 700 });

    // Update canvas size based on container
    useEffect(() => {
        const updateCanvasSize = () => {
            if (containerRef.current && canvasRef.current) {
                const container = containerRef.current;
                const containerWidth = container.clientWidth;
                const containerHeight = container.clientHeight;

                // Grid configuration
                const gridCols = 4;
                const gridRows = 3;

                // Use minimal padding to maximize cell size
                const horizontalPadding = 20; // Reduced from 40
                const verticalPadding = 20; // Reduced from 40
                const cellPadding = 15;
                const titleHeight = 0; // Set to 0 since we're not showing title

                // Calculate maximum available space
                const maxAvailableWidth = containerWidth - (horizontalPadding * 2) - (cellPadding * (gridCols - 1));
                const maxAvailableHeight = containerHeight - (verticalPadding * 2) - (cellPadding * (gridRows - 1)) - titleHeight;

                // Calculate cell size based on available space
                const cellWidthFromWidth = maxAvailableWidth / gridCols;
                const cellHeightFromHeight = maxAvailableHeight / gridRows;

                // Use the smaller dimension to ensure cells fit both width and height
                const cellSize = Math.min(cellWidthFromWidth, cellHeightFromHeight);

                // If height is limiting factor, adjust width to maintain aspect ratio
                let finalCellWidth = cellSize;
                let finalCellHeight = cellSize;

                // Check which dimension is limiting
                if (cellHeightFromHeight < cellWidthFromWidth) {
                    // Height is limiting - we need to adjust cell size to fill height
                    finalCellHeight = cellHeightFromHeight;
                    finalCellWidth = Math.min(finalCellHeight, cellWidthFromWidth);
                } else {
                    // Width is limiting or equal
                    finalCellWidth = cellSize;
                    finalCellHeight = finalCellWidth;
                }

                // Calculate total canvas dimensions
                const totalWidth = (finalCellWidth * gridCols) + (cellPadding * (gridCols - 1)) + (horizontalPadding * 2);
                const totalHeight = (finalCellHeight * gridRows) + (cellPadding * (gridRows - 1)) + (verticalPadding * 2) + titleHeight;

                setCanvasSize({
                    width: Math.min(totalWidth, containerWidth),
                    height: Math.min(totalHeight, containerHeight)
                });

                // Set canvas resolution
                const canvas = canvasRef.current;
                const dpr = window.devicePixelRatio || 1;
                canvas.width = totalWidth * dpr;
                canvas.height = totalHeight * dpr;

                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.scale(dpr, dpr);
                }
            }
        };

        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);

        return () => {
            window.removeEventListener('resize', updateCanvasSize);
        };
    }, []);

    // Calculate cell dimensions
    const getCellDimensions = useCallback(() => {
        const gridCols = 4;
        const gridRows = 3;

        // Use the same padding values as in updateCanvasSize
        const horizontalPadding = 20;
        const verticalPadding = 20;
        const cellPadding = 15;
        const titleHeight = 0;

        // Calculate cell size based on canvas dimensions
        const availableWidth = canvasSize.width - (horizontalPadding * 2) - (cellPadding * (gridCols - 1));
        const availableHeight = canvasSize.height - (verticalPadding * 2) - (cellPadding * (gridRows - 1)) - titleHeight;

        const cellWidth = availableWidth / gridCols;
        const cellHeight = availableHeight / gridRows;

        // Use square cells - take the smaller dimension to ensure they fit
        const cellSize = Math.min(cellWidth, cellHeight);

        return {
            cellWidth: cellSize,
            cellHeight: cellSize,
            horizontalPadding,
            verticalPadding,
            cellPadding,
            titleHeight
        };
    }, [canvasSize]);

    const drawRoundedRectPath = (
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        w: number,
        h: number,
        r: number
    ) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    };

    // Draw gradient cell
    const drawCell = useCallback((
        ctx: CanvasRenderingContext2D,
        cell: CellState,
        cellWidth: number,
        cellHeight: number,
        horizontalPadding: number,
        verticalPadding: number,
        cellPadding: number,
        titleHeight: number,
        time: number
    ) => {
        // Calculate cell position
        const x = horizontalPadding + (cell.x * (cellWidth + cellPadding));
        const y = verticalPadding + titleHeight + (cell.y * (cellHeight + cellPadding));

        const isHovered = hoveredCellRef.current === cell.id;
        const isRevealed = cell.isRevealed;

        // Get gradient colors for this cell
        const gradientColors = CELL_GRADIENT_COLORS[cell.id % CELL_GRADIENT_COLORS.length] || ['#FFFFFF', '#F0F0F0'];
        const [topColor, bottomColor] = gradientColors;

        const radius = Math.min(cellWidth, cellHeight) * 0.1; // Dynamic radius based on cell size

        // === OUTER SHADOW ===
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.55)';
        ctx.shadowBlur = 22;
        ctx.shadowOffsetY = 12;

        drawRoundedRectPath(ctx, x, y, cellWidth, cellHeight, radius);
        ctx.fillStyle = bottomColor;
        ctx.fill();
        ctx.restore();

        // === MAIN GRADIENT BODY ===
        const bodyGradient = ctx.createLinearGradient(x, y, x, y + cellHeight);
        bodyGradient.addColorStop(0, topColor);
        bodyGradient.addColorStop(0.55, topColor);
        bodyGradient.addColorStop(1, bottomColor);

        ctx.save();
        drawRoundedRectPath(ctx, x, y, cellWidth, cellHeight, radius);
        ctx.fillStyle = bodyGradient;
        ctx.fill();
        ctx.restore();

        // === INNER BEVEL BORDER ===
        ctx.save();
        drawRoundedRectPath(
            ctx,
            x + 2,
            y + 2,
            cellWidth - 4,
            cellHeight - 4,
            radius - 2
        );
        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // === TOP GLOSS HIGHLIGHT ===
        ctx.save();
        drawRoundedRectPath(ctx, x, y, cellWidth, cellHeight, radius);
        ctx.clip();

        const gloss = ctx.createLinearGradient(x, y, x, y + cellHeight * 0.45);
        gloss.addColorStop(0, 'rgba(255,255,255,0.45)');
        gloss.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.fillStyle = gloss;
        ctx.fillRect(x, y, cellWidth, cellHeight * 0.45);
        ctx.restore();

        if (isHovered && !isRevealed) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255,255,255,0.9)';
            ctx.lineWidth = 4;
            ctx.shadowColor = 'rgba(255,255,255,0.8)';
            ctx.shadowBlur = 20;
            ctx.stroke();
            ctx.restore();
        }

        // Draw cell number
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;

        ctx.fillStyle = '#FFFFFF';
        // Dynamic font size based on cell height
        const fontSize = Math.max(16, cellHeight * 0.32);
        ctx.font = `800 ${fontSize}px "Montserrat", Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cell.value.toString(), x + cellWidth / 2, y + cellHeight / 2);

        // Subtle top highlight
        ctx.shadowColor = 'rgba(255,255,255,0.35)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetY = -2;
        ctx.fillText(cell.value.toString(), x + cellWidth / 2, y + cellHeight / 2);

        ctx.restore();

        // If revealed, show prize with overlay
        if (isRevealed) {
            // Semi-transparent dark overlay
            ctx.save();
            drawRoundedRectPath(ctx, x, y, cellWidth, cellHeight, radius);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.fill();
            ctx.restore();

            // Draw prize emoji with animation
            const prizeIndex = cell.value - 1;
            if (prizeIndex >= 0 && prizeIndex < PRIZE_IMAGES.length) {
                const emoji = PRIZE_IMAGES[prizeIndex];

                // Pulsing effect
                const pulseScale = 1 + Math.sin(time * 0.01) * 0.05;
                ctx.save();
                ctx.translate(x + cellWidth/2, y + cellHeight/2);
                ctx.scale(pulseScale, pulseScale);

                // Draw emoji
                ctx.fillStyle = '#FFFFFF';
                ctx.font = `bold ${cellHeight * 0.4}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(emoji, 0, 0);

                ctx.restore();

                // Draw "WIN!" text
                // ctx.fillStyle = '#FFD700';
                // ctx.font = `bold ${cellHeight * 0.15}px Arial, sans-serif`;
                // ctx.fillText('WIN!', x + cellWidth/2, y + cellHeight - 20);
            }

            // Shimmering border effect for revealed cells
            ctx.save();
            const shimmerSpeed = 0.008;
            const shimmerThickness = 3;
            const shimmerOpacity = 0.7 + Math.sin(time * shimmerSpeed) * 0.3;

            const shimmerGradient = ctx.createLinearGradient(x, y, x + cellWidth, y + cellHeight);
            shimmerGradient.addColorStop(0, `rgba(255, 215, 0, ${shimmerOpacity})`);
            shimmerGradient.addColorStop(0.25, `rgba(255, 255, 255, ${shimmerOpacity})`);
            shimmerGradient.addColorStop(0.5, `rgba(255, 215, 0, ${shimmerOpacity})`);
            shimmerGradient.addColorStop(0.75, `rgba(255, 255, 255, ${shimmerOpacity})`);
            shimmerGradient.addColorStop(1, `rgba(255, 215, 0, ${shimmerOpacity})`);

            ctx.strokeStyle = shimmerGradient;
            ctx.lineWidth = shimmerThickness;
            ctx.lineJoin = 'round';
            ctx.shadowColor = `rgba(255, 215, 0, ${shimmerOpacity * 0.8})`;
            ctx.shadowBlur = 20;

            drawRoundedRectPath(ctx, x, y, cellWidth, cellHeight, radius);
            ctx.stroke();

            ctx.shadowBlur = 30;
            ctx.shadowColor = `rgba(255, 215, 0, ${shimmerOpacity * 0.4})`;
            drawRoundedRectPath(ctx, x + shimmerThickness/2, y + shimmerThickness/2,
                cellWidth - shimmerThickness, cellHeight - shimmerThickness,
                Math.max(radius - shimmerThickness/2, 2));
            ctx.stroke();

            ctx.restore();
        }
    }, []);

    // Animation loop
    useEffect(() => {
        const animate = (time: number) => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Clear canvas with background
            ctx.fillStyle = '#191425';
            ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

            // Get current cell dimensions
            const {
                cellWidth,
                cellHeight,
                horizontalPadding,
                verticalPadding,
                cellPadding,
                titleHeight
            } = getCellDimensions();

            // Draw all cells
            cells.sort((a, b) => a.id - b.id).forEach(cell => {
                drawCell(ctx, cell, cellWidth, cellHeight, horizontalPadding,
                    verticalPadding, cellPadding, titleHeight, time);
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationRef.current);
        };
    }, [cells, drawCell, canvasSize, getCellDimensions]);

    // Handle mouse events
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const {
            cellWidth,
            cellHeight,
            horizontalPadding,
            verticalPadding,
            cellPadding,
            titleHeight
        } = getCellDimensions();

        let foundHover = false;
        cells.forEach(cell => {
            const cellX = horizontalPadding + (cell.x * (cellWidth + cellPadding));
            const cellY = verticalPadding + titleHeight + (cell.y * (cellHeight + cellPadding));

            if (x >= cellX && x <= cellX + cellWidth &&
                y >= cellY && y <= cellY + cellHeight) {
                if (!cell.isRevealed && canvas.style.cursor !== 'pointer') {
                    canvas.style.cursor = 'pointer';
                }
                hoveredCellRef.current = cell.id;
                foundHover = true;
            }
        });

        if (!foundHover) {
            canvas.style.cursor = 'default';
            hoveredCellRef.current = null;
        }
    }, [cells, getCellDimensions]);

    const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const {
            cellWidth,
            cellHeight,
            horizontalPadding,
            verticalPadding,
            cellPadding,
            titleHeight
        } = getCellDimensions();

        // Find the clicked cell
        for (const cell of cells) {
            const cellX = horizontalPadding + (cell.x * (cellWidth + cellPadding));
            const cellY = verticalPadding + titleHeight + (cell.y * (cellHeight + cellPadding));

            if (x >= cellX && x <= cellX + cellWidth &&
                y >= cellY && y <= cellY + cellHeight) {
                // Only proceed if cell is not already revealed
                if (!cell.isRevealed) {
                    onCellClick(cell.id);
                    OnSetSelectedCell(cell.id)
                }
                return; // Exit after finding the clicked cell
            }
        }
    }, [getCellDimensions, cells, onCellClick, OnSetSelectedCell]);
    return (
        <div ref={containerRef} className="bingo-canvas-container" style={{ width: '100%', height: '100%' }}>
            <h1 className="title">Pick A Box</h1>

            <canvas
                ref={canvasRef}
                width={600}
                height={800}
                className="bingo-canvas"
                onMouseMove={handleMouseMove}
                onClick={handleClick}
            />
        </div>
    );
};
