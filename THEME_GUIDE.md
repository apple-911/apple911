# 协和绿主题配置文档

## 主题色值

### 核心色值

| 名称 | HEX | RGB | 说明 |
|------|-----|-----|------|
| 核心协和绿 | `#045126` | `RGB(4, 81, 38)` | 主色调，用于按钮、链接、选中状态 |
| 深色版 | `#003d0a` | `RGB(0, 61, 10)` | Hover/Pressed 状态 |
| 浅色版 | `#57826a` | `RGB(87, 130, 106)` | 辅助背景、禁用状态 |
| 极浅版 | `#e8f0ec` | `RGB(232, 240, 236)` | 卡片背景、选中背景 |

### 完整色阶

| 色阶 | HEX | RGB | 使用场景 |
|------|-----|-----|----------|
| 50 | `#f2f7f4` | `RGB(242, 247, 244)` | 最浅背景 |
| 100 | `#e8f0ec` | `RGB(232, 240, 236)` | 极浅背景 |
| 200 | `#d1e1d9` | `RGB(209, 225, 217)` | 很浅背景 |
| 300 | `#a9c8b6` | `RGB(169, 200, 182)` | 浅色背景 |
| 400 | `#7ba890` | `RGB(123, 168, 144)` | 中浅背景 |
| 500 | `#57826a` | `RGB(87, 130, 106)` | 中等亮度 |
| 600 | `#3d6650` | `RGB(61, 102, 80)` | 中深色调 |
| 700 | `#045126` | `RGB(4, 81, 38)` | **主色调** |
| 800 | `#003d0a` | `RGB(0, 61, 10)` | 深色调 |
| 900 | `#002a07` | `RGB(0, 42, 7)` | 最深色调 |

## CSS 变量

### 使用方法

```css
.element {
  color: var(--xiehe-green);
  background-color: var(--xiehe-green-bg);
  border-color: var(--border-primary);
}
```

### 变量列表

```css
:root {
  /* 主题色 */
  --xiehe-green: #045126;
  --xiehe-green-dark: #003d0a;
  --xiehe-green-light: #57826a;
  --xiehe-green-bg: #e8f0ec;
  
  /* 色阶变量 */
  --primary-50: #f2f7f4;
  --primary-100: #e8f0ec;
  --primary-200: #d1e1d9;
  --primary-300: #a9c8b6;
  --primary-400: #7ba890;
  --primary-500: #57826a;
  --primary-600: #3d6650;
  --primary-700: #045126;
  --primary-800: #003d0a;
  --primary-900: #002a07;
  
  /* 语义色 */
  --success-color: #52c41a;
  --warning-color: #faad14;
  --error-color: #ff4d4f;
  --info-color: #1890ff;
  
  /* 背景色 */
  --bg-default: #f0f2f5;
  --bg-paper: #ffffff;
  --bg-active: #e8f0ec;
  --bg-hover: #f5f5f5;
  --bg-selected: #e8f0ec;
  
  /* 文本色 */
  --text-primary: rgba(0, 0, 0, 0.85);
  --text-secondary: rgba(0, 0, 0, 0.65);
  --text-disabled: rgba(0, 0, 0, 0.25);
  --text-light: #ffffff;
  --text-link: #045126;
  
  /* 边框色 */
  --border-default: #d9d9d9;
  --border-light: #f0f0f0;
  --border-dark: #bfbfbf;
  --border-primary: #045126;
}
```

## TypeScript 主题对象

```typescript
import { theme } from './styles/theme'

// 使用示例
const backgroundColor = theme.colors.primary.main
const hoverColor = theme.colors.primary.dark
const lightBg = theme.colors.primary.bg
```

### 主题结构

```typescript
theme: {
  colors: {
    primary: {
      main: '#045126',
      dark: '#003d0a',
      light: '#57826a',
      bg: '#e8f0ec',
      50-900: '...'
    },
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff4d4f',
    info: '#1890ff',
    neutral: { ... },
    background: { ... },
    text: { ... },
    border: { ... }
  },
  shadows: { ... },
  borderRadius: { ... },
  spacing: { ... }
}
```

## Ant Design 主题配置

### 使用方法

已在 `src/main.tsx` 中全局配置:

```tsx
import { ConfigProvider } from 'antd'
import { antdTheme } from './styles/antdTheme'

<ConfigProvider locale={zhCN} theme={antdTheme}>
  <App />
</ConfigProvider>
```

### 主要配置项

```typescript
export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#045126',
    borderRadius: 6,
  },
  components: {
    Layout: { ... },
    Menu: { ... },
    Button: { ... },
    Card: { ... },
    Table: { ... },
    // ... 更多组件配置
  }
}
```

## 使用场景

### 1. 主按钮

```tsx
import { Button } from 'antd'

// 自动使用协和绿主题
<Button type="primary">主要按钮</Button>

// 或手动指定
<Button style={{ background: 'var(--xiehe-green)' }}>
  自定义按钮
</Button>
```

### 2. 导航菜单

```tsx
<Menu
  selectedKeys={['current']}
  style={{ background: 'transparent' }}
/>
// 选中项自动使用协和绿
```

### 3. 卡片背景

```tsx
<Card 
  style={{ 
    background: 'var(--bg-paper)',
    border: '1px solid var(--border-light)'
  }}
/>
```

### 4. 渐变背景

```tsx
<div 
  style={{ 
    background: 'linear-gradient(to right, var(--xiehe-green), var(--xiehe-green-light))'
  }}
/>
```

### 5. 标签和徽章

```tsx
<Tag color="green" style={{ background: 'var(--primary-100)', color: 'var(--xiehe-green)' }}>
  标签
</Tag>

<Badge 
  count={5} 
  style={{ background: 'var(--xiehe-green)' }}
/>
```

## 响应式设计

### 移动端优化

```css
@media (max-width: 768px) {
  body {
    font-size: 13px;
  }
}
```

### 安全区域

```css
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

## 暗色模式支持 (未来扩展)

```css
@media (prefers-color-scheme: dark) {
  :root {
    --xiehe-green: #57826a;
    --xiehe-green-dark: #045126;
    --xiehe-green-light: #7ba890;
    --bg-default: #141414;
    --bg-paper: #1f1f1f;
  }
}
```

## 文件结构

```
src/
├── styles/
│   ├── index.ts              # 统一导出
│   ├── theme.ts              # TypeScript 主题对象
│   ├── globalVars.ts         # CSS 变量定义
│   ├── global.css.ts         # 全局样式
│   └── antdTheme.ts          # Ant Design 主题配置
├── main.tsx                  # 应用主题配置
└── layouts/
    ├── MainLayout.tsx        # 主布局 (已应用主题)
    └── BlankLayout.tsx       # 空白布局
```

## 最佳实践

### ✅ 推荐做法

1. **优先使用 CSS 变量**
   ```tsx
   style={{ background: 'var(--xiehe-green)' }}
   ```

2. **使用 Ant Design 组件**
   ```tsx
   <Button type="primary" /> // 自动使用主题色
   ```

3. **使用 TypeScript 主题对象**
   ```tsx
   import { theme } from './styles'
   background: theme.colors.primary.main
   ```

### ❌ 避免做法

1. **硬编码色值**
   ```tsx
   // ❌ 不推荐
   style={{ background: '#045126' }}
   
   // ✅ 推荐
   style={{ background: 'var(--xiehe-green)' }}
   ```

2. **使用内联样式覆盖主题**
   ```tsx
   // ❌ 不推荐
   <Button style={{ background: 'blue' }} />
   
   // ✅ 推荐
   <Button type="primary" />
   ```

## 主题扩展

### 添加新色阶

在 `src/styles/theme.ts` 中添加:

```typescript
primary: {
  // ... 现有色阶
  950: '#001a05', // 新增超深色调
}
```

### 添加新组件配置

在 `src/styles/antdTheme.ts` 中添加:

```typescript
components: {
  // ... 现有组件
  NewComponent: {
    // 组件特定配置
  }
}
```

## 测试清单

- [x] 主按钮使用协和绿
- [x] 导航菜单选中项使用协和绿
- [x] 表格表头使用浅绿背景
- [x] 表单组件焦点态使用协和绿
- [x] 标签页激活态使用协和绿
- [x] 分页激活态使用协和绿
- [x] 移动端底部导航栏
- [x] 卡片背景色
- [x] 渐变背景

## 相关文档

- [Ant Design 主题配置](https://ant.design/docs/react/customize-theme-cn)
- [CSS 变量使用指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties)
- [Tailwind CSS 自定义主题](https://tailwindcss.com/docs/customizing-colors)

---

**更新日期**: 2024-01-XX  
**版本**: v1.0  
**维护者**: MDT 开发团队
