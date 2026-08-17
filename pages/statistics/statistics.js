// pages/statistics/statistics.js
const config = require('../../utils/config.js');
const categoryMap = {
  digital: '数码',
  clothing: '服饰',
  beauty: '美妆',
  babies: '母婴',
  games: '游戏',
  musical: '乐器',
  transport: '交通',
  fitness: '健身',
  sports: '体育',
  appliance: '电器',
  furniture: '家具',
  tools: '工具',
  art: '艺术',
  toys: '玩具',
  property: '房产',
  other: '其他',
  undefined: '未定义'
};

Page({
  data: {
    assets: {}, // 资产数据
    categories: [], // 分类数据
    assetTypes: [], // 用于渲染资产类型
    assetTypes2: [], // 用于渲染资产类型
    isAssetStatsExpanded: false, // 资产统计是否展开
    isCategoryStatsExpanded: false // 分类统计是否展开
  },

  onShow: function () {
    this.fetchData();
  },

  // 从服务器获取数据
  fetchData: function () {
    const openid = wx.getStorageSync('openid');
    const url = `${config.domain}${config.apiPath.reportItems}${openid}`;

    wx.request({
      url: url,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          const data = res.data;
          this.processData(data); // 处理数据
        } else {
          // wx.showToast({
          //   title: '数据获取失败',
          //   icon: 'none'
          // });
        }
      },
      fail: (err) => {
        // wx.showToast({
        //   title: '网络请求失败',
        //   icon: 'none'
        // });
        // console.error('请求失败:', err);
      }
    });
  },

  // 处理服务器返回的数据
  processData: function (data) {
    const { assets, categories } = data;

    // 处理资产数据
    const assetTypes = [
      { key: 'all', label: '总资产', amount: assets.all.amount, daily_avg: assets.all.daily_avg, count: assets.all.count },
    ];

    const assetTypes2 = [
      { key: 'active', label: '现役资产', amount: assets.active.amount, daily_avg: assets.active.daily_avg, count: assets.active.count },
      { key: 'retired', label: '退役资产', amount: assets.retired.amount, daily_avg: assets.retired.daily_avg, count: assets.retired.count },
      { key: 'favorite', label: '收藏资产', amount: assets.favorite.amount, daily_avg: assets.favorite.daily_avg, count: assets.favorite.count }
    ];

    // 处理分类数据
    const categoryList = Object.keys(categories).map(key => {
      return {
        key: key,
        name: categoryMap[key] || key, // 转换为中文名称，如果未找到则使用原键
        amount: categories[key].amount,
        daily_avg: categories[key].daily_avg,
        count: categories[key].count
      };
    });

    // 更新数据
    this.setData({
      assets: assets,
      categories: categoryList,
      assetTypes: assetTypes,
      assetTypes2: assetTypes2
    });
  },

  // 切换资产统计的展开状态
  toggleAssetStats: function () {
    this.setData({
      isAssetStatsExpanded: !this.data.isAssetStatsExpanded
    });
  },

  // 切换分类统计的展开状态
  toggleCategoryStats: function () {
    this.setData({
      isCategoryStatsExpanded: !this.data.isCategoryStatsExpanded
    });
  },

    // 咨询客服按钮点击事件
    contactCustomerService: function () {
      wx.showToast({
        title: '咨询客服功能开发中',
        icon: 'none'
      });
    },
  
    // 长按复制 openid 到剪切板
    copyOpenid: function (e) {
      const openid = wx.getStorageSync('openid');
      wx.setClipboardData({
        data: openid,
        success: () => {
          wx.showToast({
            title: '已复制 openid',
            icon: 'none'
          });
        }
      });
    }
});