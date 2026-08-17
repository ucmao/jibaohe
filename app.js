const config = require('./utils/config.js');

App({
  onLaunch() {
    const openid = wx.getStorageSync('openid');
    if (!openid) {
      wx.login({
        success: res => {
          if (res.code) {
            // 将 code 发送到服务器
            this.login(res.code);
          } else {
            console.log('登录失败！' + res.errMsg);
          }
        }
      });
    }
  },
  login: function (code) {
    // 显示加载提示
    wx.showLoading({ title: '登录中...' });
    
    wx.request({
      url: `${config.domain}${config.apiPath.login}`,
      method: 'POST',
      data: {
        code: code
      },
      timeout: 10000, // 设置10秒超时
      success: response => {
        console.log('服务器响应:', response.data);
        if (response.statusCode === 200 && response.data && response.data.openid) {
          wx.setStorageSync('openid', response.data.openid);
        } else {
          console.error('登录失败:', response.data || '服务器返回异常');
          wx.showToast({ 
            title: '登录失败，请重试', 
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: err => {
        console.error('登录请求失败:', err);
        let errorMsg = '网络异常，请检查网络连接';
        if (err.errMsg && err.errMsg.includes('timeout')) {
          errorMsg = '登录超时，请重试';
        }
        wx.showToast({ 
          title: errorMsg, 
          icon: 'none',
          duration: 2000
        });
      },
      complete: () => {
        // 隐藏加载提示
        wx.hideLoading();
      }
    });
  },
  globalData: {
    isFromSelectIcon: false, // 标记是否从 select-icon 页面返回
    isIndexDataLoaded: false // 全局标志位
  }
});