const DEFAULT_CONFIG = {
  apiUrl: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
  model: "glm-4.7",
  apiKey: "8b9c02365699419d9c8f2dd2535959f7.2vQS0lgh7caiGvE4", // 这里建议不要直接硬编码，而是通过云函数或其他方式获取，或者在初始化时传入
};

class LLMService {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG,
      ...config
    };
  }

  /**
   * 更新配置
   * @param {Object} newConfig 
   */
  updateConfig(newConfig) {
    this.config = { ...this.config,
      ...newConfig
    };
  }

  /**
   * 发送聊天请求
   * @param {Array} messages 历史消息列表 [{role: 'user', content: '...'}, ...]
   * @param {Object} options 额外的参数，如 temperature, max_tokens 等
   * @returns {Promise<Object>} 返回从API获取的完整响应数据
   */
  async chatCompletion(messages, options = {}) {
    const {
      apiUrl,
      apiKey,
      model
    } = this.config;

    if (!apiKey) {
      console.warn("Usage warning: API Key is missing.");
    }

    const payload = {
      model: model,
      messages: messages,
      // 注意：thinking 参数仅部分模型（如 glm-4.7）支持，为了保证稳定性暂时注释，如果需要可解开
      // thinking: {
      //   type: "enabled"
      // },
      max_tokens: options.max_tokens || 4096,
      temperature: options.temperature || 0.7,
      stream: false, 
      // 合并其他自定义参数，允许覆盖 defaults
      ...options
    };

    console.log('[LLM] Sending Request:', { url: apiUrl, payload });

    return new Promise((resolve, reject) => {
      wx.request({
        url: apiUrl,
        method: "POST",
        header: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        data: payload,
        success: (res) => {
          console.log('[LLM] Response Received:', res);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            console.error("API Error request:", res);
            // 尝试从返回体中获取更详细的错误信息
            const errorMsg = res.data && res.data.error ? JSON.stringify(res.data.error) : res.errMsg;
            reject(new Error(`API Error: ${res.statusCode} - ${errorMsg}`));
          }
        },
        fail: (err) => {
          console.error("Network Error:", err);
          reject(err);
        },
      });
    });
  }
}

// 导出单例或类
export const llmService = new LLMService();
export {
  LLMService
};
