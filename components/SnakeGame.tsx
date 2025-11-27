import React, { useEffect, useRef, useState, useCallback } from 'react';

const SnakeGame: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    
    // Game state refs to avoid closure staleness in loop
    const gameState = useRef({
        snake: [{x: 10, y: 10}],
        food: {x: 15, y: 15},
        dx: 0,
        dy: 0,
        gameRunning: true,
        scale: 15,
        cols: 0,
        rows: 0
    });

    const handleInput = useCallback((key: string) => {
        const state = gameState.current;
        if (!state.gameRunning) {
            resetGame();
            return;
        }

        switch(key) {
            case 'ArrowUp': 
                if (state.dy === 0) { state.dx = 0; state.dy = -1; }
                break;
            case 'ArrowDown': 
                if (state.dy === 0) { state.dx = 0; state.dy = 1; }
                break;
            case 'ArrowLeft': 
                if (state.dx === 0) { state.dx = -1; state.dy = 0; }
                break;
            case 'ArrowRight': 
                if (state.dx === 0) { state.dx = 1; state.dy = 0; }
                break;
        }
    }, []);

    const resetGame = () => {
        const state = gameState.current;
        state.snake = [{x: Math.floor(state.cols/2), y: Math.floor(state.rows/2)}];
        state.food = {
            x: Math.floor(Math.random() * state.cols),
            y: Math.floor(Math.random() * state.rows)
        };
        state.dx = 0;
        state.dy = 0;
        state.gameRunning = true;
        setScore(0);
        setGameOver(false);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Setup dimensions
        const isMobile = window.innerWidth <= 768;
        canvas.width = isMobile ? Math.min(window.innerWidth - 40, 400) : 480;
        canvas.height = (canvas.width * 2) / 3;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const state = gameState.current;
        state.cols = Math.floor(canvas.width / state.scale);
        state.rows = Math.floor(canvas.height / state.scale);
        
        // Initial reset to center snake
        resetGame();

        const drawSnakePart = (snakePart: {x: number, y: number}) => {
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(snakePart.x * state.scale, snakePart.y * state.scale, state.scale - 2, state.scale - 2);
            ctx.strokeStyle = '#008800';
            ctx.strokeRect(snakePart.x * state.scale, snakePart.y * state.scale, state.scale - 2, state.scale - 2);
        };

        const drawFood = () => {
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(state.food.x * state.scale, state.food.y * state.scale, state.scale - 2, state.scale - 2);
            ctx.strokeStyle = '#cc0000';
            ctx.strokeRect(state.food.x * state.scale, state.food.y * state.scale, state.scale - 2, state.scale - 2);
        };

        const draw = () => {
            // Background
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Grid
            ctx.strokeStyle = '#111';
            ctx.lineWidth = 1;
            for (let i = 0; i < state.cols; i++) {
                ctx.beginPath();
                ctx.moveTo(i * state.scale, 0);
                ctx.lineTo(i * state.scale, canvas.height);
                ctx.stroke();
            }
            for (let i = 0; i < state.rows; i++) {
                ctx.beginPath();
                ctx.moveTo(0, i * state.scale);
                ctx.lineTo(canvas.width, i * state.scale);
                ctx.stroke();
            }
            
            // Game elements
            state.snake.forEach(drawSnakePart);
            drawFood();
            
            if (!state.gameRunning) {
                ctx.fillStyle = 'rgba(0,0,0,0.8)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Game Over!', canvas.width/2, canvas.height/2 - 20);
                ctx.font = '16px Arial';
                ctx.fillText('Toque qualquer direção para reiniciar', canvas.width/2, canvas.height/2 + 20);
                ctx.textAlign = 'left';
            }
        };

        const moveSnake = () => {
            if (!state.gameRunning) return;
            
            const head = {x: state.snake[0].x + state.dx, y: state.snake[0].y + state.dy};
            
            // Check collisions
            if (head.x < 0 || head.x >= state.cols || head.y < 0 || head.y >= state.rows || 
                state.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
                state.gameRunning = false;
                setGameOver(true);
                return;
            }

            state.snake.unshift(head);

            if (head.x === state.food.x && head.y === state.food.y) {
                setScore(s => s + 10);
                // New food
                let newFood;
                do {
                    newFood = {
                        x: Math.floor(Math.random() * state.cols),
                        y: Math.floor(Math.random() * state.rows)
                    };
                } while (state.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
                state.food = newFood;
            } else {
                state.snake.pop();
            }
        };

        const gameLoop = setInterval(() => {
            moveSnake();
            draw();
        }, 150); // Speed

        const handleKeyDown = (e: KeyboardEvent) => {
            handleInput(e.key);
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            clearInterval(gameLoop);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleInput]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl p-4 max-w-2xl w-full border border-gray-600">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span>🐍</span> Snake Game
                    </h2>
                    <div className="flex items-center gap-4">
                        <span className="text-yellow-400 font-bold text-lg">Score: {score}</span>
                        <button onClick={onClose} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                <div className="flex justify-center mb-4">
                    <canvas 
                        ref={canvasRef} 
                        className="border-2 border-gray-600 bg-black rounded shadow-lg max-w-full"
                    />
                </div>

                {/* Mobile Controls */}
                <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
                    <div></div>
                    <button 
                        className="bg-gray-700 active:bg-gray-600 p-4 rounded-lg flex items-center justify-center"
                        onClick={() => handleInput('ArrowUp')}
                    >
                        <i className="fas fa-arrow-up text-white"></i>
                    </button>
                    <div></div>
                    <button 
                        className="bg-gray-700 active:bg-gray-600 p-4 rounded-lg flex items-center justify-center"
                        onClick={() => handleInput('ArrowLeft')}
                    >
                        <i className="fas fa-arrow-left text-white"></i>
                    </button>
                    <button 
                        className="bg-gray-700 active:bg-gray-600 p-4 rounded-lg flex items-center justify-center"
                        onClick={() => resetGame()}
                    >
                         <i className="fas fa-redo text-white text-xs"></i>
                    </button>
                    <button 
                        className="bg-gray-700 active:bg-gray-600 p-4 rounded-lg flex items-center justify-center"
                        onClick={() => handleInput('ArrowRight')}
                    >
                        <i className="fas fa-arrow-right text-white"></i>
                    </button>
                    <div></div>
                    <button 
                        className="bg-gray-700 active:bg-gray-600 p-4 rounded-lg flex items-center justify-center"
                        onClick={() => handleInput('ArrowDown')}
                    >
                        <i className="fas fa-arrow-down text-white"></i>
                    </button>
                    <div></div>
                </div>
                
                <p className="text-center text-gray-400 text-sm mt-4">
                    Use o teclado ou botões para jogar. Kantinho Delícia 🍕
                </p>
            </div>
        </div>
    );
};

export default SnakeGame;
