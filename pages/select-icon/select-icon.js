const config = require('../../utils/config.js');
Page({
  data: {
    categories: [
      { id: 'digital', name: '数码' },
      { id: 'clothing', name: '服饰' },
      { id: 'beauty', name: '美妆' },
      { id: 'babies', name: '母婴' },
      { id: 'games', name: '游戏' },
      { id: 'musical', name: '乐器' },
      { id: 'transport', name: '交通' },
      { id: 'sports', name: '体育' },
      { id: 'appliance', name: '电器' },
      { id: 'furniture', name: '家具' },
      { id: 'tools', name: '工具' },
      { id: 'art', name: '艺术' },
      { id: 'toys', name: '玩具' },
      { id: 'fitness', name: '健身' },
      { id: 'property', name: '房产' },
    ],
    selectedCategory: 'digital',  // 默认选中第一个分类
    iconList: [],  // 当前显示的图标列表
    allIcons: {},  // 所有图标数据，按分类存储
    loading: true  // 加载状态
  },

  onLoad() {
    this.fetchIcons();
  },

  // 从服务器获取图标数据
  fetchIcons() {
    wx.request({
      url: `${config.domain}${config.apiPath.categories}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          this.setData({
            allIcons: res.data,
            iconList: res.data[this.data.selectedCategory] || [],
            loading: false
          });
        } else {
          console.error('请求失败:', res);
          wx.showToast({
            title: '请求失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('请求失败:', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  // 切换分类
  switchCategory(e) {
    const category = e.currentTarget.dataset.id;
    this.setData({
      selectedCategory: category,
      iconList: this.data.allIcons[category] || []
    });
  },

  // 选择图标
  selectIcon(e) {
    const { url } = e.currentTarget.dataset;
  
    // 将选中的图标和分类传回上一页
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    prevPage.setData({
      selectedIcon: url,
      selectedCategory: this.data.selectedCategory
    });
    wx.navigateBack();
  }
});