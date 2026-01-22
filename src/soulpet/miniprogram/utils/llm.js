const DEFAULT_CONFIG = {
  apiUrl: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
  model: "glm-4.7",
  apiKey: "eceb5107c89148938cf8ae35b4d1a0ba.MOBrNxXFHSjxnEV6", // 这里建议不要直接硬编码，而是通过云函数或其他方式获取，或者在初始化时传入
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
      thinking: {
        type: "enabled"
      },
      max_tokens: options.max_tokens || 4096,
      temperature: options.temperature || 0.7,
      // 合并其他自定义参数，允许覆盖 defaults
      ...options
    };

    return new Promise((resolve, reject) => {
      wx.request({
        url: apiUrl,
        method: "POST",
        header: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          // 如果需要自定义header，也可以在这里扩展
        },
        data: payload,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            console.error("API Error request:", res);
            reject(new Error(`API Error: ${res.statusCode} - ${res.errMsg}`));
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
