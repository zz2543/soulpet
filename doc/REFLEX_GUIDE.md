# Reflex 开发指南 (基于 SoulPet 项目)

本文档总结了 SoulPet 项目中使用的 Reflex 框架核心概念、构建逻辑及常用 API 用法。

## 1. 核心构建逻辑

Reflex 的核心理念是用 **纯 Python** 编写全栈 Web 应用。它将应用分为三个主要部分：

1.  **UI (User Interface)**: 使用 Python 函数定义前端页面布局和组件。这些代码最终会被编译为 React。
2.  **State (状态管理)**: 使用继承自 `rx.State` 的类来管理应用数据。状态变量的变化会自动触发 UI 更新。
3.  **Events (事件处理)**: State 类中的方法（Event Handlers）用于响应用户交互（如点击、提交），并在后端执行逻辑。

### 数据流向
1. **渲染**: UI 读取 `State` 中的变量进行展示。
2. **交互**: 用户触发事件（如点击按钮）。
3. **处理**: 触发 `State` 中的函数，执行后端逻辑（Python 代码）。
4. **更新**: `State` 变量改变，Reflex 自动将新数据推送到前端更新界面。

---

## 2. 状态管理 (rx.State)

`rx.State` 是应用的大脑。所有的业务逻辑和动态数据都应该放在这里。

### 基础用法

```python
class State(rx.State):
    # 1. 状态变量 (State Vars)
    # 定义带有类型注解的类属性。这些变量可以在 UI 中直接引用。
    # 当这些变量改变时，界面会自动刷新。
    chat_history: list[tuple[str, str]] = []
    count: int = 0

    # 2. 事件处理器 (Event Handlers)
    # 定义修改状态的方法。
    def answer(self, form_data: dict):
        # 获取表单数据
        question = form_data.get("question")
        
        # 修改状态变量
        self.chat_history.append((question, "AI 的回复"))
```

### 关键点
*   **类型注解**: 必须为状态变量提供类型注解（如 `int`, `str`, `list`），Reflex 依赖它来生成前端代码。
*   **Form 处理**: 在表单提交事件中，参数通常是一个字典 `form_data`，键名为输入组件的 `id`。

---

## 3. UI 构建 (Components)

UI 是由一系列嵌套的组件函数构成的。

### 常用组件

*   **布局组件**:
    *   `rx.box()`: 通用容器（类似 HTML `<div>`）。
    *   `rx.center()`: 将内容居中显示的容器。
    *   `rx.vstack()`: 垂直堆叠子元素（Vertical Stack）。
    *   `rx.hstack()`: 水平排列子元素（Horizontal Stack）。
    
*   **基础组件**:
    *   `rx.text("内容")`: 显示文本。
    *   `rx.heading("标题")`: 标题文本。
    *   `rx.button("按钮")`: 按钮。
    *   `rx.input()`: 输入框。

### 样式与属性
Reflex 组件参数支持 CSS 属性（使用下划线命名法）：
```python
rx.box(
    rx.text("Hello"),
    background_color="white", # CSS background-color
    margin_top="20px",        # CSS margin-top
    border_radius="10px",     # CSS border-radius
    width="100%"
)
```

### 动态逻辑与控制流

Reflex 提供了特殊的组件来处理前端的逻辑判断和循环，**不能直接使用 Python 的 `if` 或 `for` 构建 UI 结构**（除非是在组件函数内部生成静态结构）。

#### 1. 条件渲染 (`rx.cond`)
根据状态变量的值显示不同的样式或内容。
```python
# 语法: rx.cond(条件, 真时显示的内容, 假时显示的内容)
background_color=rx.cond(is_user, "#dfe6fd", "#f0f0f0")
```

#### 2. 列表循环 (`rx.foreach`)
用于遍历 `State` 中的列表。
```python
rx.foreach(
    State.chat_history,  # 要遍历的列表 (必须是 State 中的变量)
    lambda item: rx.text(item) # 渲染每个元素的函数
)
```
*注意*: `rx.foreach` 的第二个参数必须是一个函数（可以使用 lambda），该函数接收列表中的一项作为参数。

---

## 4. 应用入口

这是连接配置、状态和页面的地方。

```python
# 1. 定义页面函数
def index() -> rx.Component:
    return rx.center(...)

# 2. 创建 App 实例
app = rx.App()

# 3. 添加页面
app.add_page(index, title="SoulPet Demo")
```

## 5. SoulPet 代码解析

### 聊天气泡逻辑 (`chat_bubble` 函数)
这是一个可复用的组件函数。
*   它接收 `is_user` (bool) 参数。
*   使用 `rx.cond` 动态改变背景色 (`background_color`) 和对齐方式 (`align_self`)，从而区分用户（右侧、蓝色）和 AI（左侧、灰色）的消息。

### 列表渲染逻辑
```python
rx.foreach(
    State.chat_history,
    lambda messages: rx.vstack( # messages 是 (question, answer) 元组
        chat_bubble(messages[0], True),  #这行渲染用户提问
        chat_bubble(messages[1], False), #这行渲染AI回答
        ...
    )
)
```
这里利用 `rx.foreach` 自动根据 `chat_history` 列表长度生成对应数量的聊天气泡对。

### 表单提交
```python
rx.form(
    ...,
    on_submit=State.answer, # 绑定提交事件到 State.answer 方法
    reset_on_submit=True,   # 提交后自动清空输入框
)
```
此处实现了无需手动编写 JS 即可完成表单数据收集和提交后清空的逻辑。
