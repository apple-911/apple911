import { ThemeConfig } from 'antd'

/**
 * Ant Design 主题配置
 * 协和绿主题
 */
export const antdTheme: ThemeConfig = {
  token: {
    // 主色 - 协和绿
    colorPrimary: '#045126',
    
    // 成功色
    colorSuccess: '#52c41a',
    
    // 警告色
    colorWarning: '#faad14',
    
    // 错误色
    colorError: '#ff4d4f',
    
    // 信息色
    colorInfo: '#1890ff',
    
    // 圆角
    borderRadius: 6,
    
    // 字体
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
      'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
      'Noto Color Emoji'`,
  },
  
  components: {
    // 布局组件
    Layout: {
      headerBg: '#ffffff',
      headerHeight: 56,
      headerPadding: '0 16px',
      siderBg: '#ffffff',
      triggerBg: '#ffffff',
      triggerColor: '#045126',
    },
    
    // 菜单组件
    Menu: {
      itemSelectedBg: '#e8f0ec',
      itemSelectedColor: '#045126',
      itemHoverBg: '#f5f5f5',
      itemColor: 'rgba(0, 0, 0, 0.85)',
      darkItemSelectedBg: '#045126',
      darkItemSelectedColor: '#ffffff',
    },
    
    // 按钮组件
    Button: {
      defaultBg: '#ffffff',
      defaultColor: 'rgba(0, 0, 0, 0.85)',
      primaryColor: '#ffffff',
      defaultHoverBg: '#ffffff',
      defaultHoverBorderColor: '#045126',
      defaultHoverColor: '#045126',
      primaryShadow: '0 2px 0 rgba(4, 81, 38, 0.2)',
    },
    
    // 卡片组件
    Card: {
      colorBorderSecondary: '#f0f0f0',
      headerBg: '#ffffff',
      headerFontSize: 16,
    },
    
    // 表格组件
    Table: {
      headerBg: '#f2f7f4',
      headerSortHoverBg: '#e8f0ec',
      rowHoverBg: '#f5f5f5',
      rowSelectedBg: '#e8f0ec',
      rowSelectedHoverBg: '#e8f0ec',
      borderColor: '#f0f0f0',
    },
    
    // 表单组件
    Input: {
      hoverBorderColor: '#57826a',
      activeBorderColor: '#045126',
    },
    
    Select: {
      hoverBorderColor: '#57826a',
      activeBorderColor: '#045126',
    },
    
    // 标签页
    Tabs: {
      itemActiveColor: '#045126',
      itemHoverColor: '#045126',
      itemSelectedColor: '#045126',
      inkBarColor: '#045126',
    },
    
    // 步骤条
    Steps: {},
    
    // 时间轴
    Timeline: {
      dotBg: '#ffffff',
      tailColor: '#f0f0f0',
    },
    
    // 徽章
    Badge: {},
    
    // 分页
    Pagination: {
      itemBg: '#ffffff',
      itemActiveBg: '#e8f0ec',
      itemActiveColor: '#045126',
    },
    
    // 单选框
    Radio: {},
    
    // 复选框
    Checkbox: {
      colorPrimary: '#045126',
      colorBorder: '#d9d9d9',
    },
    
    // 开关
    Switch: {
      colorPrimary: '#045126',
    },
    
    // 滑块
    Slider: {
      railBg: '#f5f5f5',
      trackBg: '#045126',
      trackHoverBg: '#57826a',
      handleColor: '#045126',
      handleSize: 14,
    },
    
    // 进度条
    Progress: {
      defaultColor: '#045126',
    },
    
    // 警告框
    Alert: {},
    
    // 树形控件
    Tree: {
      nodeSelectedBg: '#e8f0ec',
      nodeSelectedColor: '#045126',
    },
    
    // 日期选择器
    DatePicker: {
      hoverBorderColor: '#57826a',
      activeBorderColor: '#045126',
      cellHoverWithRangeBg: '#e8f0ec',
      cellActiveWithRangeBg: '#e8f0ec',
      cellRangeBorderColor: '#045126',
    },
    
    // 头像
    Avatar: {
      colorBgContainer: '#a9c8b6',
    },
    
    // 标签
    Tag: {
      colorBorder: '#d9d9d9',
    },
  },
}

export default antdTheme
