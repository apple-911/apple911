/**
 * 全局样式变量 - 协和绿主题
 * 
 * 核心色值:
 * - 核心协和绿：#045126 (RGB: 4, 81, 38)
 * - 深色版（Hover/Pressed）: #003d0a (RGB: 0, 61, 10)
 * - 浅色版（背景/禁用）: #57826a (RGB: 87, 130, 106)
 * - 极浅版（卡片背景）: #e8f0ec (RGB: 232, 240, 236)
 */

export const theme = {
  colors: {
    // 主色调 - 协和绿
    primary: {
      main: '#045126',        // 核心协和绿
      dark: '#003d0a',        // 深色版（Hover/Pressed）
      light: '#57826a',       // 浅色版（背景/禁用）
      bg: '#e8f0ec',          // 极浅版（卡片背景）
      50: '#f2f7f4',          // 最浅
      100: '#e8f0ec',         // 极浅
      200: '#d1e1d9',         // 很浅
      300: '#a9c8b6',         // 浅
      400: '#7ba890',         // 中浅
      500: '#57826a',         // 中
      600: '#3d6650',         // 中深
      700: '#045126',         // 深 (主色)
      800: '#003d0a',         // 很深
      900: '#002a07',         // 最深
    },
    
    // 语义色
    success: '#52c41a',
    warning: '#faad14',
    error: '#ff4d4f',
    info: '#1890ff',
    
    // 中性色
    neutral: {
      white: '#ffffff',
      gray50: '#fafafa',
      gray100: '#f5f5f5',
      gray200: '#f0f0f0',
      gray300: '#d9d9d9',
      gray400: '#bfbfbf',
      gray500: '#8c8c8c',
      gray600: '#595959',
      gray700: '#434343',
      gray800: '#262626',
      gray900: '#141414',
      black: '#000000',
    },
    
    // 背景色
    background: {
      default: '#f0f2f5',
      paper: '#ffffff',
      active: '#e8f0ec',
      hover: '#f5f5f5',
      selected: '#e8f0ec',
    },
    
    // 文本色
    text: {
      primary: 'rgba(0, 0, 0, 0.85)',
      secondary: 'rgba(0, 0, 0, 0.65)',
      disabled: 'rgba(0, 0, 0, 0.25)',
      light: '#ffffff',
      link: '#045126',
    },
    
    // 边框色
    border: {
      default: '#d9d9d9',
      light: '#f0f0f0',
      dark: '#bfbfbf',
      primary: '#045126',
    },
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '9999px',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
}

export type Theme = typeof theme
