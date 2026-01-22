# soulpet
这是一个ai心理咨询师和虚拟宠物的项目。
This is a project that combines an AI therapist with a virtual pet.

## Project Overview
### what
SoulPet 是一款基于大语言模型（LLM）的心理陪伴 App。它首创了“专业咨询师（AI）+ 情感投射物（虚拟宠物）”的协同交互模式。
 - 理性分析+感性陪伴
 - 专业咨询师（AI）为主，情感投射物（虚拟宠物）为辅
### why
现代人普遍面临高压与焦虑，但传统心理咨询存在“三高”门槛（费用高、预约门槛高、心理负担高--尤其是心理负担高）。
- 通用大模型（如 ChatGPT）： 缺乏长期记忆（记忆仅限于一个聊天窗口中<像 ChatGPT 这类ai 的自学习用户信息的长记忆采样信息比较随机>），且回答需要用户通过调节提示词达到良好的回答质量，难以建立深层情感连接。
- 传统电子宠物： 娱乐性强，但缺乏深度的语言理解能力和心理干预功能，无法解决实际心理问题。
- -->用户需要一个既能**专业**疏导，又能提供**陪伴**的**低门槛**心理健康入口。
### how
 - 长期情感记忆 (Long-term Memory via RAG): 基于向量数据库（Vector DB），系统能记住用户的过往经历、创伤点、喜好及人际关系。
 - 隐形心理干预 (Implicit Therapy)（--理性高质量的回答） :摒弃说教式的医疗建议，将科学的心理治疗方法（如认知行为疗法（CBT））融入日常闲聊与宠物互动中，降低用户的心理防御机制。--理性高质量的回答
 - 多模态情绪共鸣 (Dual-Modal Empathy（--感性的情绪支撑):
	 - 听觉/文本： AI 识别用户情绪（如焦虑、抑郁），提供语音/文字疏导。
	 - 视觉/行为： 虚拟宠物根据情绪指令实时做出反应（如：用户哭泣时，宠物递纸巾/贴贴；用户开心时，宠物转圈）。
### 技术栈
- 大脑 (Brain): 大模型 API (DeepSeek / GPT-4o) + 提示词工程 (Prompt Engineering）知识库+LLM，在项目后期积累问答数据后考虑使用微调技术训练模型。
- 记忆 (Memory): RAG 架构·（检索增强生成）+ 向量数据库（存储用户画像与历史对话）。
- 控制 (Control): “情绪-动作映射层”，将自然语言的情绪分析转化为前端宠物的动画状态机指令（State Machine）。
- 前端 (Frontend): 精美的界面设计+虚拟宠物模型渲染。
### 壁垒
- 情感沉默成本：用户在不断的与 ai 沟通中，ai 越来越了解，适应和贴切用户预期
- 高质量的回答：在前期的提示词工程和后期的微调中，不断调整和优化模型的回答，做到兼具情绪支撑、反馈和使用价值，并设置多种回答模式（更温暖，更理性客观等）给用户选择。
- 虚拟宠物陪伴体验：一套精细调优的逻辑库，精准定义了“何种心理状态触发何种宠物行为”，实现了超越语言的治愈体验。
### 有待探索
- 心理咨询师是设计另一个人类形象还是由虚拟宠物充当
- 探索社交属性功能：
	- 宠物串门与漂流瓶（弱社交机制）：由宠物带着主人或者 ai 学的有力量的句子到别人家串门，并可以回信。
	- AIGC 情绪拍立得：“情绪可视化”：每次深度对话结束后，AI 总结用户的心境，结合宠物当时的动作，生成一张极具艺术感的“情绪拍立得”海报。

调研需求
调模型符合核心需求

## Datasets Download Links
- PsyDTCorpus https://modelscope.cn/datasets/YIRONGCHEN/PsyDTCorpus/files

## file structure
```
soulpet/
├── .env                    # [新] 环境变量 (API Key, 模型路径等)
├── .gitignore
├── pyproject.toml          # 现有依赖配置
├── uv.lock                 # 锁定文件
├── rxconfig.py             # [新] Reflex 核心配置文件 (Reflex 项目必需)
├── assets/                 # [新] 静态资源 (存放图片、Logo、以及 Reflex 编译后的静态文件)
├── data/                   # 数据文件夹
│   └── PsyDTCorpus/        # 您的数据集
├── doc/                    # 文档
├── src/
│   └── soulpet/            # Python 包源码根目录
│       ├── __init__.py     # 暴露常用模块
│       ├── app.py          # [重命名建议] 应用入口 (原 main.py 建议移到这里或作为启动脚本)
│       │
│       ├── llm/            # AI 核心逻辑层 (Torch/Transformers)
│       │   ├── __init__.py
│       │   ├── engine.py   # 模型加载与推理逻辑 (Inference)
│       │   ├── dataset.py  # 处理 PsyDTCorpus 数据的 Loader
│       │   └── prompts.py  # System Prompts 定义
│       │
│       ├── state/          # [Reflex核心] 业务逻辑与状态管理
│       │   ├── __init__.py
│       │   ├── base.py     # 基础 State (通用变量)
│       │   └── chat_state.py # 聊天特定状态 (处理用户输入、调用 llm)
│       │
│       ├── ui/             # [Reflex核心] 界面展示层
│       │   ├── __init__.py
│       │   ├── components/ # 可复用 UI 组件 (如: 聊天气泡, Navbar)
│       │   │   ├── chat_bubble.py
│       │   │   └── layout.py
│       │   └── pages/      # 页面定义
│       │       ├── index.py
│       │       └── settings.py
│       │
│       └── api/            # [可选] 纯后端 API 扩展 (FastAPI Router)
│           ├── __init__.py
│           └── v1.py       # 如果需要对外提供 REST API
```