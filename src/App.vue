<template>
    <view class="app-container">
        <view class="content">
            <view>
                <router-view></router-view>
            </view>
        </view>
    </view>
</template>

<script setup>
</script>

<style>
/* 全局样式 */
page {
    background-color: #f8f8f8;
}

.app-container {
    width: 100%;
    min-height: 100vh;
}

.content {
    width: 100%;
    height: 100%;
}
</style> 