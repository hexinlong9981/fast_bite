# 鑫龙外卖 - 小程序端

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-uni%E2%80%93app-green.svg)
![Language](https://img.shields.io/badge/language-Vue.js-brightgreen.svg)

这是一个基于 `uni-app` 开发的鑫龙外卖微信小程序项目，实现了完整的外卖点餐流程。

## 技术栈

- **框架**: uni-app
- **语言**: Vue.js
- **状态管理**: Vuex
- **网络通信**: WebSocket
- **UI组件库**: uni-ui
- **构建工具**: HBuilderX

## 主要功能

### 用户功能

- 微信授权登录
- 扫描桌台二维码点餐
- 实时同步多人购物车（WebSocket）
- 菜品分类展示与搜索
- 菜品详情查看
- 多规格选择（如辣度、口味等）
- 购物车管理（添加、删除、清空）
- 下单与支付流程
- 订单状态跟踪
- 历史订单查看
- 个人中心
- 地址管理
- 订单备注

### 商家功能

- 实时订单接收
- 订单状态更新
- 菜品管理
- 营业状态设置

## 项目结构

```
rjwm-weixin-uniapp-develop-wsy/
├── components/           # 公共组件
├── design/              # 设计图和截图
├── pages/               # 页面文件
│   ├── index/           # 首页
│   ├── order/           # 订单页面
│   ├── details/         # 订单详情
│   ├── pay/             # 支付页面
│   ├── success/         # 支付成功页面
│   ├── my/              # 个人中心
│   ├── address/         # 地址管理
│   ├── addOrEditAddress/# 新增/编辑地址
│   ├── historyOrder/    # 历史订单
│   ├── remark/          # 订单备注
│   ├── nonet/           # 无网络页面
│   └── common/          # 公共页面组件
├── static/              # 静态资源
├── store/               # Vuex状态管理
├── utils/               # 工具函数
├── styles/              # 全局样式
├── uni_modules/         # uni-ui组件
└── App.vue             # 根组件
```

## 运行项目

### 环境准备

1. 安装 [HBuilderX](https://www.dcloud.io/hbuilderx.html)
2. 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

### 导入项目

1. 在 HBuilderX 中，通过 `文件 -> 导入 -> 从本地目录导入` 选择本项目。

### 配置

1. 在 `manifest.json` 文件中，配置您自己的微信小程序 AppID。
2. 修改 `utils/request.js` 中的 `baseUrl` 为您的后端服务地址。
3. 检查并更新 `pages/index/index.js` 中的测试参数（如 shopId、storeId、tableId）。

### 运行

1. 在 HBuilderX 的菜单栏中，点击 `运行 -> 运行到小程序模拟器 -> 微信开发者工具`。
2. 确保微信开发者工具的 "设置 -> 安全设置" 中的服务端口已开启。

## 安全注意事项

1. 项目中包含测试用的硬编码参数，请在生产环境中替换为动态获取的值：

   - `shopId`: "f3deb"
   - `storeId`: "1282344676983062530"
   - `tableId`: "1282346960773238786"
2. 确保后端API地址配置正确，不要在代码中硬编码生产环境的敏感信息。

## 部署说明

1. 使用 HBuilderX 构建项目
2. 在微信开发者工具中上传代码
3. 在微信公众平台提交审核

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

## 许可证

[MIT](LICENSE)

## 联系方式

如有问题，请提交 Issue 或联系项目维护者。
