// BongoCanvas.tsx - With Gradient Colors, Number Circle Background, and Modal Overlay
import React, {useState, useCallback, useEffect, useRef, type Dispatch, type SetStateAction} from 'react';
import '../assets/style.css';
import '../assets/modalOverlaybtn.css'
import {type CellState, type GameStatus, PRIZE_IMAGES, CELL_GRADIENT_COLORS} from "../types/bongotypes.ts";

// Modal Component for showing prize details
const PrizeModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    cell: CellState | null;
    cellColors: { topColor: string; bottomColor: string; circleColor: string; };
}> = ({ isOpen, onClose, cell, cellColors }) => {
    if (!isOpen || !cell) return null;

    const prizeIndex = cell.value - 1;
    const prizeEmoji = prizeIndex >= 0 && prizeIndex < PRIZE_IMAGES.length
        ? PRIZE_IMAGES[prizeIndex]
        : '🎁';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    ✕
                </button>

                <div className="modal-header">
                    <div
                        className="modal-cell-preview"
                        style={{
                            background: `linear-gradient(to bottom, ${cellColors.topColor}, ${cellColors.bottomColor})`,
                        }}
                    >
                        <div
                            className="modal-circle"
                            style={{ backgroundColor: cellColors.circleColor }}
                        >
                            <span className="modal-cell-number">{cell.value}</span>
                        </div>
                    </div>
                    <h2 className="modal-title">Congratulations!</h2>
                    <p className="modal-subtitle">You revealed:</p>
                </div>

                <div className="modal-body">
                    <div className="prize-display">
                        <div className="prize-emoji">{prizeEmoji}</div>
                        <h3 className="prize-title">Prize #{cell.value}</h3>
                        <p className="prize-description">
                            This is an amazing prize! You've won something special.
                        </p>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="modal-action-btn" onClick={onClose}>
                        Continue Playing
                    </button>
                </div>
            </div>
        </div>
    );
};

// Canvas Component
export const BongoCanvas: React.FC<{
    cells: CellState[];
    gameStatus: GameStatus;
    onCellClick: (id: number) => void;
    selectedCell: number | null;
    OnSetSelectedCell: Dispatch<SetStateAction<number|null>>
}> = ({ cells, onCellClick, OnSetSelectedCell }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>(0);
    const hoveredCellRef = useRef<number | null>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 700 });
    const [selectedCellDetails, setSelectedCellDetails] = useState<CellState | null>(null);
    const [modalColors, setModalColors] = useState<{ topColor: string; bottomColor: string; circleColor: string; }>({
        topColor: '#FFFFFF',
        bottomColor: '#F0F0F0',
        circleColor: '#FFFFFF'
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Function to lighten a hex color
    const lightenColor = (color: string, percent: number): string => {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = ((num >> 8) & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;

        return `#${(
            0x1000000 +
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)
        )
            .toString(16)
            .slice(1)
            .toUpperCase()}`;
    };

    // Function to get circle color from gradient colors
    const getCircleColor = (topColor: string, bottomColor: string): string => {
        const hexToRgb = (hex: string): [number, number, number] => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return [r, g, b];
        };

        const rgbToHex = (r: number, g: number, b: number): string => {
            return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        };

        const [r1, g1, b1] = hexToRgb(topColor);
        const [r2, g2, b2] = hexToRgb(bottomColor);

        const avgR = Math.round((r1 + r2) / 2);
        const avgG = Math.round((g1 + g2) / 2);
        const avgB = Math.round((b1 + b2) / 2);

        const avgColor = rgbToHex(avgR, avgG, avgB);
        return lightenColor(avgColor, 25);
    };

    // Handle cell click to open modal
    const handleCellClick = useCallback((cellId: number) => {
        const cell = cells.find(c => c.id === cellId);
        if (cell && !cell.isRevealed) {
            // Get cell colors
            const gradientColors = CELL_GRADIENT_COLORS[cell.id % CELL_GRADIENT_COLORS.length] || ['#FFFFFF', '#F0F0F0'];
            const [topColor, bottomColor] = gradientColors;
            const circleColor = getCircleColor(topColor, bottomColor);

            setModalColors({ topColor, bottomColor, circleColor });
            setSelectedCellDetails(cell);

            // Call the original click handler
            onCellClick(cellId);
            OnSetSelectedCell(cellId);

            // Open modal after a short delay for animation
            setTimeout(() => {
                setIsModalOpen(true);
            }, 300);
        }
    }, [cells, onCellClick, OnSetSelectedCell]);

    // Close modal
    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setTimeout(() => {
            setSelectedCellDetails(null);
        }, 300);
    }, []);

    // Update canvas size based on container
    useEffect(() => {
        const updateCanvasSize = () => {
            if (containerRef.current && canvasRef.current) {
                const container = containerRef.current;
                const containerWidth = container.clientWidth;
                const containerHeight = container.clientHeight;

                const gridCols = 4;
                const gridRows = 3;

                const horizontalPadding = 20;
                const verticalPadding = 20;
                const cellPadding = 15;
                const titleHeight = 0;

                const maxAvailableWidth = containerWidth - (horizontalPadding * 2) - (cellPadding * (gridCols - 1));
                const maxAvailableHeight = containerHeight - (verticalPadding * 2) - (cellPadding * (gridRows - 1)) - titleHeight;

                const cellWidthFromWidth = maxAvailableWidth / gridCols;
                const cellHeightFromHeight = maxAvailableHeight / gridRows;

                const cellSize = Math.min(cellWidthFromWidth, cellHeightFromHeight);

                let finalCellWidth = cellSize;
                let finalCellHeight = cellSize;

                if (cellHeightFromHeight < cellWidthFromWidth) {
                    finalCellHeight = cellHeightFromHeight;
                    finalCellWidth = Math.min(finalCellHeight, cellWidthFromWidth);
                } else {
                    finalCellWidth = cellSize;
                    finalCellHeight = finalCellWidth;
                }

                const totalWidth = (finalCellWidth * gridCols) + (cellPadding * (gridCols - 1)) + (horizontalPadding * 2);
                const totalHeight = (finalCellHeight * gridRows) + (cellPadding * (gridRows - 1)) + (verticalPadding * 2) + titleHeight;

                setCanvasSize({
                    width: Math.min(totalWidth, containerWidth),
                    height: Math.min(totalHeight, containerHeight)
                });

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

        const horizontalPadding = 20;
        const verticalPadding = 20;
        const cellPadding = 15;
        const titleHeight = 0;

        const availableWidth = canvasSize.width - (horizontalPadding * 2) - (cellPadding * (gridCols - 1));
        const availableHeight = canvasSize.height - (verticalPadding * 2) - (cellPadding * (gridRows - 1)) - titleHeight;

        const cellWidth = availableWidth / gridCols;
        const cellHeight = availableHeight / gridRows;

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
        const x = horizontalPadding + (cell.x * (cellWidth + cellPadding));
        const y = verticalPadding + titleHeight + (cell.y * (cellHeight + cellPadding));

        const isHovered = hoveredCellRef.current === cell.id;
        const isRevealed = cell.isRevealed;

        const gradientColors = CELL_GRADIENT_COLORS[cell.id % CELL_GRADIENT_COLORS.length] || ['#FFFFFF', '#F0F0F0'];
        const [topColor, bottomColor] = gradientColors;

        const circleColor = getCircleColor(topColor, bottomColor);

        const radius = 15;

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
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        ctx.save();
        drawRoundedRectPath(ctx, x, y, cellWidth, cellHeight, radius);
        ctx.clip();

        const gloss = ctx.createLinearGradient(x, y, x, y + cellHeight * 0.45);
        gloss.addColorStop(0, 'rgba(66,61,61,0.45)');
        gloss.addColorStop(1, 'rgba(42,33,33,0)');

        ctx.fillStyle = gloss;
        ctx.fillRect(x, y, cellWidth, cellHeight * 0.45);
        ctx.restore();

        if (isHovered && !isRevealed) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255,255,255,0.9)';
            ctx.lineWidth = 2;
            ctx.shadowColor = 'rgba(255,255,255,0.8)';
            ctx.shadowBlur = 20;
            ctx.stroke();
            ctx.restore();
        }

        // Draw circle behind number (only if not revealed)
        if (!isRevealed) {
            ctx.save();

            const circleX = x + cellWidth / 2;
            const circleY = y + cellHeight / 2;
            const circleRadius = Math.min(cellWidth, cellHeight) * 0.25;

            ctx.shadowColor = 'rgba(0,0,0,0.4)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 3;

            ctx.beginPath();
            ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
            ctx.fillStyle = circleColor;
            ctx.fill();

            ctx.shadowColor = 'rgba(255,255,255,0.3)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 0;

            ctx.beginPath();
            ctx.arc(circleX, circleY, circleRadius - 1, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        }

        // Draw cell number
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.7)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 5;

        ctx.fillStyle = '#FFFFFF';
        const fontSize = Math.max(16, cellHeight * 0.32);
        ctx.font = `800 ${fontSize}px "Montserrat", Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cell.value.toString(), x + cellWidth / 2, y + cellHeight / 2);

        ctx.shadowColor = 'rgba(255,255,255,0.35)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetY = -2;
        ctx.fillText(cell.value.toString(), x + cellWidth / 2, y + cellHeight / 2);

        ctx.restore();

        // If revealed, show prize with overlay
        if (isRevealed) {
            ctx.save();
            drawRoundedRectPath(ctx, x, y, cellWidth, cellHeight, radius);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.fill();
            ctx.restore();

            const prizeIndex = cell.value - 1;
            if (prizeIndex >= 0 && prizeIndex < PRIZE_IMAGES.length) {
                const emoji = PRIZE_IMAGES[prizeIndex];

                const pulseScale = 1 + Math.sin(time * 0.01) * 0.05;
                ctx.save();
                ctx.translate(x + cellWidth/2, y + cellHeight/2);
                ctx.scale(pulseScale, pulseScale);

                ctx.fillStyle = '#FFFFFF';
                ctx.font = `bold ${cellHeight * 0.4}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(emoji, 0, 0);

                ctx.restore();
            }

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

            ctx.fillStyle = '#191425';
            ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

            const {
                cellWidth,
                cellHeight,
                horizontalPadding,
                verticalPadding,
                cellPadding,
                titleHeight
            } = getCellDimensions();

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

    const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
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

        for (const cell of cells) {
            const cellX = horizontalPadding + (cell.x * (cellWidth + cellPadding));
            const cellY = verticalPadding + titleHeight + (cell.y * (cellHeight + cellPadding));

            if (x >= cellX && x <= cellX + cellWidth &&
                y >= cellY && y <= cellY + cellHeight) {
                if (!cell.isRevealed) {
                    handleCellClick(cell.id);
                }
                return;
            }
        }
    }, [getCellDimensions, cells, handleCellClick]);

    return (
        <div ref={containerRef} className="bingo-canvas-container" style={{ width: '100%', height: '100%' }}>
            <h1 className="title">Pick A Box</h1>

            <canvas
                ref={canvasRef}
                width={600}
                height={800}
                className="bingo-canvas"
                onMouseMove={handleMouseMove}
                onClick={handleCanvasClick}
            />

            <PrizeModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                cell={selectedCellDetails}
                cellColors={modalColors}
            />
        </div>
    );
};