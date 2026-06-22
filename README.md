# 阀门角度检测系统

基于 React + TypeScript + Vite 构建的响应式前端应用，对接 FastAPI 后端，提供阀门角度预测的完整可视化交互能力。支持单张/批量/视频三种预测模式、移动端相机拍摄（含蒙版叠加）、API 配置与健康状态监控。

## 功能特性

### 三大预测模式

| 模式 | 接口 | 说明 |
|------|------|------|
| 单张预测 | `POST /predict` | 上传单张图片，支持 `return_image` / `smart_crop` / `multi_scale` 全参数，SVG 角度仪表盘可视化，标注图下载 |
| 批量预测 | `POST /predict/batch` | 多文件上传 + zip 压缩包自动解压，汇总统计（成功/失败/总耗时），结果导出 CSV/JSON |
| 视频预测 | `POST /predict/video` | `fps` / `frame_interval` 二选一抽帧，Recharts 角度-时间曲线，统计卡片（平均/最大/最小角度），可折叠帧数据表 |

### 移动端相机拍摄

- 调用 `getUserMedia` 访问设备摄像头，支持前后摄切换
- 8 种拍摄蒙版可选叠加（圆形阀门上/侧视图、红绿×3、红黄×3），透明度与缩放可调
- 点击画面手动对焦（兼容性降级）
- 拍摄后一键跳转单张预测页预填文件

### API 配置与监控

- UI 可修改 API Base URL（默认 `http://localhost:8000`），持久化到 `localStorage`
- 测试连接功能，15 秒轮询 `/health` 实时显示服务状态徽标
- 展示 `/info` 返回的模型信息（架构、权重路径、输入尺寸、设备等）与服务端默认配置

### 响应式设计

- 桌面端：顶部导航栏 + 大屏双栏布局
- 移动端：底部 Tab Bar + 单栏堆叠，表格自动转卡片列表
- 适配 375px（iPhone SE）至 1440px+ 全尺寸屏幕
- 触控目标 ≥ 44×44px，加载态/错误态/空状态完整覆盖

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript 5 |
| 构建 | Vite 5 |
| 样式 | Tailwind CSS 3 |
| 路由 | React Router v6 |
| HTTP | 原生 `fetch` 封装（支持 FormData / AbortController 超时） |
| 图表 | Recharts 2 |
| 图标 | lucide-react |
| 压缩包 | JSZip |
| 状态管理 | React Context + Hooks |

## 项目结构

```
Valve_Tool/
├── docs/                           # API 文档与蒙版源资源
│   ├── API文档.md
│   └── 蒙板/
├── public/
│   ├── favicon.svg
│   └── masks/                      # 8 个拍摄蒙版（PNG）
├── src/
│   ├── api/                        # API 客户端与端点函数
│   │   ├── client.ts
│   │   └── endpoints.ts
│   ├── components/
│   │   ├── camera/                 # 相机预览、蒙版选择与叠加
│   │   ├── layout/                 # AppShell、HealthBadge
│   │   ├── predict/                # AngleGauge、ParamPanel、ResultImage、BatchResultTable
│   │   ├── ui/                     # Spinner、Toggle、FileDropzone
│   │   └── video/                  # FrameModeSelector、VideoAngleChart
│   ├── context/
│   │   └── ApiConfigContext.tsx    # 全局 API 配置与健康状态
│   ├── data/
│   │   └── masks.ts                # 蒙版元数据
│   ├── hooks/
│   │   └── useCamera.ts            # 相机访问封装
│   ├── pages/                      # 5 个路由页面
│   │   ├── SinglePredict.tsx
│   │   ├── BatchPredict.tsx
│   │   ├── VideoPredict.tsx
│   │   ├── CameraCapture.tsx
│   │   └── Settings.tsx
│   ├── types/
│   │   └── api.ts                  # 所有 API 请求/响应类型 + ApiError
│   ├── utils/                      # format / download / file 工具
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 快速开始

### 环境要求

- Node.js ≥ 18
- npm ≥ 9（或 pnpm / yarn）
- 后端服务运行在 `http://localhost:8000`（参考 `docs/API文档.md`）

### 安装与运行

```bash
# 安装依赖
npm install

# 开发模式（默认 http://localhost:5173）
npm run dev

# 类型检查
npm run typecheck

# 生产构建（输出到 dist/）
npm run build

# 预览构建产物
npm run preview
```

### 环境变量

复制 `.env.example` 为 `.env.local` 并按需修改：

```bash
VITE_API_BASE_URL=http://localhost:8000
```

也可在应用内「设置」页直接修改 API 地址，无需重启。

## 使用指南

### 单张预测

1. 进入「单张」页面
2. 点击或拖拽上传阀门图片（支持 jpg/jpeg/png/bmp）
3. 在「预测参数」面板调整选项：
   - **返回标注图片**：响应中包含 base64 标注图
   - **智能裁剪**：远距离拍摄自动定位放大阀门区域
   - **多尺度推理**：结合原图和裁剪图预测，精度更高（优先级高于智能裁剪）
4. 点击「开始预测」，查看角度仪表盘与标注图

### 批量预测

1. 进入「批量」页面
2. 上传多张图片或 `.zip` 压缩包（自动解压提取图片）
3. 点击「开始批量预测」
4. 查看汇总统计与详细结果表格，支持导出 CSV / JSON

### 视频预测

1. 进入「视频」页面
2. 上传视频文件（支持 mp4/avi/mov/mkv）
3. 选择抽帧方式：
   - **按每秒帧数 (fps)**：滑块调整 0.5~10
   - **按帧间隔 (frame_interval)**：数字输入 1~300
4. 点击「开始视频预测」，查看角度-时间曲线与统计

### 移动端拍摄

1. 在手机浏览器打开应用（需 HTTPS 或 localhost）
2. 进入「拍摄」页面
3. 选择拍摄蒙版（8 种可选，或选「无」）
4. 点击「启动相机」，授予相机权限
5. 调整蒙版透明度/缩放，点击画面可对焦
6. 点击拍摄按钮 → 预览 → 「用此图预测」自动跳转单张预测页

### 设置

- 修改 API Base URL → 点击「测试」验证连接 → 「保存」
- 查看模型信息与服务端默认配置
- 顶部/底部状态徽标实时反映服务健康状态

## API 接口对照

| 前端功能 | 后端接口 | 方法 |
|----------|----------|------|
| 单张预测 | `/predict` | POST |
| 批量预测 | `/predict/batch` | POST |
| 视频抽帧 | `/predict/video` | POST |
| 健康检查 | `/health` | GET |
| 模型信息 | `/info` | GET |

详细参数与响应格式参见 [docs/API文档.md](docs/API文档.md)。

## Git 版本管理

### 分支策略

- `main`：稳定发布分支
- `dev`：开发集成分支
- `feature/*`：功能分支（如 `feature/scaffold`、`feature/camera`）

### 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

- `feat:` 新功能
- `fix:` 修复
- `chore:` 构建/配置
- `docs:` 文档
- `refactor:` 重构
- `style:` 样式

### 版本标签

- `v1.0.0`：首个正式版本

## 浏览器兼容性

- Chrome / Edge ≥ 90
- Firefox ≥ 88
- Safari ≥ 14
- 移动端 iOS Safari ≥ 14、Android Chrome ≥ 90
- 相机功能需 HTTPS 环境（localhost 除外）

## 许可证

私有项目，未发布开源许可证。
