// 应用配置示例文件
// 复制此文件并重命名为 config.js 后使用

const config = {
  // API域名配置
  domain: 'https://your-domain.com', // 请替换为你的实际API域名
  
  // 应用名称配置
  appName: {
    full: '你的应用名称',
    short: '应用简称',
    description: '你的应用描述！'
  },
  
  // API路径配置
  apiPath: {
    login: '/api/login',
    userItems: '/api/items/user/',
    itemDetail: '/api/items/item/',
    categories: '/api/items/categories',
    addItem: '/api/items/add_item',
    reportItems: '/api/report/report-items/'
  },
  
  // 静态资源配置
  staticPath: {
    shareImage: '/static/default/share-image.jpg'
  }
};

module.exports = config;