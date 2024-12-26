<template>
    <view class="tetris-container">
        <!-- 自定义导航栏 -->
        <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
            <text class="nav-title">俄罗斯方块</text>
        </view>

        <!-- 顶部区域 -->
        <view class="header">
            <view class="header-content">
                <view class="score-box">
                    <text class="score-label">分数</text>
                    <text class="score-value">{{ score }}</text>
                </view>
                <view class="button-group">
                    <button class="control-btn start-btn" @click="startGame">
                        {{ isGameOver ? '重新开始' : '开始游戏' }}
                    </button>
                    <button 
                        class="control-btn pause-btn" 
                        @click="gameStore.pauseGame"
                        :disabled="isGameOver"
                    >
                        {{ isPaused ? '继续' : '暂停' }}
                    </button>
                </view>
            </view>
        </view>

        <!-- 游戏主体区域 -->
        <view class="game-wrapper">
            <view 
                class="touch-area"
                @touchstart="handleTouchStart"
                @touchmove="handleTouchMove"
                @touchend="handleTouchEnd"
            >
                <view class="game-area">
                    <view class="grid" v-for="(row, rowIndex) in displayBoard" :key="rowIndex">
                        <view 
                            class="cell" 
                            v-for="(cell, colIndex) in row" 
                            :key="colIndex" 
                            :class="getCellClass(cell)"
                        >
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <!-- 游戏结束提示 -->
        <view class="game-over" v-if="isGameOver">
            <view class="game-over-content">
                <view class="game-over-header">游戏结束</view>
                <view class="score-display">
                    <text class="score-label">最终得分</text>
                    <text class="score-number">{{ score }}</text>
                </view>
                <button class="restart-btn" @click="startGame">
                    <text class="btn-text">重新开始</text>
                </button>
            </view>
        </view>
    </view>
</template>

<script setup>
import { onMounted, onUnmounted, watch, ref } from 'vue'
import { useGameStore } from '@/store/game'
import { storeToRefs } from 'pinia'

const gameStore = useGameStore()
const { displayBoard, score, isGameOver, isPaused } = storeToRefs(gameStore)

// 添加获取单元格的方法
const getCellClass = (cell) => {
    const classes = {}
    switch (cell) {
        case 1:
            classes['piece-i'] = true
            break
        case 2:
            classes['piece-o'] = true
            break
        case 3:
            classes['piece-t'] = true
            break
        case 4:
            classes['piece-l'] = true
            break
        case 5:
            classes['piece-j'] = true
            break
        case 6:
            classes['piece-s'] = true
            break
        case 7:
            classes['piece-z'] = true
            break
    }
    return classes
}

// 监听位置变化
watch(() => gameStore.position, (newPos) => {
    console.log('Position changed:', newPos)
}, { deep: true })

// 监听当前方块变化
watch(() => gameStore.currentPiece, (newPiece) => {
    console.log('Current piece changed:', newPiece)
}, { deep: true })

// 游戏控制方法
const startGame = () => {
    console.log('Starting game...')
    gameStore.startGame()
}

// 添加键盘控制
const handleKeydown = (event) => {
    if (isGameOver.value) return

    switch (event.key) {
        case 'ArrowLeft':
            gameStore.moveLeft()
            break
        case 'ArrowRight':
            gameStore.moveRight()
            break
        case 'ArrowDown':
            gameStore.moveDown()
            break
        case 'ArrowUp':
            gameStore.rotate()
            break
        case ' ':  // 空格键
            gameStore.pauseGame()
            break
    }
}

// 添加触控相关的状态
const touchStart = ref({ x: 0, y: 0 })
const touchStartTime = ref(0)
const minSwipeDistance = 30  // 最小滑动距离
const maxTapDistance = 10    // 最大点击位移
const maxTapDuration = 200   // 最大点击持续时间（毫秒）

// 处理触摸开始
const handleTouchStart = (event) => {
    const touch = event.touches[0]
    touchStart.value = {
        x: touch.clientX,
        y: touch.clientY
    }
    touchStartTime.value = Date.now()
}

// 处理触摸结束
const handleTouchEnd = (event) => {
    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - touchStart.value.x
    const deltaY = touch.clientY - touchStart.value.y
    const duration = Date.now() - touchStartTime.value

    // 处理滑动手势
    if (Math.abs(deltaX) >= minSwipeDistance || Math.abs(deltaY) >= minSwipeDistance) {
        // 确定主要的滑动方向
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // 水平滑动
            if (deltaX > 0) {
                gameStore.moveRight()
            } else {
                gameStore.moveLeft()
            }
        } else {
            // 垂直滑动
            if (deltaY > 0) {
                gameStore.moveDown()
            } else {
                // 上滑旋转
                gameStore.rotate()
            }
        }
    }
}

// 处理触摸移动
const handleTouchMove = (event) => {
    // 防止页面滚动
    event.preventDefault()
    
    // 实时移动响应（可选）
    const touch = event.touches[0]
    const deltaX = touch.clientX - touchStart.value.x
    const deltaY = touch.clientY - touchStart.value.y

    // 如果垂直滑动距离超过阈值，加速下落
    if (deltaY > minSwipeDistance) {
        gameStore.moveDown()
        // 更新起始位置，避免重复触发
        touchStart.value.y = touch.clientY
    }
}

// 获取状态栏高度
const statusBarHeight = ref(0)

onMounted(() => {
    // 获取系统信息
    uni.getSystemInfo({
        success: (res) => {
            statusBarHeight.value = res.statusBarHeight
        }
    })

    console.log('Component mounted')
    // 添加键盘事件监听
    window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
    console.log('Component unmounting')
    // 移除键盘事件监听
    window.removeEventListener('keydown', handleKeydown)
    gameStore.stopGameLoop()
})
</script>

<style>
/* 基础颜色变量 */
:root {
    /* 主题色 */
    --primary-color: #2196F3;      /* 清新蓝 */
    --primary-dark: #1976D2;
    --accent-color: #00BCD4;       /* 清爽青 */
    --accent-dark: #0097A7;
    
    /* 背景色系 */
    --background-color: #F5F5F5;   /* 浅灰背景 */
    --surface-color: #FFFFFF;      /* 纯白表面 */
    --surface-light: #FAFAFA;      /* 微灰表面 */
    
    /* 文字颜色 */
    --text-primary: #212121;       /* 深灰文字 */
    --text-secondary: #757575;     /* 中灰文字 */
    
    /* 方块颜色 - 柔和现代的配色 */
    --piece-i-color: #4ECDC4;      /* 清新薄荷 */
    --piece-i-dark: #45B7AF;
    
    --piece-o-color: #FFD93D;      /* 温暖金色 */
    --piece-o-dark: #F4C430;
    
    --piece-t-color: #A78BFA;      /* 淡雅紫色 */
    --piece-t-dark: #9061F9;
    
    --piece-l-color: #FF9F43;      /* 柔和橙色 */
    --piece-l-dark: #F58D2D;
    
    --piece-j-color: #6C5CE7;      /* 优雅蓝紫 */
    --piece-j-dark: #5849BE;
    
    --piece-s-color: #2ECC71;      /* 清新绿色 */
    --piece-s-dark: #27AE60;
    
    --piece-z-color: #FF6B6B;      /* 温柔红色 */
    --piece-z-dark: #EE5253;
}

/* 容器布局 */
.tetris-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--background-color);
    display: flex;
    flex-direction: column;
    padding: env(safe-area-inset-top) 0 env(safe-area-inset-bottom);
}

/* 顶部区域 */
.header {
    flex-shrink: 0;
    background-color: var(--surface-color);
    border-radius: 12px;
    padding: 10px;
    margin: 0 10px 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* 分数区域 */
.score-box {
    background-color: var(--surface-light);
    padding: 8px 12px;
    border-radius: 8px;
    min-width: 80px;
    border: 1px solid rgba(0, 0, 0, 0.1);
}

.score-label {
    color: var(--text-secondary);
    font-size: 12px;
    display: block;
}

.score-value {
    color: var(--text-primary);
    font-size: 20px;
    font-weight: bold;
    display: block;
}

/* 按钮组 */
.button-group {
    display: flex;
    gap: 8px;
}

.control-btn {
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    min-width: 70px;
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.start-btn {
    background-color: var(--primary-color);
    color: white;
}

.pause-btn {
    background-color: var(--accent-color);
    color: white;
}

/* 游戏区域 */
.game-wrapper {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    margin: auto 0;
}

.game-area {
    width: min(85vw, 85vh * 0.5);
    aspect-ratio: 10/20;
    background: linear-gradient(to bottom, #FAFAFA, #F5F5F5);
    border-radius: 12px;
    padding: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(0, 0, 0, 0.1);
}

.grid {
    display: flex;
    width: 100%;
}

.cell {
    flex: 1;
    aspect-ratio: 1/1;
    background: rgba(0, 0, 0, 0.03);
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 2px;
    box-sizing: border-box;
}

/* 方块颜色 */
.cell.piece-i {
    background: linear-gradient(135deg, var(--piece-i-color), var(--piece-i-dark));
    box-shadow: 0 0 8px rgba(78, 205, 196, 0.4);
}

.cell.piece-o {
    background: linear-gradient(135deg, var(--piece-o-color), var(--piece-o-dark));
    box-shadow: 0 0 8px rgba(255, 217, 61, 0.4);
}

.cell.piece-t {
    background: linear-gradient(135deg, var(--piece-t-color), var(--piece-t-dark));
    box-shadow: 0 0 8px rgba(167, 139, 250, 0.4);
}

.cell.piece-l {
    background: linear-gradient(135deg, var(--piece-l-color), var(--piece-l-dark));
    box-shadow: 0 0 8px rgba(255, 159, 67, 0.4);
}

.cell.piece-j {
    background: linear-gradient(135deg, var(--piece-j-color), var(--piece-j-dark));
    box-shadow: 0 0 8px rgba(108, 92, 231, 0.4);
}

.cell.piece-s {
    background: linear-gradient(135deg, var(--piece-s-color), var(--piece-s-dark));
    box-shadow: 0 0 8px rgba(46, 204, 113, 0.4);
}

.cell.piece-z {
    background: linear-gradient(135deg, var(--piece-z-color), var(--piece-z-dark));
    box-shadow: 0 0 8px rgba(255, 107, 107, 0.4);
}

/* 游戏结束弹窗 */
.game-over {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease-out;
}

.game-over-content {
    background: linear-gradient(135deg, var(--surface-color), var(--surface-light));
    padding: 24px;
    border-radius: 20px;
    min-width: 280px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transform-origin: center;
    animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.game-over-header {
    color: var(--text-primary);
    font-size: 24px;
    font-weight: 600;
    text-align: center;
    margin-bottom: 20px;
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

.score-display {
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.05));
    padding: 16px;
    border-radius: 12px;
    margin-bottom: 24px;
    text-align: center;
    border: 1px solid rgba(0, 0, 0, 0.1);
}

.score-label {
    display: block;
    color: var(--text-secondary);
    font-size: 14px;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.score-number {
    display: block;
    color: var(--text-primary);
    font-size: 36px;
    font-weight: bold;
    line-height: 1;
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

.restart-btn {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
    border: none;
    width: 100%;
    padding: 14px 24px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
    transition: all 0.3s ease;
}

.restart-btn:active {
    transform: translateY(2px);
    box-shadow: 0 2px 6px rgba(33, 150, 243, 0.2);
}

/* 动画效果 */
@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes popIn {
    from {
        opacity: 0;
        transform: scale(0.8);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

/* 触摸区域 */
.touch-area {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* 添加导航栏样式 */
.nav-bar {
    background: linear-gradient(to bottom, var(--surface-color), var(--surface-light));
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-bottom: 10px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.nav-title {
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 1px;
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    position: relative;
    padding: 0 12px;
}

.nav-title::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    width: 24px;
    height: 2px;
    background: linear-gradient(to right, var(--primary-color), var(--accent-color));
    border-radius: 1px;
    opacity: 0.8;
}

/* 方块基础样式 */
.cell[class*="piece-"] {
    position: relative;
    border: none;
    transition: all 0.2s ease;
    overflow: hidden;
}

/* 方块内部发光效果 */
.cell[class*="piece-"]::before {
    content: '';
    position: absolute;
    inset: 1px;
    background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4), transparent 70%);
    opacity: 0.6;
}

/* 方块边缘光晕 */
.cell[class*="piece-"]::after {
    content: '';
    position: absolute;
    inset: -1px;
    background: inherit;
    filter: blur(1px);
    opacity: 0.2;
}

/* 方块动画效果 */
@keyframes appear {
    from {
        transform: scale(0.8);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}

.cell[class*="piece-"] {
    animation: appear 0.2s ease-out forwards;
}
</style>