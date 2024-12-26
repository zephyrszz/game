// 方块类型和颜色映射
export const PIECE_TYPES = {
    I: 1, // I型方块
    O: 2, // O型方块
    T: 3, // T型方块
    L: 4, // L型方块
    J: 5, // J型方块
    S: 6, // S型方块
    Z: 7  // Z型方块
}

// 游戏常量
export const SHAPES = [
    { type: PIECE_TYPES.I, shape: [[1, 1, 1, 1]] },              // I
    { type: PIECE_TYPES.O, shape: [[1, 1], [1, 1]] },           // O
    { type: PIECE_TYPES.T, shape: [[1, 1, 1], [0, 1, 0]] },     // T
    { type: PIECE_TYPES.L, shape: [[1, 1, 1], [1, 0, 0]] },     // L
    { type: PIECE_TYPES.J, shape: [[1, 1, 1], [0, 0, 1]] },     // J
    { type: PIECE_TYPES.S, shape: [[1, 1, 0], [0, 1, 1]] },     // S
    { type: PIECE_TYPES.Z, shape: [[0, 1, 1], [1, 1, 0]] }      // Z
]

// 随机生成方块
export function getRandomShape() {
    const piece = SHAPES[Math.floor(Math.random() * SHAPES.length)]
    return {
        type: piece.type,
        shape: piece.shape
    }
}

// 检查碰撞
export function checkCollision(board, shape, position) {
    const rows = shape.length
    const cols = shape[0].length
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (shape[row][col]) {
                const newRow = position.y + row
                const newCol = position.x + col
                
                // 检查边界和碰撞
                if (newCol < 0 || newCol >= board[0].length || 
                    newRow >= board.length ||
                    (newRow >= 0 && board[newRow][newCol] !== 0)) {
                    return true
                }
            }
        }
    }
    
    return false
}

// 合并方块到游戏板
export function mergeShapeToBoard(board, shape, position) {
    const newBoard = board.map(row => [...row])
    
    shape.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (cell) {
                const boardRow = position.y + rowIndex
                const boardCol = position.x + colIndex
                if (boardRow >= 0 && boardRow < board.length && boardCol >= 0 && boardCol < board[0].length) {
                    newBoard[boardRow][boardCol] = 1
                }
            }
        })
    })
    
    return newBoard
}

// 清除完整的行
export function clearLines(board) {
    let linesCleared = 0
    const newBoard = board.filter(row => {
        if (row.every(cell => cell !== 0)) {
            linesCleared++
            return false
        }
        return true
    })
    
    // 在顶部添加新的空行
    while (newBoard.length < board.length) {
        newBoard.unshift(Array(board[0].length).fill(0))
    }
    
    return {
        board: newBoard,
        linesCleared
    }
}

// 旋转方块
export function rotateShape(shape) {
    const rows = shape.length
    const cols = shape[0].length
    const rotated = Array(cols).fill().map(() => Array(rows).fill(0))
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            rotated[col][rows - 1 - row] = shape[row][col]
        }
    }
    
    return rotated
} 