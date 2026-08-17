// pages/user/user.js

Page({
  // 导出到Excel
  exportToExcel() {
    wx.showToast({
      title: '导出成功',
      icon: 'success',
      duration: 2000,
    });
    // 这里可以调用后端接口导出数据
  },

  // 导入Excel
  importExcel() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success(res) {
        const file = res.tempFiles[0];
        wx.showToast({
          title: '文件已选择',
          icon: 'success',
          duration: 2000,
        });
        // 这里可以调用后端接口上传文件并导入数据
      },
    });
  },

  // 下载模板
  downloadTemplate() {
    wx.downloadFile({
      url: 'https://example.com/template.xlsx', // 替换为模板文件的实际URL
      success(res) {
        wx.saveFile({
          tempFilePath: res.tempFilePath,
          success(savedRes) {
            wx.showToast({
              title: '模板已保存',
              icon: 'success',
              duration: 2000,
            });
          },
        });
      },
    });
  },

  // 查看数据分析
  viewDataAnalysis() {
    wx.navigateTo({
      url: '/pages/dataAnalysis/dataAnalysis', // 跳转到数据分析页面
    });
  },

  // 联系客服
  contactCustomerService() {
    wx.navigateTo({
      url: '/pages/contact/contact', // 跳转到客服页面
    });
  },

  // 关于我们
  aboutUs() {
    wx.navigateTo({
      url: '/pages/about/about', // 跳转到关于我们页面
    });
  },
});