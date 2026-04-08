# GitHub导出和跨账号使用指南

## 📤 导出到GitHub

### 步骤1：在Manus Management UI中导出

1. 打开项目的Management UI（右侧面板）
2. 点击"More"菜单（⋯）
3. 选择"GitHub"选项
4. 填写GitHub仓库信息：
   - **Owner**：你的GitHub用户名或组织名
   - **Repository Name**：例如 `competitive-analysis`
   - **Branch**：main（默认）

5. 点击"Export"按钮

### 步骤2：授权GitHub

- 首次导出时需要授权Manus访问你的GitHub账号
- 按照提示完成OAuth授权流程
- 授权后自动创建新的仓库或更新现有仓库

---

## 🔄 在新账号中继续使用

### 方案A：从GitHub克隆（推荐）

```bash
# 1. 克隆仓库
git clone https://github.com/YOUR_USERNAME/competitive-analysis.git
cd competitive-analysis

# 2. 安装依赖
pnpm install

# 3. 本地开发
pnpm dev

# 4. 构建
pnpm build
```

### 方案B：在新Manus账号中导入

1. 用新账号登录Manus
2. 创建新项目时，选择"从GitHub导入"
3. 输入仓库URL：`https://github.com/YOUR_USERNAME/competitive-analysis`
4. 等待导入完成

---

## 💾 保留数据的方式

### 方式1：导出编辑后的数据

在编辑面板中修改数据后，可以：

1. **导出CSV**：点击分析工具中的"导出CSV表格"
2. **保存JSON**：在浏览器控制台执行：
   ```javascript
   const data = localStorage.getItem('ca-report-data-v1');
   console.log(data);
   // 复制输出的JSON到文本文件保存
   ```

### 方式2：更新代码中的数据

将修改后的数据保存到 `client/src/lib/data.ts`：

```typescript
// 在 client/src/lib/data.ts 中修改
export const companies = {
  leadong: {
    name: "领动",
    product: "臻选版",
    price: 198000,  // 修改为销售底价
    positioning: "...",
    color: COLORS.leadong,
  },
  // ...
};
```

---

## 🔐 跨设备同步

### 方式1：GitHub同步（推荐）

```bash
# 在新设备上
git clone https://github.com/YOUR_USERNAME/competitive-analysis.git
cd competitive-analysis
pnpm install
pnpm dev
```

### 方式2：云存储同步

1. 将 `client/src/lib/data.ts` 上传到云盘（Google Drive、OneDrive等）
2. 在新设备上下载并替换该文件
3. 重新运行 `pnpm dev`

### 方式3：手动导出/导入

1. **导出**：
   ```bash
   # 在原设备上
   git push origin main
   ```

2. **导入**：
   ```bash
   # 在新设备上
   git clone <repo-url>
   git pull origin main
   ```

---

## 🎯 最佳实践

### 保存检查点
- 每次重要修改后，在Manus中创建检查点
- 在GitHub中提交commit
  ```bash
  git add .
  git commit -m "Update competitive analysis data"
  git push origin main
  ```

### 版本管理
- 使用Git分支管理不同的分析版本
  ```bash
  git checkout -b analysis-v2
  # 做修改...
  git push origin analysis-v2
  ```

### 数据备份
- 定期导出CSV数据备份
- 保存重要的修改记录到"补充备注"中

---

## 🚀 在新Manus账号中部署

1. 在新账号中创建项目：选择"从GitHub导入"
2. 输入仓库URL
3. 等待构建完成
4. 点击"Publish"发布
5. 获得新的域名和URL

---

## 📋 检查清单

- [ ] 代码已导出到GitHub
- [ ] README和文档已更新
- [ ] 修改后的数据已保存到 `client/src/lib/data.ts`
- [ ] 本地测试通过 (`pnpm dev` 和 `pnpm build`)
- [ ] Git commit已提交
- [ ] 在新账号中成功克隆/导入
- [ ] 本地开发环境正常运行

---

## 📞 常见问题

**Q: 如何保证数据不丢失？**
A: 
1. 定期提交到GitHub
2. 导出CSV备份
3. 使用Manus的检查点功能

**Q: 能否在多个设备上同时编辑？**
A: 可以，但建议使用Git来管理版本冲突。

**Q: localStorage中的数据如何迁移？**
A: 
1. 导出JSON：`localStorage.getItem('ca-report-data-v1')`
2. 在新设备上导入：`localStorage.setItem('ca-report-data-v1', jsonData)`

**Q: 如何重置所有修改？**
A: 
1. 编辑面板中点击"重置为原始数据"
2. 或删除localStorage：`localStorage.removeItem('ca-report-data-v1')`

---

**创建时间**：2026年4月8日  
**适用版本**：1.0.0+
