# 外贸营销型网站运营服务竞品分析报告

## 📋 项目概述

这是一个**交互式竞品分析工具**，用于对比分析外贸营销服务方案。包含：

- **8大维度、46项指标**的全方位对比
- **实时数据编辑面板** — 修改价格、指标、评分后图表自动更新
- **localStorage持久化** — 修改数据不丢失，刷新页面自动恢复
- **可复用分析工具** — 自定义维度、评分、CSV导出
- **补充备注功能** — 记录文档中没有体现的内部信息（销售底价、赠送服务等）

---

## 🚀 快速开始

### 本地开发

```bash
cd /home/ubuntu/competitive-analysis
pnpm install
pnpm dev
```

访问 `http://localhost:3000`

### 生产构建

```bash
pnpm build
pnpm start
```

---

## 📊 核心功能

### 1. 数据编辑面板
- **位置**：导航栏"编辑数据"按钮 或 右下角浮动编钮
- **6个标签页**：
  - 基本信息 & 价格 — 修改产品名称、年度服务费、定位
  - 核心指标 — 编辑关键数据对比
  - 雷达图评分 — 调整各维度评分（0-100）
  - 对比详情 — 编辑8大维度的具体对比项
  - SWOT分析 — 修改优势、劣势、机会、威胁
  - 补充备注 — 添加销售底价、赠送服务等内部信息

### 2. 实时图表更新
- 修改价格后，概览区域的价格标签实时更新
- 调整指标后，条形图实时更新
- 修改雷达图评分后，雷达图实时更新
- 所有修改自动保存到浏览器localStorage

### 3. 可复用分析工具
- 自定义维度名称和评分
- 支持添加/删除维度
- 一键导出CSV表格（可用Excel打开）

### 4. 补充备注
- 记录方案文档中没有体现的信息
- 分类：通用备注、价格相关、服务相关、SEO相关、AI能力相关、其他
- 支持时间戳和删除功能

---

## 📁 项目结构

```
client/
├── src/
│   ├── pages/
│   │   └── Home.tsx              # 主页面
│   ├── components/
│   │   ├── HeroSection.tsx        # Hero区域
│   │   ├── OverviewSection.tsx    # 核心指标概览
│   │   ├── RadarSection.tsx       # 雷达图
│   │   ├── ComparisonSection.tsx  # 详细对比
│   │   ├── SwotSection.tsx        # SWOT分析
│   │   ├── RecommendationsSection.tsx  # 策略建议
│   │   ├── AnalysisToolSection.tsx     # 可复用分析工具
│   │   ├── EditPanel.tsx          # 数据编辑面板
│   │   ├── EditButton.tsx         # 编辑按钮
│   │   ├── NavBar.tsx             # 导航栏
│   │   └── Footer.tsx             # 页脚
│   ├── contexts/
│   │   └── DataContext.tsx        # 全局数据状态管理
│   ├── hooks/
│   │   └── useScrollAnimation.ts  # 滚动动画Hook
│   ├── lib/
│   │   └── data.ts                # 竞品分析数据
│   ├── index.css                  # 全局样式（商业杂志风格）
│   └── App.tsx                    # 应用入口
├── index.html
└── package.json
```

---

## 🎨 设计风格

**商业洞察杂志风格**
- **配色**：温暖米白色基底（#F8F5F0），领动琥珀橙（#D4782A），全球搜钢蓝（#2980B9）
- **字体**：Playfair Display + Noto Serif SC（标题），Source Sans 3 + Noto Sans SC（正文）
- **布局**：长页面滚动，杂志式编辑排版
- **动画**：滚动触发、实时更新动画

---

## 💾 数据持久化

所有修改自动保存到 `localStorage` 中的 `ca-report-data-v1` 键。

**重置数据**：
- 点击编辑面板顶部的"重置为原始数据"按钮
- 或手动删除localStorage中的 `ca-report-data-v1` 键

---

## 🔧 修改数据的方式

### 方式1：编辑面板（推荐）
1. 点击导航栏"编辑数据"或右下角浮动按钮
2. 选择对应标签页
3. 修改数据，图表自动更新

### 方式2：直接编辑代码
编辑 `client/src/lib/data.ts` 中的数据结构：
- `companies` — 公司基本信息
- `keyMetrics` — 关键指标
- `radarData` — 雷达图数据
- `comparisonData` — 对比详情
- `swotData` — SWOT分析
- `recommendations` — 策略建议

---

## 📈 添加新的竞品

1. 在 `client/src/lib/data.ts` 中修改 `companies` 对象
2. 更新 `keyMetrics`、`radarData`、`comparisonData` 等数据结构
3. 所有图表和分析会自动适配

---

## 🚢 部署

项目已部署在Manus平台：
- **URL**：https://companalysis-p22angwk.manus.space
- **发布**：在Management UI中点击"Publish"按钮

---

## 📝 常见问题

**Q: 修改数据后刷新页面会丢失吗？**
A: 不会。所有修改自动保存到localStorage，刷新页面数据保留。

**Q: 可以导出为PDF吗？**
A: 目前支持导出CSV表格。PDF导出可通过浏览器打印功能实现。

**Q: 可以添加更多竞品吗？**
A: 可以。编辑 `client/src/lib/data.ts` 中的数据结构，或通过编辑面板修改。

**Q: 数据在哪里存储？**
A: 存储在浏览器的localStorage中。不同浏览器/设备的数据独立。

---

## 🔐 技术栈

- **框架**：React 19 + TypeScript
- **路由**：Wouter
- **样式**：Tailwind CSS 4 + 自定义CSS
- **图表**：Recharts
- **UI组件**：shadcn/ui
- **动画**：Framer Motion
- **状态管理**：React Context API

---

## 📞 支持

如有问题或建议，请在编辑面板的"补充备注"功分记录。

---

**最后更新**：2026年4月8日  
**版本**：1.0.0 (5b7a1db7)
