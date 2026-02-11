// BongoCanvas.tsx - With improved click accuracy for larger canvas
// Updated with full touch support for mobile devices and keyboard shortcuts
import React, {useState, useCallback, useEffect, useRef, type Dispatch, type SetStateAction} from 'react';
import '../assets/style.css';
import '../assets/modalOverlaybtn.css'
import {
    type CellState,
    CELL_GRADIENT_COLORS,
    type PrizeSelectionMode,
    getPrizeItemsByMode,
    assignPrizesToCells
} from "../types/bongotypes.ts";

// Modal Component for showing prize details
const PrizeModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    cell: CellState | null;
    cellColors: { topColor: string; bottomColor: string; circleColor: string; };
}> = ({isOpen, onClose, cell, cellColors}) => {
    if (!isOpen || !cell || !cell.prizeItem) return null;

    const prizeItem = cell.prizeItem;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    ✕
                </button>

                <div className="modal-body" style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <img
                        src={prizeItem.img}
                        alt={prizeItem.name}
                        className="prize-image"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                        }}
                    />

                    <div className="modal-header" style={{
                        position: 'absolute',
                        bottom: '10px',
                        left: '70%',
                        transform: 'translateX(100%)',
                        width: 'auto',
                        padding: '10px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 10
                    }}>
                        <div
                            className="modal-cell-preview"
                            style={{
                                background: `linear-gradient(to bottom, ${cellColors.topColor}, ${cellColors.bottomColor})`,
                                padding: '15px',
                                borderRadius: '15px',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <div
                                className="modal-circle"
                                style={{
                                    backgroundColor: cellColors.circleColor,
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                <div className="modal-cell-number" style={{
                                    fontSize: '24px',
                                    fontWeight: 'bold',
                                    color: '#FFFFFF',
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                                }}>
                                    {cell.value}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Canvas Component
export const BongoCanvas: React.FC<{
    cells: CellState[];
    onCellClick: (id: number) => void;
    onRefreshGrid?:()=>void;
    onCellChange:Dispatch<SetStateAction<CellState[]>>
}> = ({cells, onCellClick,onRefreshGrid,onCellChange}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number>(0);
    const [prizeMode, setPrizeMode] = useState<PrizeSelectionMode>('random');

    const hoveredCellRef = useRef<number | null>(null);
    const [canvasSize, setCanvasSize] = useState({width: 1200, height: 1200});
    const [selectedCellDetails, setSelectedCellDetails] = useState<CellState | null>(null);
    const [revealedTimes, setRevealedTimes] = useState<Record<number, number>>({});
    const [modalColors, setModalColors] = useState<{ topColor: string; bottomColor: string; circleColor: string; }>({
        topColor: '#FFFFFF',
        bottomColor: '#F0F0F0',
        circleColor: '#FFFFFF'
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const toastTimeoutRef = useRef<ReturnType<typeof setTimeout>>(2);

    // Store loaded prize images
    const [loadedImages, setLoadedImages] = useState<Record<number, HTMLImageElement>>({});

    const GRID_COLS = 4;
    const GRID_ROWS = 3;
    const HORIZONTAL_PADDING = 30;
    const VERTICAL_PADDING = 30;
    const CELL_PADDING = 10;

    // Load prize images
    useEffect(() => {
        const loadImages = async () => {
            const imagePromises = cells.map(cell => {
                return new Promise<void>((resolve) => {
                    if (!cell.prizeItem) {
                        resolve();
                        return;
                    }

                    const img = new Image();
                    img.src = cell.prizeItem.img;
                    img.onload = () => {
                        setLoadedImages(prev => ({
                            ...prev,
                            [cell.id]: img
                        }));
                        resolve();
                    };
                    img.onerror = () => {
                        console.error(`Failed to load image: ${cell.prizeItem?.img}`);
                        resolve();
                    };
                });
            });

            await Promise.all(imagePromises);
        };

        if (cells.length > 0) {
            loadImages();
        }
    }, [cells]);

    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const initializeGrid = useCallback((mode: PrizeSelectionMode = prizeMode) => {
        // Create your initial cells (12 boxes with positions)
        const initialCells: CellState[] = Array.from({ length: 12 }, (_, i) => ({
            id: i,
            x: i % 4,
            y: Math.floor(i / 4),
            value: i + 1,
            isRevealed: false
        }));

        // Get prizes based on selected mode
        const prizeItems = getPrizeItemsByMode(mode, 12);

        // Assign prizes to cells
        const cellsWithPrizes = assignPrizesToCells(initialCells, prizeItems);

        onCellChange(cellsWithPrizes);
    }, [prizeMode]);

    // Function to show toast message
    const showToast = useCallback((text: string, type: 'success' | 'error') => {
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }

        setToastMessage({text, type});

        toastTimeoutRef.current = setTimeout(() => {
            setToastMessage(null);
        }, 2000);
    }, []);
    const handleRefreshGrid = useCallback(() => {
        initializeGrid(prizeMode);
        showToast(`Grid reshuffled with ${prizeMode} mode!`, 'success');
    }, [initializeGrid, prizeMode, showToast]);

// Change prize mode
    const handleChangePrizeMode = useCallback((mode: PrizeSelectionMode) => {
        setPrizeMode(mode);
        initializeGrid(mode);
        showToast(`Switched to ${mode} mode!`, 'success');
    }, [initializeGrid]);

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
    const handleCellClick = useCallback((cellId: number, isKeyboardShortcut: boolean = false) => {
        const cell = cells.find(c => c.id === cellId);
        if (cell && !cell.isRevealed) {
            // Record the time when this cell was revealed
            setRevealedTimes(prev => ({
                ...prev,
                [cellId]: Date.now()
            }));

            // Get cell colors
            const gradientColors = CELL_GRADIENT_COLORS[cell.id % CELL_GRADIENT_COLORS.length] || ['#FFFFFF', '#F0F0F0'];
            const [topColor, bottomColor] = gradientColors;
            const circleColor = getCircleColor(topColor, bottomColor);

            setModalColors({topColor, bottomColor, circleColor});
            setSelectedCellDetails(cell);

            // Call the original click handler
            onCellClick(cellId);

            // Open modal after a short delay for animation
            setTimeout(() => {
                setIsModalOpen(true);
            }, 300);

            // Show success toast for keyboard shortcut
            if (isKeyboardShortcut) {
                showToast(`Box ${cell.value} opened with shortcut`, 'success');
            }
        } else if (cell?.isRevealed) {
            showToast(`Box ${cell.value} is already opened!`, 'error');
        }
    }, [cells, getCircleColor, onCellClick, showToast]);

    // Close modal
    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setTimeout(() => {
            setSelectedCellDetails(null);
        }, 300);
    }, []);

    // Update canvas size based on container - MODIFIED FOR FULL SCREEN
    // Update canvas size based on container - IMPROVED DPI HANDLING
    useEffect(() => {
        const updateCanvasSize = () => {
            if (containerRef.current && canvasRef.current) {
                const container = containerRef.current;
                const canvas = canvasRef.current;

                const containerWidth = container.clientWidth;
                const containerHeight = container.clientHeight;

                // Get device pixel ratio, but cap it to avoid performance issues
                const dpr = Math.min(window.devicePixelRatio || 1, 2);

                // Set canvas buffer size (with DPI consideration)
                canvas.width = containerWidth * dpr;
                canvas.height = containerHeight * dpr;

                // Set canvas CSS size
                canvas.style.width = `${containerWidth}px`;
                canvas.style.height = `${containerHeight}px`;

                // Update canvasSize state for drawing calculations
                setCanvasSize({
                    width: containerWidth,
                    height: containerHeight
                });

                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.scale(dpr, dpr);
                    // Enable anti-aliasing for smoother rendering
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                }
            }
        };

        updateCanvasSize();

        // Use ResizeObserver for more accurate size detection
        const resizeObserver = new ResizeObserver(() => {
            updateCanvasSize();
        });

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        window.addEventListener('resize', updateCanvasSize);

        return () => {
            window.removeEventListener('resize', updateCanvasSize);
            resizeObserver.disconnect();
        };
    }, []);

    // Calculate cell dimensions - REMOVED TITLE_HEIGHT
    const getCellDimensions = useCallback(() => {
        const availableWidth = canvasSize.width - (HORIZONTAL_PADDING * 2) - (CELL_PADDING * (GRID_COLS - 1));
        const availableHeight = canvasSize.height - (VERTICAL_PADDING * 2) - (CELL_PADDING * (GRID_ROWS - 1));

        const cellWidthFromWidth = availableWidth / GRID_COLS;
        const cellHeightFromHeight = availableHeight / GRID_ROWS;

        const cellSize = Math.min(cellWidthFromWidth, cellHeightFromHeight);

        // Calculate actual grid dimensions
        const actualCellWidth = cellSize;
        const actualCellHeight = cellSize;

        const totalGridWidth = (actualCellWidth * GRID_COLS) + (CELL_PADDING * (GRID_COLS - 1));
        const totalGridHeight = (actualCellHeight * GRID_ROWS) + (CELL_PADDING * (GRID_ROWS - 1));

        // Center the grid - REMOVED TITLE_HEIGHT
        const startX = HORIZONTAL_PADDING + (availableWidth - totalGridWidth) / 2;
        const startY = VERTICAL_PADDING + (availableHeight - totalGridHeight) / 2;

        return {
            cellWidth: actualCellWidth,
            cellHeight: actualCellHeight,
            startX,
            startY,
            cellPadding: CELL_PADDING,
            totalGridWidth,
            totalGridHeight
        };
    }, [canvasSize]);

    // Helper function to get cell at coordinates
    const getCellAtCoordinates = useCallback((x: number, y: number) => {
        const {
            cellWidth,
            cellHeight,
            startX,
            startY,
            cellPadding
        } = getCellDimensions();

        // Calculate adjusted coordinates relative to grid start
        const adjustedX = x - startX;
        const adjustedY = y - startY;

        // Check if coordinates are within grid bounds
        const totalGridWidth = (cellWidth * GRID_COLS) + (cellPadding * (GRID_COLS - 1));
        const totalGridHeight = (cellHeight * GRID_ROWS) + (cellPadding * (GRID_ROWS - 1));

        if (adjustedX < 0 || adjustedX >= totalGridWidth ||
            adjustedY < 0 || adjustedY >= totalGridHeight) {
            return null;
        }

        // Calculate which cell was clicked
        const col = Math.floor(adjustedX / (cellWidth + cellPadding));
        const row = Math.floor(adjustedY / (cellHeight + cellPadding));

        // Ensure col and row are within bounds
        if (col >= GRID_COLS || row >= GRID_ROWS) {
            return null;
        }

        // Find cell at position
        const cell = cells.find(c => c.x === col && c.y === row);
        return cell || null;
    }, [cells, getCellDimensions]);

    // Get cell by value (number displayed on box)
    const getCellByValue = useCallback((value: number) => {
        return cells.find(c => c.value === value);
    }, [cells]);

    // Get event coordinates helper function
    // const getEventCoordinates = useCallback((event: MouseEvent | Touch, canvas: HTMLCanvasElement) => {
    //     const rect = canvas.getBoundingClientRect();
    //
    //     // Get the actual CSS size
    //     const cssWidth = rect.width;
    //     const cssHeight = rect.height;
    //
    //     // Get the canvas buffer size
    //     const bufferWidth = canvas.width;
    //     const bufferHeight = canvas.height;
    //
    //     // Calculate scale factors
    //     const scaleX = bufferWidth / cssWidth;
    //     const scaleY = bufferHeight / cssHeight;
    //
    //     let clientX, clientY;
    //
    //     if ('touches' in event) {
    //         // Handle TouchEvent
    //         clientX = event.clientX;
    //         clientY = event.clientY;
    //     } else {
    //         // Handle MouseEvent
    //         clientX = event.clientX;
    //         clientY = event.clientY;
    //     }
    //
    //     // Calculate coordinates relative to canvas buffer
    //     const x = (clientX - rect.left) * scaleX;
    //     const y = (clientY - rect.top) * scaleY;
    //
    //     // Ensure coordinates are within canvas bounds
    //     return {
    //         x: Math.max(0, Math.min(x, bufferWidth)),
    //         y: Math.max(0, Math.min(y, bufferHeight))
    //     };
    // }, []);
    // Get event coordinates helper function - IMPROVED FOR ALL DEVICES
    const getEventCoordinates = useCallback((event: MouseEvent | Touch, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();

        // Get the canvas buffer size
        const bufferWidth = canvas.width;
        const bufferHeight = canvas.height;

        // Get the actual CSS size
        const cssWidth = rect.width;
        const cssHeight = rect.height;

        // Calculate scale factors more precisely
        const scaleX = bufferWidth / cssWidth;
        const scaleY = bufferHeight / cssHeight;

        let clientX, clientY;

        if ('touches' in event) {
            // Handle TouchEvent
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            // Handle MouseEvent
            clientX = event.clientX;
            clientY = event.clientY;
        }

        // Calculate coordinates relative to canvas with precise scaling
        let x = (clientX - rect.left) * scaleX;
        let y = (clientY - rect.top) * scaleY;

        // Add small epsilon to handle floating point errors
        x = Math.max(0, Math.min(x, bufferWidth - 0.1));
        y = Math.max(0, Math.min(y, bufferHeight - 0.1));

        return { x, y };
    }, []);

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
        startX: number,
        startY: number,
        cellPadding: number,
        time: number
    ) => {
        const x = startX + (cell.x * (cellWidth + cellPadding));
        const y = startY + (cell.y * (cellHeight + cellPadding));

        const isHovered = hoveredCellRef.current === cell.id;
        const isRevealed = cell.isRevealed;

        const gradientColors = CELL_GRADIENT_COLORS[cell.id % CELL_GRADIENT_COLORS.length] || ['#FFFFFF', '#F0F0F0'];
        const [topColor, bottomColor] = gradientColors;

        const circleColor = getCircleColor(topColor, bottomColor);

        const radius = Math.min(15, cellWidth * 0.05);

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

        // Draw cell number (only if not revealed)
        if (!isRevealed) {
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.7)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 5;

            ctx.fillStyle = '#FFFFFF';
            const fontSize = Math.max(24, cellHeight * 0.32);
            ctx.font = `800 ${fontSize}px "Montserrat", Arial, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(cell.value.toString(), x + cellWidth / 2, y + cellHeight / 2);

            ctx.shadowColor = 'rgba(255,255,255,0.35)';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetY = -2;
            ctx.fillText(cell.value.toString(), x + cellWidth / 2, y + cellHeight / 2);

            ctx.restore();
        }

        // If revealed, show prize with overlay
        if (isRevealed) {
            ctx.save();
            drawRoundedRectPath(ctx, x, y, cellWidth, cellHeight, radius);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.fill();
            ctx.restore();

            // Check if the cell is still within the 3-second animation window
            const revealTime = revealedTimes[cell.id];
            const isAnimating = revealTime && (Date.now() - revealTime) < 3000; // 3 seconds

            // If we have a loaded prize image, show it
            if (cell.prizeItem && loadedImages[cell.id]) {
                const img = loadedImages[cell.id];

                // Only apply pulse animation if within 3 seconds
                let pulseScale = 1;
                if (isAnimating) {
                    pulseScale = 1 + Math.sin(time * 0.01) * 0.05;
                }

                ctx.save();
                ctx.translate(x + cellWidth / 2, y + cellHeight / 2);
                ctx.scale(pulseScale, pulseScale);

                // Calculate image size (80% of cell size)
                const imgSize = Math.min(cellWidth, cellHeight) * 0.8;

                // Draw image
                ctx.drawImage(
                    img,
                    -imgSize / 2,
                    -imgSize / 2,
                    imgSize,
                    imgSize
                );

                ctx.restore();
            } else if (cell.prizeItem) {
                // Fallback: Show the prize name if image hasn't loaded yet
                let pulseScale = 1;
                if (isAnimating) {
                    pulseScale = 1 + Math.sin(time * 0.01) * 0.05;
                }

                ctx.save();
                ctx.translate(x + cellWidth / 2, y + cellHeight / 2);
                ctx.scale(pulseScale, pulseScale);

                ctx.fillStyle = '#FFFFFF';
                ctx.font = `bold ${cellHeight * 0.2}px Arial, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(cell.prizeItem.name, 0, 0);

                ctx.restore();
            }

            // Shimmering border effect - only for 3 seconds
            if (isAnimating) {
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
                drawRoundedRectPath(ctx, x + shimmerThickness / 2, y + shimmerThickness / 2,
                    cellWidth - shimmerThickness, cellHeight - shimmerThickness,
                    Math.max(radius - shimmerThickness / 2, 2));
                ctx.stroke();

                ctx.restore();
            } else {
                // Draw a subtle static border after animation stops
                ctx.save();
                ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
                ctx.lineWidth = 2;
                ctx.shadowColor = 'rgba(255, 215, 0, 0.2)';
                ctx.shadowBlur = 10;

                drawRoundedRectPath(ctx, x, y, cellWidth, cellHeight, radius);
                ctx.stroke();
                ctx.restore();
            }
        }
    }, [getCircleColor, loadedImages, revealedTimes]);
    useEffect(() => {
        const cleanupInterval = setInterval(() => {
            const now = Date.now();
            setRevealedTimes(prev => {
                const newTimes = {...prev};
                let hasChanges = false;

                Object.entries(newTimes).forEach(([id, time]) => {
                    if (now - time > 3000) {
                        delete newTimes[Number(id)];
                        hasChanges = true;
                    }
                });

                return hasChanges ? newTimes : prev;
            });
        }, 10000); // Clean up every 10 seconds

        return () => clearInterval(cleanupInterval);
    }, []);
    // Animation loop - REMOVED TITLE DRAWING
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
                startX,
                startY,
                cellPadding
            } = getCellDimensions();

            cells.sort((a, b) => a.id - b.id).forEach(cell => {
                drawCell(ctx, cell, cellWidth, cellHeight, startX, startY, cellPadding, time);
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationRef.current);
        };
    }, [cells, drawCell, canvasSize, getCellDimensions]);

    // Keyboard shortcut handler
    useEffect(() => {
        const handleKeyboardShortcut = (e: KeyboardEvent) => {
            if (e.ctrlKey && !e.altKey && !e.metaKey) {

                // In your keyboard shortcut handler, add:
                if (e.ctrlKey && e.shiftKey && (e.key === 'B' || e.key === 'b')) {
                    e.preventDefault();
                    // Cycle through modes
                    const modes: PrizeSelectionMode[] = ['random', 'custom1', 'custom2', 'custom3', 'custom4'];
                    const currentIndex = modes.indexOf(prizeMode);
                    const nextMode = modes[(currentIndex + 1) % modes.length];
                    handleRefreshGrid();
                    handleChangePrizeMode('custom1');
                    showToast(`Switched to ${nextMode} mode!`, 'success');
                    return;
                }

// Handle Ctrl+Z to refresh/reshuffle the grid
                if (e.key === 'z' || e.key === 'Z') {
                    e.preventDefault();
                    showToast('🔄 Reshuffling grid...', 'success');

                    // Call the refresh/reshuffle function
                    // You need to pass this as a prop from parent component
                    if (onRefreshGrid) {
                        onRefreshGrid();
                    }

                    return;
                }
                // Handle Ctrl+Q for box 11
                if (e.key === 'q' || e.key === 'Q') {
                    e.preventDefault();
                    const cell = getCellByValue(11);

                    if (cell) {
                        if (!cell.isRevealed) {
                            handleCellClick(cell.id, true);
                        } else {
                            showToast(`Box 11 is already opened!`, 'error');
                        }
                    } else {
                        showToast(`Box 11 not found!`, 'error');
                    }
                    return;
                }

                // Handle Ctrl+W for box 12
                if (e.key === 'v' || e.key === 'V') {
                    e.preventDefault();
                    const cell = getCellByValue(12);

                    if (cell) {
                        if (!cell.isRevealed) {
                            handleCellClick(cell.id, true);
                        } else {
                            showToast(`Box 12 is already opened!`, 'error');
                        }
                    } else {
                        showToast(`Box 12 not found!`, 'error');
                    }
                    return;
                }

                // Handle numbers 0-9 (boxes 1-10)
                if (/^[0-9]$/.test(e.key)) {
                    e.preventDefault();

                    let boxNumber: number;

                    if (e.key === '0') {
                        boxNumber = 10;
                    } else {
                        boxNumber = parseInt(e.key);
                    }

                    const cell = getCellByValue(boxNumber);

                    if (cell) {
                        if (!cell.isRevealed) {
                            handleCellClick(cell.id, true);
                        } else {
                            showToast(`Box ${boxNumber} is already opened!`, 'error');
                        }
                    } else {
                        showToast(`Box ${boxNumber} not found!`, 'error');
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyboardShortcut);
        return () => {
            window.removeEventListener('keydown', handleKeyboardShortcut);
        };
    }, [getCellByValue, handleCellClick, showToast]);

    // Mouse and touch event handlers
    const handleCanvasMouseMove = useCallback((event: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const {x, y} = getEventCoordinates(event, canvas);
        const cell = getCellAtCoordinates(x, y);

        if (cell && !cell.isRevealed) {
            if (canvas.style.cursor !== 'pointer') {
                canvas.style.cursor = 'pointer';
            }
            hoveredCellRef.current = cell.id;
        } else {
            canvas.style.cursor = 'default';
            hoveredCellRef.current = null;
        }
    }, [getEventCoordinates, getCellAtCoordinates]);

    const handleCanvasClick = useCallback((event: MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const {x, y} = getEventCoordinates(event, canvas);
        const cell = getCellAtCoordinates(x, y);

        if (cell && !cell.isRevealed) {
            handleCellClick(cell.id);
        }
    }, [getEventCoordinates, getCellAtCoordinates, handleCellClick]);

    const handleCanvasTouchStart = useCallback((event: TouchEvent) => {
        event.preventDefault();
        if (event.touches.length === 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const touch = event.touches[0];
        const {x, y} = getEventCoordinates(touch, canvas);
        const cell = getCellAtCoordinates(x, y);

        if (cell && !cell.isRevealed) {
            hoveredCellRef.current = cell.id;
        }
    }, [getEventCoordinates, getCellAtCoordinates]);

    const handleCanvasTouchEnd = useCallback((event: TouchEvent) => {
        event.preventDefault();
        if (event.changedTouches.length === 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const touch = event.changedTouches[0];
        const {x, y} = getEventCoordinates(touch, canvas);
        const cell = getCellAtCoordinates(x, y);

        if (cell && !cell.isRevealed) {
            handleCellClick(cell.id);
        }

        hoveredCellRef.current = null;
    }, [getEventCoordinates, getCellAtCoordinates, handleCellClick]);

    // Setup event listeners
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.style.touchAction = 'none';
        canvas.style.userSelect = 'none';

        canvas.addEventListener('mousemove', handleCanvasMouseMove);
        canvas.addEventListener('click', handleCanvasClick);
        canvas.addEventListener('touchstart', handleCanvasTouchStart);
        canvas.addEventListener('touchend', handleCanvasTouchEnd);

        const handleMouseOut = () => {
            hoveredCellRef.current = null;
            if (canvas) {
                canvas.style.cursor = 'default';
            }
        };

        canvas.addEventListener('mouseout', handleMouseOut);

        return () => {
            canvas.removeEventListener('mousemove', handleCanvasMouseMove);
            canvas.removeEventListener('click', handleCanvasClick);
            canvas.removeEventListener('touchstart', handleCanvasTouchStart);
            canvas.removeEventListener('touchend', handleCanvasTouchEnd);
            canvas.removeEventListener('mouseout', handleMouseOut);
        };
    }, [handleCanvasMouseMove, handleCanvasClick, handleCanvasTouchStart, handleCanvasTouchEnd]);

    // Handle keyboard accessibility
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLCanvasElement>) => {
        if (['Enter', ' ', 'Spacebar'].includes(e.key)) {
            e.preventDefault();
            if (hoveredCellRef.current !== null) {
                handleCellClick(hoveredCellRef.current);
            }
        }
    }, [handleCellClick]);

    // Cleanup toast timeout
    useEffect(() => {
        return () => {
            if (toastTimeoutRef.current) {
                clearTimeout(toastTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="bingo-canvas-container"
            style={{
                width: '100vw',
                height: '100vh',
                position: 'fixed', // Changed from relative to fixed
                top: 0,
                left: 0,
                overflow: 'hidden',
                backgroundColor: '#191425'
            }}
        >
            {/* Optional: Keyboard shortcuts hint - uncomment if needed */}
            {/* <div className="shortcuts-hint" style={{...}}>...</div> */}

            {/* Toast notification */}
            {toastMessage && (
                <div className="toast-notification" style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: toastMessage.type === 'success' ? 'rgba(76, 175, 80, 0.95)' : 'rgba(244, 67, 54, 0.95)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '30px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    zIndex: 100,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    animation: 'slideUp 0.3s ease'
                }}>
                    {toastMessage.text}
                </div>
            )}

            <canvas
                ref={canvasRef}
                className="bingo-canvas"
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role="button"
                aria-label="Bingo game board with 12 selectable boxes. Use Ctrl+1-9 for boxes 1-9, Ctrl+0 for box 10, Ctrl+Q for box 11, and Ctrl+W for box 12."
                style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    // objectFit: 'contain'
                }}
            />

            <PrizeModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                cell={selectedCellDetails}
                cellColors={modalColors}
            />

            <style>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translate(-50%, 20px);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, 0);
                    }
                }
                
                body {
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                }
                
                .bingo-canvas-container {
                    margin: 0;
                    padding: 0;
                }
                
                .bingo-canvas {
                    outline: none;
                }
            `}</style>
            <style>{`
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translate(-50%, 20px);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0);
        }
    }
    
    body {
        margin: 0;
        padding: 0;
        overflow: hidden;
    }
    
    .bingo-canvas-container {
        margin: 0;
        padding: 0;
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
    }
    
    .bingo-canvas {
        outline: none;
        display: block;
        width: 100%;
        height: 100%;
        /* Prevent any scaling that might affect coordinate calculations */
        image-rendering: -webkit-optimize-contrast;
        image-rendering: crisp-edges;
    }
    
    /* Specific fix for ASUS devices */
    @media (hover: none) and (pointer: coarse) {
        .bingo-canvas {
            touch-action: none;
            -webkit-tap-highlight-color: transparent;
        }
    }
`}</style>
        </div>
    );
};