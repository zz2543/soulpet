# 简单聊天页面 (SimpleChat) 使用说明

## 页面功能概述

这是一个简洁的单页聊天界面，包含以下核心功能：

### 1. 基础聊天功能
- ✅ 消息列表展示（支持用户消息和助手消息）
- ✅ 文本输入框
- ✅ 发送按钮（带加载状态）
- ✅ 自动滚动到底部

### 2. 电子宠物功能
- ✅ 左下角圆形宠物区域（直径 120px）
- ✅ 玻璃质感效果（毛玻璃、阴影、半透明）
- ✅ 宠物占位图标（简化猫脸）

### 3. 键盘跟随功能
- ✅ 键盘弹起时宠物跟随上移
- ✅ 键盘收起时宠物回到默认位置
- ✅ 平滑过渡动画（300ms）

### 4. 发送请求逻辑
- ✅ 发送前校验（空消息、发送中状态）
- ✅ 立即显示用户消息
- ✅ 远程请求占位（可替换真实 API）
- ✅ 成功/失败处理
- ✅ 错误提示

### 5. 视觉设计
- ✅ 治愈系轻拟物风格
- ✅ 大圆角气泡（16-22rpx）
- ✅ 渐变色按钮和背景
- ✅ 适配 iPhone 刘海屏和底部安全区
- ✅ 充足留白

## 文件结构

```
pages/simpleChat/
├── simpleChat.wxml   # 页面结构（WXML）
├── simpleChat.wxss   # 页面样式（WXSS）
├── simpleChat.js     # 页面逻辑（JavaScript）
├── simpleChat.json   # 页面配置（JSON）
└── README.md         # 使用说明文档
```

## 如何使用

### 1. 进入页面
在首页点击"开始使用"按钮，即可跳转到简单聊天页面。

### 2. 发送消息
1. 在底部输入框中输入文字
2. 点击右侧的紫色发送按钮
3. 用户消息会立即显示在右侧
4. 系统会发送请求到后端（当前为占位 API）
5. 助手回复会显示在左侧

### 3. 替换真实 API

打开 `simpleChat.js` 文件，找到 `sendChatRequest` 方法（约 150 行），修改以下内容：

```javascript
// 原代码（示例 API）
const res = await wx.request({
  url: 'https://api.example.com/chat', // 替换为实际 API 地址
  method: 'POST',
  header: {
    'content-type': 'application/json',
  },
  data: {
    message: userMessage,
  },
});
```

修改为你的真实 API 地址：

```javascript
const res = await wx.request({
  url: 'https://your-api.com/chat', // 替换为真实 API
  method: 'POST',
  header: {
    'content-type': 'application/json',
    // 可能需要添加其他 header，如：
    // 'Authorization': 'Bearer your-token',
  },
  data: {
    message: userMessage,
    // 根据你的 API 要求添加其他参数
  },
});
```

### 4. 调整 API 响应处理

根据你的 API 响应格式，修改处理逻辑：

```javascript
// 示例 1：API 返回格式为 { reply: "回复内容" }
if (res.statusCode === 200) {
  const assistantReply = res.data.reply || '收到你的消息了！';
  this.addMessage('assistant', assistantReply);
}

// 示例 2：API 返回格式为 { data: { content: "回复内容" } }
if (res.statusCode === 200) {
  const assistantReply = res.data.data?.content || '收到你的消息了！';
  this.addMessage('assistant', assistantReply);
}

// 示例 3：API 返回格式为 { answer: "回复内容" }
if (res.statusCode === 200) {
  const assistantReply = res.data.answer || '收到你的消息了！';
  this.addMessage('assistant', assistantReply);
}
```

## 核心功能说明

### 电子宠物位置计算

宠物区域的底部位置通过以下公式计算：

```javascript
// 默认位置（键盘收起）
petBottomOffset: 100  // 距离底部 100px，保持与输入框的间距

// 键盘弹起位置
petBottomOffset: keyboardHeight + 120  // 键盘上方 120px，避免遮挡输入框
```

在 `onInputFocus` 方法中实现：

```javascript
onInputFocus(e) {
  const keyboardHeight = e.detail.height || 0;

  this.setData({
    isKeyboardUp: true,
    keyboardHeight: keyboardHeight,
    petBottomOffset: keyboardHeight + 120, // 120px 间距，避免遮挡输入框
  });
}
```

### 消息气泡样式

- **用户消息**：右侧，紫色渐变背景，圆角 32rpx，右下角小圆角
- **助手消息**：左侧，白色背景，灰色边框，圆角 32rpx，左下角小圆角

### 动画效果

- **消息淡入**：`fadeIn 0.3s ease-out`
- **发送按钮旋转**：`rotate 1s linear infinite`（加载时）
- **宠物跟随**：`bottom 0.3s ease-out`（键盘弹起/收起）

## 自定义修改

### 修改宠物图标

替换 `imgs/pet-placeholder.svg` 文件，或修改 WXML 中的 `src` 路径：

```xml
<image
  class="pet-placeholder"
  src="/imgs/your-custom-icon.svg"  <!-- 替换为你的图标 -->
  mode="aspectFit"
/>
```

### 调整宠物位置

修改 `simpleChat.js` 中的 `petBottomOffset` 值（默认为 100）：

```javascript
// 默认位置（键盘收起）
petBottomOffset: 100  // 距离底部 100px

// 键盘弹起位置
petBottomOffset: keyboardHeight + 120  // 键盘上方 120px
```

如果要调整宠物的水平位置，修改 WXML 中的样式：

```xml
<!-- 居中显示（默认） -->
<view style="bottom: {{petBottomOffset}}px; left: 50%; transform: translateX(-50%);">

<!-- 左对齐 -->
<view style="bottom: {{petBottomOffset}}px; left: 20px;">

<!-- 右对齐 -->
<view style="bottom: {{petBottomOffset}}px; right: 20px;">
```

### 调整宠物大小

修改 `simpleChat.wxss` 中的 `.pet-area` 样式：

```css
.pet-area {
  width: 240rpx;  /* 默认 240rpx（约 120px） */
  height: 240rpx;
}
```

### 修改颜色主题

在 `simpleChat.wxss` 中修改以下变量：

```css
/* 用户消息渐变色 */
.user-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 发送按钮渐变色 */
.send-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 背景渐变 */
.chat-container {
  background: linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%);
}
```

## 常见问题

### Q1: 为什么点击发送没反应？
A: 检查控制台是否有错误。当前代码使用的是示例 API，需要替换为真实 API 才能正常工作。

### Q2: 如何添加图片发送功能？
A: 需要在输入框左侧添加图片上传按钮，修改 WXML 和 JS 逻辑。这是高级功能，需要额外开发。

### Q3: 宠物位置不对怎么办？
A: 检查键盘高度是否正确获取。在真机上测试时，确保 `e.detail.height` 能获取到正确的键盘高度。

### Q4: 如何保存聊天记录？
A: 可以使用 `wx.setStorageSync` 将 `messageList` 保存到本地存储，在 `onLoad` 时读取。

## 技术要点

1. **键盘跟随**：通过监听输入框的 `focus` 和 `blur` 事件获取键盘高度
2. **安全区适配**：使用 `env(safe-area-inset-bottom)` 适配 iPhone 底部
3. **状态管理**：使用 `isSending` 控制发送状态，防止重复提交
4. **自动滚动**：使用 `scroll-into-view` 实现消息列表自动滚动到底部

## 后续优化建议

1. 添加语音输入功能
2. 实现消息长按复制、删除
3. 添加表情符号支持
4. 实现聊天记录本地存储
5. 添加宠物动态效果（眨眼、呼吸等）
6. 支持发送图片/文件
7. 添加消息撤回功能
8. 实现多轮对话记忆

## 联系与反馈

如有问题或建议，欢迎提出！
