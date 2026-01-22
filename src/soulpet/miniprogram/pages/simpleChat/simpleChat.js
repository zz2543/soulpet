import { llmService } from '../../utils/llm';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 消息列表数据
    messageList: [],

    // 输入框文本
    inputText: '',

    // 滚动位置
    scrollTop: 0,
    toView: '',

    // 发送状态：false-未发送, true-发送中
    isSending: false,

    // 键盘高度，用于调整宠物位置
    keyboardHeight: 0,

    // 键盘是否弹起
    isKeyboardUp: false,

    // 宠物底部偏移量（默认位置，向上移动避免遮挡输入框）
    petBottomOffset: 100, // 100px，保持与输入框的间距

    // 欢迎消息配置
    welcomeMessage: '你好，我是你的电子宠物伙伴！有什么我可以帮你的吗？🌟',

    // 错误消息配置
    errorMessage: '抱歉，我遇到了一些问题，请稍后再试。😔',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    // 添加初始欢迎消息（使用默认欢迎语）
    const welcomeMessage = this.data.welcomeMessage;
    if (welcomeMessage && welcomeMessage.trim()) {
      this.addMessage('assistant', welcomeMessage);
    }
  },

  /**
   * 输入框输入事件
   * @param {Object} e 事件对象
   */
  onInput(e) {
    this.setData({
      inputText: e.detail.value,
    });
  },

  /**
   * 输入框获取焦点（键盘弹起）
   * @param {Object} e 事件对象
   */
  onInputFocus(e) {
    // 获取键盘高度，调整宠物位置
    const keyboardHeight = e.detail.height || 0;

    this.setData({
      isKeyboardUp: true,
      keyboardHeight: keyboardHeight,
      // 宠物跟随键盘上移，保持在键盘上方一定距离
      petBottomOffset: keyboardHeight + 150, // 150px 间距，避免遮挡输入框
    });

    // 延迟滚动到底部，等待键盘动画完成
    setTimeout(() => {
      this.scrollToBottom();
    }, 300);
  },

  /**
 * 键盘收起时的事件处理函数，将宠物位置重置为默认值
 * @param {Object} _e - 键盘收起事件对象（未使用）
 */
onInputBlur(_e) {
    // 键盘收起时，宠物回到默认位置（与 data 中默认值保持一致）
    this.setData({
      isKeyboardUp: false,
      keyboardHeight: 0,
      petBottomOffset: 100, // 回到默认底部 100px 位置
    });
  },

  /**
   * 发送消息
   * 处理发送逻辑：添加用户消息 -> 发送请求 -> 添加助手回复
   */
  sendMessage() {
    const { inputText, isSending } = this.data;

    // 1. 校验：发送中或输入为空时不处理
    if (isSending) {
      wx.showToast({
        title: '正在发送中...',
        icon: 'none',
      });
      return;
    }

    if (!inputText || inputText.trim() === '') {
      wx.showToast({
        title: '请输入内容',
        icon: 'none',
      });
      return;
    }

    // 2. 添加用户消息到列表
    this.addMessage('user', inputText);

    // 3. 清空输入框
    this.setData({
      inputText: '',
      isSending: true, // 设置发送状态
    });

    // 4. 发送远程请求
    this.sendChatRequest(inputText);
  },

  /**
   * 添加消息到列表
   * @param {String} role 角色：'user' 或 'assistant'
   * @param {String} content 消息内容
   */
  addMessage(role, content) {
    const { messageList } = this.data;
    const newMessage = {
      id: Date.now(), // 使用时间戳作为唯一 ID
      role: role,
      content: content,
    };

    this.setData({
      messageList: [...messageList, newMessage],
    });

    // 自动滚动到底部
    this.scrollToBottom();
  },

  /**
   * 发送聊天请求到后端
   * @param {String} userMessage 用户输入的消息
   */
  async sendChatRequest(userMessage) {
    try {
      // 构造请求消息历史
      // 过滤掉 id 等多余字段，只保留 role 和 content
      const messages = this.data.messageList.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // 使用 llmService 发送请求
      const res = await llmService.chatCompletion(messages);
      
      // 解析响应
      // 兼容 OpenAI/GLM 格式: choices[0].message.content
      if (res && res.choices && res.choices.length > 0 && res.choices[0].message) {
        const assistantReply = res.choices[0].message.content;
        this.addMessage('assistant', assistantReply);
      } else {
        console.warn('Unexpected response format:', res);
        // 尝试降级处理或显示原始返回（仅供调试）
        this.addMessage('assistant', JSON.stringify(res));
      }

    } catch (error) {
      console.error('发送请求失败：', error);
      
      // 失败：显示错误提示（使用配置的错误消息）
      const { errorMessage } = this.data;
      // 将错误信息添加到回复中，方便调试排查
      const detailedError = error.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
      this.addMessage('assistant', `${errorMessage}\n\n[调试错误信息]: ${detailedError}`);

      // 可选：显示 toast 提示
      wx.showToast({
        title: '请求失败',
        icon: 'none',
        duration: 2000,
      });
    } finally {
      // 无论成功失败，都重置发送状态
      this.setData({
        isSending: false,
      });
    }
  },

  /**
   * 滚动到消息列表底部
   */
  scrollToBottom() {
    const { messageList } = this.data;
    if (messageList.length === 0) return;

    // 设置滚动到底部的锚点
    this.setData({
      toView: 'bottom-anchor',
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
});
