// add 页面
const app = getApp();
const { formatDate, regex } = require('../../utils/util.js');
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
      { id: 'other', name: '其他' },
    ],
    selectedCategory: null,
    selectedIcon: null,
    assetName: null,
    purchasePrice: null,
    purchaseDate: null,
    purchaseDateFormat: null,
    useCount: false,
    specifyDaily: false,
    isServing: true,
    remark: null,
    retirementPrice: null, // 二手售卖价格
    retirementDate: null, // 退役日期
    retirementDateFormat: null,
    today: new Date().toISOString().split('T')[0], // 设置日期选择器的最大值为今天
    useCountValue: null, // 预计使用次数
    dailyPrice: null // 日均价格
  },

  onLoad() {
    // 初始化日期
    const today = this.data.today;
    this.setData({
      purchaseDate: today, // 格式化日期
      purchaseDateFormat: formatDate(today) // 格式化日期
    });
  },

  onShow() {
    if (app.globalData.isFromSelectIcon) {
      // 如果是从 select-icon 页面返回的，不清空数据
      app.globalData.isFromSelectIcon = false; // 重置标记
    } else {
      // 如果不是从 select-icon 页面返回的，清空表单数据
      this.setData({
        selectedCategory: null,
        selectedIcon: null,
        assetName: null,
        purchasePrice: null,
        purchaseDate: this.data.today,
        purchaseDateFormat: formatDate(this.data.today),
        useCount: false,
        specifyDaily: false,
        isServing: true,
        remark: null,
        retirementPrice: null,
        retirementDate: null,
        retirementDateFormat: null,
        useCountValue: null,
        dailyPrice: null
      });
    }
  },

  // 选择分类
  selectCategory(e) {
    const category = e.currentTarget.dataset.id;
    this.setData({ selectedCategory: category });
  },



  // 选择日期
  bindPurchaseDateChange(e) {
    const date = e.detail.value;
    this.setData({
      purchaseDate: date, // 保存原始日期
      purchaseDateFormat: formatDate(date) // 格式化日期
    });
  },

  // 选择退役日期
  bindRetirementDateChange(e) {
    const date = e.detail.value;
    this.setData({
      retirementDate: date, // 保存原始日期
      retirementDateFormat: formatDate(date) // 格式化日期
    });
  },

  // 选择图标
  // 跳转到 select-icon 页面
  selectIcon() {
    app.globalData.isFromSelectIcon = true; // 设置标记
    const selectedCategory = this.data.selectedCategory;
    wx.navigateTo({
      url: `/pages/select-icon/select-icon?category=${selectedCategory}`
    });
  },

  // 输入资产名称
  onAssetNameInput(e) {
    this.setData({ assetName: e.detail.value });
  },

  submitForm() {
    const {
      selectedCategory,
      selectedIcon,
      assetName,
      purchasePrice,
      purchaseDate,
      retirementDate,
      retirementPrice,
      useCountValue,
      dailyPrice,
      useCount,
      specifyDaily,
      remark,
      isServing
    } = this.data;
    // 名字必填检查
    if (!assetName) {
      wx.showToast({title: '请填写资产名称。',icon: 'none'});
      return;
    }
    // 分类必填检查
    if (!selectedCategory) {
      wx.showToast({title: '请选择资产分类。',icon: 'none'});
      return;
    }
    // 购买价格必填检查
    if (!purchasePrice || isNaN(parseFloat(purchasePrice))) {
      wx.showToast({title: '请填写有效的购买价格。',icon: 'none'});
      return;
    }
    // 使用次数判断
    if (useCount) {
      console.log("useCountValue", useCountValue);
      if (!useCountValue || isNaN(Number(useCountValue)) || Number(useCountValue) <= 0) {
          wx.showToast({ title: '使用次数必须为大于0的数字，请填写或关闭开关。', icon: 'none' });
          return;
      }
    }
    // 日均价格判断
    if (specifyDaily) {
      if (!dailyPrice || isNaN(parseFloat(dailyPrice)) || parseFloat(dailyPrice) < 0) {
          wx.showToast({ title: '日均价格不能为空且必须为非负数字，请填写或关闭开关。', icon: 'none' });
          return;
      }
    }
    // 退役价格检查
    if (!isServing && retirementPrice && (isNaN(parseFloat(retirementPrice)) || parseFloat(retirementPrice) < 0)) {
      wx.showToast({ title: '退役价格必须为非负数字。', icon: 'none' });
      return;
    }
    // 构造请求数据
    const requestData = {
      openid: wx.getStorageSync('openid'),
      category: selectedCategory,
      item_image: selectedIcon,
      item_name: assetName,
      purchase_date: purchaseDate, // 使用原始日期
      purchase_price: isNaN(parseFloat(purchasePrice)) ? null : parseFloat(purchasePrice).toFixed(2),
      retirementDate: retirementDate, // 使用原始日期
      retirement_price: retirementPrice !== null && !isNaN(retirementPrice) ? parseFloat(retirementPrice).toFixed(2) : null, // 确保 retirement_price 是有效数字或 null,
      description: remark,
      is_favorite: false,  // 默认值
      use_count_value: useCount ? parseInt(useCountValue, 10): null, // 保存 useCountValue
      daily_price: specifyDaily ? parseFloat(dailyPrice).toFixed(2) : null // 保存 dailyPrice
    };
    // 发送请求
    wx.request({
      url: `${config.domain}${config.apiPath.addItem}`,  // 使用配置的服务器地址
      method: 'POST',
      data: requestData,
      header: {
        'Content-Type': 'application/json'
      },
      success: (response) => {
        if (response.statusCode === 201) {
          wx.showToast({
            title: '添加成功',
            icon: 'success'
          });
          // 跳转到Tab的index页面
          wx.switchTab({
            url: `/pages/index/index`,
          });
          console.log('添加成功:', response.data);
        } else {
          wx.showToast({
            title: '添加失败',
            icon: 'none'
          });
          console.error('添加失败:', response.data);
        }
      },
      fail: (error) => {
        wx.showToast({
          title: '请求失败',
          icon: 'none'
        });
        console.error('请求失败:', error);
      }
    });
  },

  // 按使用次数计算开关切换
  toggleUseCount: function (e) {
    const useCount = e.detail.value;
    this.setData({
      useCount: useCount,
      specifyDaily: useCount ? false : this.data.specifyDaily, // 互斥逻辑
      useCountValue: !useCount ? null : this.data.useCountValue,  //如果关
      dailyPrice: useCount ? null : this.data.dailyPrice,  //如果开
    });
  },

  // 指定日均价开关切换
  toggleSpecifyDaily: function (e) {
    const specifyDaily = e.detail.value;
    this.setData({
      specifyDaily: specifyDaily,
      useCount: specifyDaily ? false : this.data.useCount, // 互斥逻辑
      dailyPrice: !specifyDaily ? null : this.data.dailyPrice,  //如果关
      useCountValue: specifyDaily ? null : this.data.useCountValue,  //如果开
    });
  },

  // 正在服役开关切换
  toggleServing(e) {
    const today = this.data.today;
    const isServing = e.detail.value; // 获取开关的状态
    this.setData({
      isServing,
      showRetirementFields: !isServing, // 如果关闭服役，则显示退役字段
    });
    // 根据开关状态设置退役日期
    if (!isServing) {
      this.setData({
        retirementDate: today, // 如果关闭服役，设置退役日期为今天
        retirementDateFormat: formatDate(today)
      });
    } else {
      this.setData({
        retirementDate: null, // 如果开启服役，清空退役日期
        retirementDateFormat: null,
        retirementPrice: null
      });
    }
  },

  // 输入价格
  onPurchasePriceInput: function (e) {
    let inputValue = e.detail.value;
    // 只允许数字和小数点
    if (!regex.number.test(inputValue)) {
        inputValue = inputValue.match(regex.number)[0];
    }
    if (inputValue.trim() === "") {
      inputValue = null;
    }
    this.setData({
        purchasePrice: inputValue,
    });
},

  // 输入预计使用次数
  onUseCountInput: function (e) {
    let inputValue = e.detail.value;
    // 只允许数字
    if (!regex.integer.test(inputValue)) {
        inputValue = inputValue.match(regex.integer)[0];
    }
    this.setData({
      useCountValue: inputValue,
      dailyPrice: null
    });
},

  // 输入日均价格
  onDailyPriceInput: function (e) {
    let inputValue = e.detail.value;
    // 只允许数字和小数点
    if (!regex.number.test(inputValue)) {
        inputValue = inputValue.match(regex.number)[0];
    }
    this.setData({
      useCountValue: null,
      dailyPrice: inputValue,
    });
  },

  // 输入退役价格
  onRetirementPriceInput: function (e) {
    let inputValue = e.detail.value;
    // 只允许数字和小数点
    if (!regex.number.test(inputValue)) {
        inputValue = inputValue.match(regex.number)[0];
    }
    if (inputValue.trim() === "") {
      inputValue = null;
    }
    this.setData({
      retirementPrice: inputValue
    });
  },

  // 输入备注
  onRemarkInput(e) {
    this.setData({ remark: e.detail.value });
  },

});
