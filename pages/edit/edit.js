// edit 页面
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
    dailyPrice: null, // 日均价格
    itemId: null // 当前编辑的物品 ID
  },

  onLoad(options) {
    // 检查 options.item 是否存在
    if (!options.item) {
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      });
      console.error('未传递 item 参数');
      return;
    }
    try {
      // 解析传递的物品数据
      const item = JSON.parse(decodeURIComponent(options.item));
    // 设置默认值并填充表单数据
    this.setData({
      itemId: item.id || null,
      selectedCategory: item.category || null,
      selectedIcon: item.item_image || null,
      assetName: item.item_name || null,
      purchasePrice: item.purchase_price || null,
      purchaseDate: item.purchase_date || this.data.today,
      purchaseDateFormat: this.formatDate(item.purchase_date || this.data.today),
      useCount: (item.use_count_value || 0) > 0, // 初始化 useCount
      specifyDaily: (item.daily_price || 0) > 0, // 初始化 specifyDaily
      isServing: !item.retirement_date,
      remark: item.description || null,
      retirementPrice: item.retirement_price && !isNaN(item.retirement_price) ? parseFloat(item.retirement_price) : null,
      retirementDate: item.retirement_date || null,
      retirementDateFormat: this.formatDate(item.retirement_date),
      useCountValue: item.use_count_value || null,
      dailyPrice: item.daily_price || null
    });
    } catch (error) {
      wx.showToast({
        title: '数据解析失败',
        icon: 'none'
      });
      console.error('解析 item 参数失败:', error);
    }
  },

  // 日期格式化函数
  formatDate(date) {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${year}年${month}月${day}日`;
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
      purchaseDateFormat: this.formatDate(date) // 格式化日期
    });
  },

  // 选择退役日期
  bindRetirementDateChange(e) {
    const date = e.detail.value;
    this.setData({
      retirementDate: date, // 保存原始日期
      retirementDateFormat: this.formatDate(date) // 格式化日期
    });
  },

  // 选择图标
  selectIcon() {
    const selectedCategory = this.data.selectedCategory;
    wx.navigateTo({
      url: `/pages/select-icon/select-icon?category=${selectedCategory}`
    });
  },

  // 输入资产名称
  onAssetNameInput(e) {
    this.setData({ assetName: e.detail.value });
  },

  // 切换开关
  toggleUseCount() {
    this.setData({ useCount: !this.data.useCount });
  },

  toggleSpecifyDaily() {
    this.setData({ specifyDaily: !this.data.specifyDaily });
  },

  // 提交编辑
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
      useCount, // 解构 useCount
      specifyDaily,
      dailyPrice,
      remark,
      itemId
    } = this.data;
    // 名字必填检查
    if (!assetName) {
      wx.showToast({title: '请填写资产名称。',icon: 'none'});
      return;
    }
    // 使用次数判断
    if (useCount) {
      console.log("useCountValue", useCountValue);
      if (!useCountValue || isNaN(Number(useCountValue))) {
          wx.showToast({ title: '使用次数不能为空，请填写或关闭开关。', icon: 'none' });
          return;
      }
    }
    // 日均价格判断
    if (specifyDaily) {
      if (!dailyPrice || isNaN(Number(dailyPrice))) {
          wx.showToast({ title: '日均价格不能为空，请填写或关闭开关。', icon: 'none' });
          return;
      }
    }
    // 构造请求数据
    const requestData = {
      category: selectedCategory,
      item_image: selectedIcon,
      item_name: assetName,
      purchase_date: purchaseDate, // 使用原始日期
      purchase_price: isNaN(parseFloat(purchasePrice)) ? null : parseFloat(purchasePrice).toFixed(2),
      retirement_date: retirementDate, // 使用原始日期
      description: remark,
      retirement_price: retirementPrice !== null && !isNaN(retirementPrice) ? parseFloat(retirementPrice).toFixed(2) : null, // 确保 retirement_price 是有效数字或 null,
      use_count_value: useCount ? parseInt(useCountValue, 10): null, // 保存 useCountValue
      daily_price: specifyDaily ? parseFloat(dailyPrice).toFixed(2) : null // 保存 dailyPrice
    };
  
    // 发送请求
    wx.request({
      url: `${config.domain}${config.apiPath.itemDetail}${itemId}`,  // 使用配置的服务器地址
      method: 'PUT',
      data: requestData,
      header: {
        'Content-Type': 'application/json'
      },
      success: (response) => {
        if (response.statusCode === 200) {
          wx.showToast({
            title: '更新成功',
            icon: 'success'
          });
          // 返回上一页
          wx.navigateBack();
          console.log('更新成功:', response.data);
        } else {
          wx.showToast({
            title: '更新失败',
            icon: 'none'
          });
          console.error('更新失败:', response.data);
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
  
  // 指定退役开关切换
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
        retirementDateFormat: this.formatDate(today),
        retirementPrice: null
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
    // 正则表达式：只允许数字和小数点
    const regex = /^\d*\.?\d*$/;
    if (!regex.test(inputValue)) {
        inputValue = inputValue.match(/\d*\.?\d*/)[0];
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
    // 正则表达式：只允许数字
    const regex = /^\d*$/;
    if (!regex.test(inputValue)) {
        inputValue = inputValue.match(/\d*/)[0];
    }
    this.setData({
      useCountValue: inputValue,
      dailyPrice: null
    });
},

  // 输入日均价格
  onDailyPriceInput: function (e) {
    let inputValue = e.detail.value;
    // 正则表达式：只允许数字和小数点
    const regex = /^\d*$/;
    if (!regex.test(inputValue)) {
        inputValue = inputValue.match(/\d*\.?\d*/)[0];
    }
    this.setData({
      useCountValue: null,
      dailyPrice: inputValue,
    });
  },

  // 输入退役价格
  onRetirementPriceInput: function (e) {
    let inputValue = e.detail.value;
    // 正则表达式：只允许数字和小数点
    const regex = /^\d*$/;
    if (!regex.test(inputValue)) {
        inputValue = inputValue.match(/\d*\.?\d*/)[0];
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
  }

});