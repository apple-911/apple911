/**
 * 全局样式
 * 协和绿主题
 */

import { globalStyles } from './globalVars'

export const globalCSS = `
  ${globalStyles}
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
      'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
      'Noto Color Emoji';
    font-size: 14px;
    line-height: 1.5715;
    color: var(--text-primary);
    background-color: var(--bg-default);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  /* 滚动条样式 */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: var(--gray-100);
    border-radius: var(--radius-sm);
  }
  
  ::-webkit-scrollbar-thumb {
    background: var(--gray-300);
    border-radius: var(--radius-sm);
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: var(--gray-400);
  }
  
  /* 选中文本 */
  ::selection {
    background: var(--primary-200);
    color: var(--primary-900);
  }
  
  /* 链接样式 */
  a {
    color: var(--text-link);
    text-decoration: none;
    transition: color 0.2s;
  }
  
  a:hover {
    color: var(--primary-600);
  }
  
  /* 按钮全局样式 */
  .ant-btn-primary {
    background-color: var(--xiehe-green) !important;
    border-color: var(--xiehe-green) !important;
  }
  
  .ant-btn-primary:hover {
    background-color: var(--xiehe-green-light) !important;
    border-color: var(--xiehe-green-light) !important;
  }
  
  .ant-btn-primary:active {
    background-color: var(--xiehe-green-dark) !important;
    border-color: var(--xiehe-green-dark) !important;
  }
  
  /* 菜单样式 */
  .ant-menu-light .ant-menu-item-selected {
    background-color: var(--bg-selected) !important;
  }
  
  .ant-menu-light .ant-menu-item-selected > a {
    color: var(--xiehe-green) !important;
  }
  
  .ant-menu-light .ant-menu-item-active {
    background-color: var(--bg-hover) !important;
  }
  
  /* 表格样式 */
  .ant-table-thead > tr > th {
    background-color: var(--primary-50) !important;
    color: var(--text-primary);
  }
  
  .ant-table-tbody > tr:hover > td {
    background-color: var(--bg-hover) !important;
  }
  
  .ant-table-tbody > tr.ant-table-row-selected > td {
    background-color: var(--bg-selected) !important;
  }
  
  /* 标签页样式 */
  .ant-tabs-tab-active .ant-tabs-tab-btn {
    color: var(--xiehe-green) !important;
  }
  
  .ant-tabs-ink-bar {
    background-color: var(--xiehe-green) !important;
  }
  
  /* 表单样式 */
  .ant-input:focus,
  .ant-input-focused {
    border-color: var(--xiehe-green-light) !important;
    box-shadow: 0 0 0 2px var(--primary-200) !important;
  }
  
  .ant-input:hover {
    border-color: var(--xiehe-green-light) !important;
  }
  
  .ant-select-focused .ant-select-selector {
    border-color: var(--xiehe-green-light) !important;
    box-shadow: 0 0 0 2px var(--primary-200) !important;
  }
  
  /* 卡片样式 */
  .ant-card-bordered {
    border-color: var(--border-light) !important;
  }
  
  .ant-card-hoverable:hover {
    border-color: var(--xiehe-green-light) !important;
  }
  
  /* 徽章样式 */
  .ant-badge-count {
    background-color: var(--xiehe-green) !important;
  }
  
  /* 步骤条样式 */
  .ant-steps-item-process .ant-steps-item-icon {
    background-color: var(--xiehe-green) !important;
    border-color: var(--xiehe-green) !important;
  }
  
  .ant-steps-item-process .ant-steps-item-title {
    color: var(--xiehe-green) !important;
  }
  
  /* 时间轴样式 */
  .ant-timeline-item-head-blue {
    color: var(--xiehe-green) !important;
    border-color: var(--xiehe-green) !important;
  }
  
  /* 分割线样式 */
  .ant-divider-horizontal.ant-divider-with-text {
    color: var(--text-primary);
  }
  
  /* 下拉菜单样式 */
  .ant-dropdown-menu-item-selected,
  .ant-dropdown-menu-submenu-title-selected {
    background-color: var(--bg-selected) !important;
  }
  
  .ant-dropdown-menu-item-selected > a,
  .ant-dropdown-menu-submenu-title-selected > a {
    color: var(--xiehe-green) !important;
  }
  
  /* 分页样式 */
  .ant-pagination-item-active {
    border-color: var(--xiehe-green) !important;
  }
  
  .ant-pagination-item-active a {
    color: var(--xiehe-green) !important;
  }
  
  .ant-pagination-item:hover {
    border-color: var(--xiehe-green-light) !important;
  }
  
  .ant-pagination-item:hover a {
    color: var(--xiehe-green-light) !important;
  }
  
  /* 单选框和复选框 */
  .ant-radio-checked .ant-radio-inner {
    border-color: var(--xiehe-green) !important;
  }
  
  .ant-radio-checked .ant-radio-inner::after {
    background-color: var(--xiehe-green) !important;
  }
  
  .ant-checkbox-checked .ant-checkbox-inner {
    background-color: var(--xiehe-green) !important;
    border-color: var(--xiehe-green) !important;
  }
  
  .ant-checkbox-checked .ant-checkbox-inner::after {
    border-color: var(--white) !important;
  }
  
  /* 开关 */
  .ant-switch-checked {
    background-color: var(--xiehe-green) !important;
  }
  
  /* 滑块 */
  .ant-slider-track {
    background-color: var(--xiehe-green) !important;
  }
  
  .ant-slider-handle:focus {
    border-color: var(--xiehe-green) !important;
  }
  
  .ant-slider-handle:active {
    box-shadow: 0 0 0 2px var(--primary-200) !important;
  }
  
  /* 进度条 */
  .ant-progress-circle-path {
    stroke: var(--xiehe-green) !important;
  }
  
  .ant-progress-bg {
    background-color: var(--xiehe-green) !important;
  }
  
  /* 警告框 */
  .ant-alert-success {
    background-color: var(--primary-50) !important;
    border: 1px solid var(--primary-300) !important;
  }
  
  .ant-alert-success .ant-alert-icon {
    color: var(--xiehe-green) !important;
  }
  
  /* 树形控件 */
  .ant-tree-treenode-selected {
    background-color: var(--bg-selected) !important;
  }
  
  .ant-tree-node-selected {
    color: var(--xiehe-green) !important;
  }
  
  /* 树形选择器 */
  .ant-tree-select-dropdown .ant-tree-node-selected {
    color: var(--xiehe-green) !important;
  }
  
  /* 日期选择器 */
  .ant-picker-cell-selected .ant-picker-cell-inner {
    background-color: var(--xiehe-green) !important;
  }
  
  .ant-picker-cell-in-view.ant-picker-cell-range-start .ant-picker-cell-inner,
  .ant-picker-cell-in-view.ant-picker-cell-range-end .ant-picker-cell-inner {
    background-color: var(--xiehe-green) !important;
  }
  
  .ant-picker-cell-in-view.ant-picker-cell-today .ant-picker-cell-inner::before {
    border-color: var(--xiehe-green) !important;
  }
  
  /* 上传组件 */
  .ant-upload-list-item:hover {
    background-color: var(--bg-hover) !important;
  }
  
  /* 模态框 */
  .ant-modal-confirm-confirm .ant-modal-confirm-body-title {
    color: var(--text-primary);
  }
  
  /* 通知 */
  .ant-notification-notice-message {
    color: var(--text-primary);
  }
  
  /* 工具提示 */
  .ant-tooltip-inner {
    background-color: var(--gray-800);
  }
  
  /* 头像 */
  .ant-avatar {
    background-color: var(--primary-300);
  }
  
  /* 标签 */
  .ant-tag {
    border-radius: var(--radius-sm);
  }
  
  /* 响应式 */
  @media (max-width: 768px) {
    body {
      font-size: 13px;
    }
  }
`
