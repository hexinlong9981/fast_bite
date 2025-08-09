# 鑫龙外卖 - 管理后台

这是一个基于 `Vue 3`, `TypeScript` 和 `Element Plus` 的鑫龙外卖管理后台项目。

## 技术栈

- Vue 3
- TypeScript
- Vue Router
- Pinia
- Element Plus
- Axios
- ECharts

## 功能

- 登录/登出
- Dashboard 数据统计
- 员工管理
- 分类管理
- 菜品管理
- 套餐管理
- 订单管理

## 运行项目

1.  **环境准备**
    *   安装 [Node.js](https://nodejs.org/) (>=16.0.0)
    *   安装 [pnpm](https://pnpm.io/) (推荐)

2.  **安装依赖**
    ```bash
    pnpm install
    ```

3.  **运行开发环境**
    ```bash
    pnpm dev
    ```
    项目将在 `http://localhost:3000` 启动。

4.  **编译打包**
    ```bash
    pnpm build
    ```

## 环境变量

项目包含多个环境配置文件：

-   `.env.development`: 开发环境
-   `.env.production`: 生产环境
-   `.env.staging`: Staging 环境
