# Shop Mini App

一个基于 uni-app 开发的电商小程序应用，支持 H5、微信小程序等多端部署。

## 🚀 在线访问

- **H5 版本**: https://indredk.github.io/vue-app/
- **后端 API**: https://vue-app-backend-1olu.onrender.com

## 📱 功能特性

- 用户认证（登录/注册）
- 商品浏览与搜索
- 购物车管理
- 订单管理
- 地址管理
- 收藏功能
- 积分系统
- 通知系统
- 商品对比
- 个人中心

## 🛠️ 本地开发

### 安装依赖
```bash
npm install
```

### 运行 H5 版本
```bash
npm run dev:h5
```

### 运行微信小程序
```bash
npm run dev:mp-weixin
```

### 构建生产版本
```bash
# 构建 H5
npm run build:h5

# 构建微信小程序
npm run build:mp-weixin
```

## 📁 项目结构

```
src/
├── pages/           # 页面组件
│   ├── auth/       # 认证相关页面
│   ├── cart/       # 购物车
│   ├── goods/      # 商品
│   ├── order/      # 订单
│   └── ...
├── static/         # 静态资源
├── utils/          # 工具函数
│   └── api.ts      # API 接口
├── types/          # TypeScript 类型定义
├── App.vue         # 应用入口
└── main.ts         # 主入口文件
```

## 🔌 API 配置

后端 API 地址配置在 `src/config/api.ts` 文件中。

## 📦 技术栈

- **框架**: uni-app (Vue 3)
- **语言**: TypeScript
- **样式**: SCSS
- **构建工具**: Vite

## 📄 License

MIT
