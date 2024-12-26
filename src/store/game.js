import { defineStore } from 'pinia'
import { getRandomShape, checkCollision, mergeShapeToBoard, clearLines } from '@/utils/game'

// 定义游戏状态管理
export const useGameStore = defineStore('game', {
    // 初始化游戏状态
    state: () => ({
        board: Array(20).fill().map(() => Array(10).fill(0)), // 游戏板，20行10列
        currentPiece: null,  // 当前活动方块
        position: { x: 0, y: 0 },  // 当前方块位置
        score: 0,  // 游戏得分
        isGameOver: false,  // 游戏结束标志
        isPaused: false,  // 游戏暂停标志
        gameInterval: null,  // 游戏循环定时器
        gameSpeed: 1000  // 方块下落速度（毫秒）
    }),

    // 计算属性
    getters: {
        // 计算显示用的游戏板（包含当前活动方块）
        displayBoard: (state) => {
            if (!state.currentPiece) return state.board

            // 创建游戏板的深拷贝
            const display = JSON.parse(JSON.stringify(state.board))
            
            // 将当前方块添加到显示板上
            if (state.currentPiece) {
                state.currentPiece.shape.forEach((row, rowIndex) => {
                    row.forEach((cell, colIndex) => {
                        if (cell) {
                            const boardRow = state.position.y + rowIndex
                            const boardCol = state.position.x + colIndex
                            if (boardRow >= 0 && boardRow < 20 && boardCol >= 0 && boardCol < 10) {
                                // 使用方块类型作为显示值
                                display[boardRow][boardCol] = state.currentPiece.type
                            }
                        }
                    })
                })
            }
            
            return display
        }
    },

    // 游戏操作方法
    actions: {
        // 开始新游戏
        startGame() {
            this.stopGameLoop()  // 停止可能存在的游戏循环
            this.board = Array(20).fill().map(() => Array(10).fill(0))  // 清空游戏板
            this.score = 0  // 重置分数
            this.isGameOver = false
            this.isPaused = false
            this.currentPiece = null
            this.position = { x: 0, y: 0 }
            this.spawnNewPiece()  // 生成第一个方块
            this.startGameLoop()  // 开始游戏循环
        },

        // 生成新方块
        spawnNewPiece() {
            console.log('Spawning new piece...')
            this.currentPiece = getRandomShape()  // 随机获取一个方块形状
            console.log('New piece:', this.currentPiece)
            
            // 设置初始位置（居中）
            this.position = {
                x: Math.floor((10 - this.currentPiece.shape[0].length) / 2),
                y: 0
            }
            console.log('Initial position:', this.position)
            
            // 检查是否游戏结束（新方块生成时就发生碰撞）
            if (checkCollision(this.board, this.currentPiece.shape, this.position)) {
                console.log('Game over - collision on spawn')
                this.isGameOver = true
                this.stopGameLoop()
            }
        },

        // 启动游戏循环
        startGameLoop() {
            this.stopGameLoop()  // 确保没有多个循环
            this.gameInterval = setInterval(() => {
                if (!this.isPaused && !this.isGameOver) {
                    console.log('Game loop tick')
                    const moved = this.moveDown()
                    console.log('Moved down:', moved)
                    console.log('Current board:', this.board)
                    console.log('Current position:', this.position)
                }
            }, this.gameSpeed)
        },

        // 停止游戏循环
        stopGameLoop() {
            if (this.gameInterval) {
                clearInterval(this.gameInterval)
                this.gameInterval = null
            }
        },

        // 左移方块
        moveLeft() {
            if (this.isPaused || this.isGameOver || !this.currentPiece) return
            const newPosition = { ...this.position, x: this.position.x - 1 }
            if (!checkCollision(this.board, this.currentPiece.shape, newPosition)) {
                this.position = newPosition
            }
        },

        // 右移方块
        moveRight() {
            if (this.isPaused || this.isGameOver || !this.currentPiece) return
            const newPosition = { ...this.position, x: this.position.x + 1 }
            if (!checkCollision(this.board, this.currentPiece.shape, newPosition)) {
                this.position = newPosition
            }
        },

        // 下落方块
        moveDown() {
            if (this.isPaused || this.isGameOver || !this.currentPiece) return false

            const newPosition = { ...this.position, y: this.position.y + 1 }
            console.log('Moving down to position:', newPosition)

            // 检查是否可以移动
            if (!checkCollision(this.board, this.currentPiece.shape, newPosition)) {
                console.log('No collision, updating position')
                this.position = { ...newPosition }
                return true
            } else {
                console.log('Collision detected, merging piece')
                this.mergePiece()
                return false
            }
        },

        // 旋转方块
        rotate() {
            if (this.isPaused || this.isGameOver || !this.currentPiece) return
            
            // 计算旋转后的形状
            const rotated = {
                type: this.currentPiece.type,
                shape: this.currentPiece.shape[0].map((_, i) => 
                    this.currentPiece.shape.map(row => row[row.length - 1 - i])
                )
            }
            
            // 检查旋转后是否会发生碰撞
            if (!checkCollision(this.board, rotated.shape, this.position)) {
                this.currentPiece = rotated
            }
        },

        // 合并方块到游戏板
        mergePiece() {
            if (!this.currentPiece) return
            
            // 将当前方块的类型合并到游戏板
            this.currentPiece.shape.forEach((row, rowIndex) => {
                row.forEach((cell, colIndex) => {
                    if (cell) {
                        const boardRow = this.position.y + rowIndex
                        const boardCol = this.position.x + colIndex
                        if (boardRow >= 0 && boardRow < 20 && boardCol >= 0 && boardCol < 10) {
                            this.board[boardRow][boardCol] = this.currentPiece.type
                        }
                    }
                })
            })

            const { board: newBoard, linesCleared } = clearLines(this.board)
            this.board = newBoard
            this.score += linesCleared * 100
            this.spawnNewPiece()
        },

        // 暂停/继续游戏
        pauseGame() {
            this.isPaused = !this.isPaused
        }
    }
}) 