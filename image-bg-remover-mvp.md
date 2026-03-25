# Background Remover - 产品需求文档 v1.1

## 产品概述

一个简洁、快速、免费的在线图片背景移除工具，部署于 Cloudflare Pages。

### 目标用户
- 设计师：快速处理设计素材
- 电商卖家：处理产品商品图
- 社交媒体运营：制作内容素材
- 普通用户：证件照、头像处理

### 核心价值
- **免费使用** - 无需付费即可使用基础功能
- **无需注册** - 上传即用，零门槛
- **秒级处理** - 快速获得结果
- **移动端友好** - 随时随地使用
- **隐私安全** - 图片内存处理，不落盘不存储

### 商业模式（未来）
- 免费额度：每日 X 张
- 付费订阅：无限处理 + 批量功能
- API 开放：开发者接入

---

## 功能需求

### P0 - MVP 必须

| 功能 | 描述 | 验收标准 |
|------|------|----------|
| 图片上传 | 拖拽或点击上传 | 支持 JPG/PNG/WebP，最大 10MB |
| 背景移除 | 调用 remove.bg API | 3 秒内返回结果（取决于网络） |
| 结果预览 | 原图 vs 结果图对比 | 并排展示 |
| 下载结果 | 一键下载透明 PNG | 文件名：原文件名_nobg.png |
| 响应式设计 | 移动端完美适配 | 375px - 1440px 均正常使用 |
| 加载状态 | 上传/处理中显示进度 | 动画 + 文字提示 |
| 错误处理 | 友好的错误提示 | 文件过大、格式不支持、处理失败等 |

### P1 - 迭代优化
- 替换背景色（纯色背景）
- 替换背景图（预设背景或自定义上传）
- 批量处理（2-5 张，付费解锁更多）

### P2 - 未来考虑
- 用户账户系统
- API 开放给开发者

---

## 技术方案

### 整体架构

```
┌─────────────────────────────────────────────────────┐
│              Cloudflare Pages (静态托管)             │
│  ┌─────────────┐    ┌─────────────────────────────┐ │
│  │   前端页面   │───▶│  Cloudflare Pages Function  │ │
│  │  (HTML/JS)  │    │  (隐藏 API Key，内存处理)    │ │
│  └─────────────┘    └──────────────┬──────────────┘ │
└─────────────────────────────────────┼───────────────┘
                                      │
                                      ▼
                            ┌─────────────────┐
                            │  remove.bg API  │
                            └─────────────────┘
```

### 技术栈

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| **框架** | Next.js 14 | App Router，静态导出 |
| **样式** | Tailwind CSS | 快速开发，响应式友好 |
| **图标** | Lucide Icons | 轻量，样式统一 |
| **部署** | Cloudflare Pages | 免费额度充足，全球 CDN |
| **API** | Cloudflare Pages Functions | 隐藏 API Key，内存处理 |
| **域名** | Cloudflare | 一站式管理 |

### 为什么选 Cloudflare？

1. **完全免费** - Pages + Functions 免费额度充足
2. **全球 CDN** - 边缘节点，速度快
3. **一站式管理** - 域名 + DNS + 托管全在 Cloudflare
4. **安全** - 免费 SSL，防护完善

### 图片处理方案

- **不落盘** - 图片在内存中处理
- **不存储** - 处理完成立即销毁
- **流式传输** - 直接返回处理结果

### 文件结构

```
bg-remover/
├── app/
│   ├── layout.tsx          # 全局布局
│   ├── page.tsx            # 首页
│   └── globals.css         # 全局样式
├── components/
│   ├── Uploader.tsx        # 上传组件
│   ├── ImageCompare.tsx    # 图片对比组件
│   └── Footer.tsx          # 页脚
├── functions/
│   └── api/
│       └── remove-bg.ts    # Cloudflare Pages Function
├── public/
│   ├── favicon.ico
│   └── og-image.png
├── next.config.js
├── wrangler.toml           # Cloudflare 配置
├── package.json
└── .env                    # API Key（不提交）
```

---

## 页面设计

### 首页结构

```
┌────────────────────────────────────────────────────────┐
│                     Header (简洁)                       │
│  Logo: "BG Remover"              [How it works] [FAQ]  │
├────────────────────────────────────────────────────────┤
│                                                        │
│                      Hero 区                           │
│                                                        │
│        "Remove Image Background - 100% Free"           │
│           "AI 驱动，秒级处理，无需注册"                  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │                                                  │  │
│  │         📁 拖拽图片到这里，或点击上传              │  │
│  │            支持 JPG, PNG, WebP                   │  │
│  │                                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│                   处理区（上传后显示）                   │
│                                                        │
│   ┌──────────────┐     ┌──────────────┐               │
│   │    原图      │  ▶  │    结果图     │               │
│   │              │     │  (透明背景)   │               │
│   └──────────────┘     └──────────────┘               │
│                                                        │
│              [ ⬇ 下载透明 PNG ]                        │
│              [ 🔄 处理另一张图片 ]                      │
│                                                        │
├────────────────────────────────────────────────────────┤
│                                                        │
│                   特性展示区（SEO）                     │
│                                                        │
│   ⚡ 快速处理        🎨 高质量输出       🆓 完全免费    │
│   秒级完成           边缘平滑自然        无需注册      │
│                                                        │
├────────────────────────────────────────────────────────┤
│                     Footer                             │
│        © 2024 BG Remover | Privacy | Terms            │
└────────────────────────────────────────────────────────┘
```

---

## SEO 策略

### 目标关键词

| 类型 | 关键词 | 搜索意图 |
|------|--------|----------|
| Primary | free background remover | 工具搜索 |
| Primary | remove background online | 工具搜索 |
| Long-tail | remove image background free | 免费工具 |
| Long-tail | background eraser tool | 工具搜索 |
| Long-tail | transparent background maker | 功能搜索 |

### 页面优化

```html
<!-- Title -->
<title>Free Background Remover - Remove Image Background Online</title>

<!-- Meta Description -->
<meta name="description" content="Remove image background for free. AI-powered, fast, and easy. No signup required. Download transparent PNG in seconds.">

<!-- Open Graph -->
<meta property="og:title" content="Free Background Remover - Remove Image Background Online">
<meta property="og:description" content="Remove image background for free. AI-powered, fast, and easy.">
<meta property="og:image" content="/og-image.png">
```

---

## 成本估算

### 运营成本

| 项目 | 月费用 | 说明 |
|------|--------|------|
| 托管 (Cloudflare Pages) | **$0** | 免费计划足够 MVP |
| Functions 调用 | **$0** | 免费 10 万次/月 |
| 域名 | ~$1/月 | 年付 $10-15 |
| remove.bg API | $0 起 | 免费 50 张/月，超出 $0.20/张 |
| **总计** | **~$1/月** | MVP 阶段几乎零成本 |

---

## 开发计划

### Day 1 ✅
- [x] 需求文档
- [x] 项目初始化（Next.js + Tailwind）
- [x] 基础页面布局
- [x] 上传组件开发
- [x] 图片对比组件
- [x] Cloudflare Function API

### Day 2
- [ ] 配置 remove.bg API Key
- [ ] 本地测试完整流程
- [ ] 部署到 Cloudflare Pages
- [ ] 购买域名
- [ ] DNS 配置
- [ ] 最终测试

### Day 3
- [ ] SEO 优化
- [ ] 性能优化
- [ ] 正式上线 🚀

---

## 域名建议

| 域名 | 后缀 | 预估价格 | 备注 |
|------|------|----------|------|
| quickbgremove | .com | ~$12/年 | 可用性待确认 |
| bgremover | .io | ~$40/年 | 科技感强 |
| cleanbg | .app | ~$15/年 | 适合工具类 |
| instantbgremove | .com | ~$12/年 | 可用性待确认 |

---

## 部署步骤

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 配置 API Key

```bash
# 在 Cloudflare Dashboard 设置环境变量
# 或使用 wrangler secret put REMOVEBG_API_KEY
```

### 4. 部署

```bash
npm run deploy
```

---

## 待确认事项

1. **remove.bg API Key** - 需要注册获取
2. **域名选择** - 确认可用性和预算
3. **Cloudflare 账号** - 是否已有账号？

---

## 附录

### remove.bg API 文档
https://www.remove.bg/api

### Cloudflare Pages 文档
https://developers.cloudflare.com/pages/

### Next.js 静态导出文档
https://nextjs.org/docs/app/building-your-application/deploying/static-exports
