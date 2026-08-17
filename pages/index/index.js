const config = require('../../utils/config.js');
Page({
  data: {
    expandedId: null, // 使用 id 来标识展开的 item
    totalAssets: 0, // 总资产
    dailyIncome: 0, // 日均收益
    assetsList: [], // 物品列表
    filteredAssetsList: [], // 筛选后的物品列表
    activeCount: 0, // 筛选的 items 数量
    totalCount: 0, // 所有 items 数量
    showSortPopup: false, // 是否显示排序弹窗
    showFilterPopup: false, // 是否显示筛选弹窗
    showCategoryPopup: false, // 是否显示分类弹窗
    sortOptions: [
      { text: '最新添加', value: 'newest', shortText: '最新 ↓' },
      { text: '最早添加', value: 'oldest', shortText: '最早 ↓' },
      { text: '价格从高到低', value: 'priceDesc', shortText: '价格 ↓' },
      { text: '价格从低到高', value: 'priceAsc', shortText: '价格 ↑' },
      { text: '日均从高到低', value: 'dailyDesc', shortText: '日均 ↓' },
      { text: '日均从低到高', value: 'dailyAsc', shortText: '日均 ↑' },
      { text: '使用天数从高到低', value: 'daysDesc', shortText: '天数 ↓' },
      { text: '使用天数从低到高', value: 'daysAsc', shortText: '天数 ↑' },
      { text: '购买日期从早到晚', value: 'purchaseDateAsc', shortText: '日期 ↓' },
      { text: '购买日期从晚到早', value: 'purchaseDateDesc', shortText: '日期 ↑' },
    ],
    filterOptions: [
      { text: '全部', value: 'all', shortText: '全部' },
      { text: '收藏', value: 'favorite', shortText: '收藏' },
      { text: '已退役', value: 'retired', shortText: '退役' },
      { text: '未退役', value: 'active', shortText: '现役' },
    ],
    currentSort: 'newest', // 当前排序方式
    currentFilter: 'all', // 当前筛选条件
    currentCategory: 'all', // 当前分类
    currentFilterText: '全部', // 默认显示“全部”
    currentSortText: '最新 ↓', // 默认显示“最新 ↓
    categories: [
      { id: 'all', name: '全部' }, // 新增“全部”选项
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
      { id: 'undefined', name: '未定义' }, // 新增“未定义”选项
    ],
  },

  onLoad() {
    // 动态设置导航栏标题
    wx.setNavigationBarTitle({
      title: `${config.appName.full} - 你的资产管家`
    });
    this.fetchUserItems();
    getApp().globalData.isIndexDataLoaded = true; // 数据加载完成后设置全局标志位
  },

  onShow() {
    if (!getApp().globalData.isIndexDataLoaded) {
      this.fetchUserItems();
    };
    getApp().globalData.isIndexDataLoaded = false;
  },

  // 从服务器获取用户物品数据
  fetchUserItems() {
    const openid = wx.getStorageSync('openid');
    // 如果 openid 为空，延迟 1.5 秒后重试
    if (!openid) {
      setTimeout(() => {
        this.fetchUserItems(); // 1.5 秒后重试
      }, 1500);
      return; // 直接返回，避免继续执行
    }
    // 正常请求逻辑
    wx.request({
        url: `${config.domain}${config.apiPath.userItems}${openid}`, // 使用配置的服务器地址
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          const items = res.data;
          this.processItems(items); // 处理数据
        } else {
          console.error('服务器返回错误:', res);
        }
      },
      fail: (err) => {
        console.error('请求失败:', err);
      },
    });
  },

  // 处理物品数据
  processItems(items) {
    // 计算总资产和日均收益
    let totalAssets = 0; // 总资产
    let totalDays = 0; // 总使用天数
    let totalCount = items.length; // 所有物品数量
    const assetsList = items.map((item) => {
      // 计算使用天数
      let days = 0;
      let itemDailyIncome = 0;
      if (item.daily_price > 0) {
        itemDailyIncome = item.daily_price;
        days = Number(Math.floor(item.purchase_price / itemDailyIncome));
      } else if (item.use_count_value > 0) {
        days = Number(item.use_count_value);
        itemDailyIncome = this.calculateItemDailyIncome(item.purchase_price, days);
      } else {
        days = Number(this.calculateDays(item.purchase_date, item.retirement_date));
        itemDailyIncome = this.calculateItemDailyIncome(item.purchase_price, days);
      }
      let retirement_price = item.retirement_price || 0;
      let purchase_price = item.purchase_price || 0;
      let item_asset = Math.round((purchase_price - retirement_price) * 100) / 100; // 使用 Math.round
      totalAssets = Math.round((totalAssets + item_asset) * 100) / 100; // 使用 Math.round
      totalDays += days || 0; // 累加总使用天数
      // 根据 item.category 查找对应的中文名称
      const category = this.data.categories.find((cat) => cat.id === item.category);
      const categoryName = category ? category.name : '未定义'; // 如果 category 为 null，则归类为“未定义”
      return {
        id: item.id, // 物品 ID
        category: item.category || 'undefined', // 如果 category 为 null，则设置为 'undefined'
        categoryName: categoryName,
        item_name: item.item_name, // 物品名称
        item_image: item.item_image, // 物品图片
        purchase_price: purchase_price, // 购买价格
        purchase_date: item.purchase_date, // 购买日期
        retirement_price: item.retirement_price, // 退役价格
        use_count_value: item.use_count_value, // 使用次数
        daily_price: item.daily_price, // 指定日均价
        itemDailyIncome: itemDailyIncome, // 日均收益
        is_favorite: item.is_favorite, // 是否收藏
        description: item.description, // 备注
        retirement_date: item.retirement_date, // 退役日期
        purchase_date_format: this.formatDate(item.purchase_date),
        retirement_date_format: this.formatDate(item.retirement_date),
        days: days, // 使用天数
        status: item.retirement_date ? '已退役' : '服役', // 物品状态
        updated_at: item.updated_at || new Date().toISOString(), // 更新时间
        expanded: false, // 默认不展开
      };
    });
    // 筛选和排序逻辑
    const { sortedList, totalAssets: filteredTotalAssets, dailyIncome: filteredDailyIncome, activeCount } = this.filterAndSortAssetsLogic(
      assetsList,
      this.data.currentFilter,
      this.data.currentSort,
      this.data.currentCategory
    );
    // 更新页面数据
    this.setData({
      totalAssets: filteredTotalAssets, // 使用筛选后的总资产
      dailyIncome: filteredDailyIncome, // 使用筛选后的日均收益
      assetsList, // 物品列表
      filteredAssetsList: sortedList, // 筛选和排序后的列表
      activeCount, // 筛选后的 items 数量
      totalCount, // 所有物品数量
    });
  },

  // 日期格式化函数
  formatDate(date) {
    if (!date) return '';
    const [year, month, day] = date.split('-');
    return `${year}年${month}月${day}日`;
  },

  // 计算使用天数
  calculateDays(purchaseDate, retirementDate) {
    const purchase = new Date(purchaseDate);
    const retirement = retirementDate ? new Date(retirementDate) : new Date();
    const diffTime = Math.abs(retirement - purchase);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // 将毫秒转换为天数
  },

  // 计算日均收益
  calculateItemDailyIncome(purchasePrice, days) {
    if (days > 0) {
      return Math.round((purchasePrice / days) * 100) / 100; // 使用 Math.round
    }
    return 0; // 如果 days 为 0，返回 0
  },

  // 显示/隐藏排序弹窗
  toggleSortPopup() {
    this.setData({
      showSortPopup: !this.data.showSortPopup,
    });
  },

  // 显示/隐藏筛选弹窗
  toggleFilterPopup() {
    this.setData({
      showFilterPopup: !this.data.showFilterPopup,
    });
  },

  // 显示/隐藏分类弹窗
  toggleCategoryPopup() {
    this.setData({
      showCategoryPopup: !this.data.showCategoryPopup,
    });
  },

  // 选择排序方式
  selectSort(e) {
    const value = e.currentTarget.dataset.value;
    // 根据 value 找到对应的 shortText
    const selectedSort = this.data.sortOptions.find((option) => option.value === value);
    const sortText = selectedSort ? selectedSort.shortText : '最新 ↓';
    // 更新页面数据
    this.setData({
      currentSort: value,
      showSortPopup: false,
      currentSortText: sortText, // 更新排序按钮的显示文本
    });
    // 执行筛选和排序逻辑
    this.filterAndSortAssets(this.data.currentFilter, value, this.data.currentCategory);
  },

  // 选择筛选条件
  selectFilter(e) {
    const value = e.currentTarget.dataset.value;
    // 根据 value 找到对应的显示文本
    const selectedFilter = this.data.filterOptions.find((option) => option.value === value);
    const filterText = selectedFilter ? selectedFilter.shortText : '全部';
    // 更新页面数据
    this.setData({
      currentFilter: value,
      currentFilterText: filterText, // 更新筛选按钮的显示文本
      showFilterPopup: false,
    });
    // 执行筛选逻辑
    this.filterAndSortAssets(value, this.data.currentSort, this.data.currentCategory);
  },

  // 选择分类
  selectCategory(e) {
    const value = e.currentTarget.dataset.value;
    this.setData({
      currentCategory: value,
      showCategoryPopup: false,
    });
    this.filterAndSortAssets(this.data.currentFilter, this.data.currentSort, value);
  },

  // 筛选并排序物品列表（纯函数）
  filterAndSortAssetsLogic(assetsList, filterType, sortType, categoryType) {
    // 筛选物品列表
    let filteredList = assetsList.filter((item) => {
      if (filterType === 'all') {
        // 不筛选
      } else if (filterType === 'favorite') {
        if (!item.is_favorite) return false;
      } else if (filterType === 'retired') {
        if (!item.retirement_date) return false;
      } else if (filterType === 'active') {
        if (item.retirement_date) return false;
      }
      // 根据 categoryType 筛选
      if (categoryType !== 'all' && item.category !== categoryType) {
        return false;
      }
      return true;
    });
    // 计算总资产和日均收益
    let totalAssets = 0;
    let totalDays = 0;
    filteredList.forEach((item) => {
      const retirement_price = item.retirement_price || 0;
      const purchase_price = item.purchase_price || 0;
      const item_asset = Math.round((purchase_price - retirement_price) * 100) / 100; // 使用 Math.round
      totalAssets = Math.round((totalAssets + item_asset) * 100) / 100; // 使用 Math.round
      totalDays += item.days || 0; // 累加总使用天数
    });
    // 计算总日均收益
    let dailyIncome = 0;
    if (totalDays > 0) {
      dailyIncome = Math.round((totalAssets / totalDays) * 100) / 100; // 使用 Math.round
    }
    // 排序物品列表
    let sortedList = [...filteredList];
    switch (sortType) {
      case 'newest': // 最新添加
        sortedList.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        break;
      case 'oldest': // 最早添加
        sortedList.sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
        break;
      case 'priceDesc': // 价格从高到低
        sortedList.sort((a, b) => b.purchase_price - a.purchase_price);
        break;
      case 'priceAsc': // 价格从低到高
        sortedList.sort((a, b) => a.purchase_price - b.purchase_price);
        break;
      case 'dailyDesc': // 日均从高到低
        sortedList.sort((a, b) => b.itemDailyIncome - a.itemDailyIncome);
        break;
      case 'dailyAsc': // 日均从低到高
        sortedList.sort((a, b) => a.itemDailyIncome - b.itemDailyIncome);
        break;
      case 'daysDesc': // 使用天数从高到低
        sortedList.sort((a, b) => b.days - a.days);
        break;
      case 'daysAsc': // 使用天数从低到高
        sortedList.sort((a, b) => a.days - b.days);
        break;
      case 'purchaseDateAsc': // 购买日期从早到晚
        sortedList.sort((a, b) => new Date(a.purchase_date) - new Date(b.purchase_date));
        break;
      case 'purchaseDateDesc': // 购买日期从晚到早
        sortedList.sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date));
        break;
      default:
        // 默认按最新添加排序
        sortedList.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        break;
    }
    // 返回排序后的列表和计算结果
    return {
      sortedList,
      totalAssets,
      dailyIncome,
      activeCount: filteredList.length, // 筛选后的 items 数量
    };
  },

  // 筛选并排序物品列表
  filterAndSortAssets(filterType, sortType, categoryType) {
    const { sortedList, totalAssets, dailyIncome, activeCount } = this.filterAndSortAssetsLogic(
      this.data.assetsList,
      filterType,
      sortType,
      categoryType
    );
    // 更新数据
    this.setData({
      filteredAssetsList: sortedList,
      totalAssets,
      dailyIncome,
      activeCount, // 更新筛选后的 items 数量
    });
  },

  // 切换 item 展开状态
  toggleExpand(e) {
    const id = e.currentTarget.dataset.id; // 获取点击的 item id
    const { expandedId } = this.data;
    if (expandedId === id) {
      // 如果点击的是已展开的 item，则折叠它
      this.setData({
        expandedId: null,
      });
    } else {
      // 如果点击的是另一个 item，则折叠之前展开的 item，并展开当前点击的 item
      this.setData({
        expandedId: id,
      });
    }
  },

  // 收藏按钮点击事件
  handleFavorite(e) {
    const id = e.currentTarget.dataset.id; // 获取点击的 item id
    const assetsList = this.data.assetsList;
    const item = assetsList.find((item) => item.id === id); // 获取对应的 item
    if (!item) return;
    // 切换收藏状态
    item.is_favorite = !item.is_favorite;
    // 发送 PUT 请求
    wx.request({
        url: `${config.domain}${config.apiPath.itemDetail}${id}`,
      method: 'PUT',
      data: {
        is_favorite: item.is_favorite, // 更新收藏状态
      },
      success: (res) => {
        if (res.statusCode === 200) {
          // 更新成功，更新前端数据
          this.setData({ assetsList });
          this.filterAndSortAssets(this.data.currentFilter, this.data.currentSort, this.data.currentCategory);
        } else {
          wx.showToast({ title: '更新失败', icon: 'none' });
        }
      },
      fail: (err) => {
        console.error('请求失败:', err);
      },
    });
  },

  // 编辑按钮点击事件
  handleEdit(e) {
    const id = e.currentTarget.dataset.id; // 获取点击的 item id
    const item = this.data.assetsList.find((item) => item.id === id); // 获取对应的 item
    if (item) {
      wx.navigateTo({
        url: `/pages/edit/edit?item=${encodeURIComponent(JSON.stringify(item))}`,
      });
    } else {
      wx.showToast({
        title: '数据加载失败',
        icon: 'none',
      });
      console.error('未找到对应的 item');
    }
  },

  // 退役按钮点击事件
  handleRetirement(e) {
    const id = e.currentTarget.dataset.id; // 获取点击的 item id
    const assetsList = this.data.assetsList;
    const item = assetsList.find((item) => item.id === id); // 获取对应的 item
    if (!item) return;
    // 更新退役日期为当前日期
    const retirementDate = new Date().toISOString().split('T')[0]; // 格式化为 YYYY-MM-DD
    // 发送 PUT 请求
    wx.request({
        url: `${config.domain}${config.apiPath.itemDetail}${id}`,
      method: 'PUT',
      data: {
        retirement_date: retirementDate, // 更新退役日期
      },
      header: {
        'Content-Type': 'application/json',
      },
      success: (res) => {
        if (res.statusCode === 200) {
          // 更新前端数据
          item.retirement_date = retirementDate;
          item.retirement_date_format = this.formatDate(item.retirement_date);
          item.status = '已退役'; // 更新状态

          // 更新 activeCount
          const activeCount = this.data.activeCount - 1;
          this.setData({
            assetsList,
            activeCount,
          });
          this.filterAndSortAssets(this.data.currentFilter, this.data.currentSort, this.data.currentCategory);
        } else {
          console.error('更新失败:', res.data);
          wx.showToast({ title: '更新失败', icon: 'none' });
        }
      },
      fail: (err) => {
        console.error('请求失败:', err);
      },
    });
  },

  // 删除按钮点击事件
  handleDelete(e) {
    const id = e.currentTarget.dataset.id; // 获取点击的 item id
    const assetsList = this.data.assetsList;
    const item = assetsList.find((item) => item.id === id); // 获取对应的 item
    if (!item) return;
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个资产吗？此操作不可撤销。',
      success: (res) => {
        if (res.confirm) {
          // 发送 DELETE 请求
          wx.request({
            url: `${config.domain}${config.apiPath.itemDetail}${id}`,
            method: 'DELETE',
            success: (res) => {
              if (res.statusCode === 200) {
                // 删除成功，更新前端数据
                const index = assetsList.indexOf(item);
                assetsList.splice(index, 1); // 删除该物品
                this.setData({ assetsList });
                // 重新计算总资产、日均收益、服役物品数量等
                this.processItems(assetsList);
              } else {
                wx.showToast({ title: '删除失败', icon: 'none' });
              }
            },
            fail: (err) => {
              console.error('请求失败:', err);
            },
          });
        }
      },
    });
  },

  // 分享好友配置
  onShareAppMessage() {
    return {
      title: `${config.appName.full} - ${config.appName.description}`, // 分享标题
      path: '/pages/index/index', // 分享路径
      imageUrl: '/static/default/share-image.jpg', // 分享图片
      success(res) {
        console.log('分享成功', res);
      },
      fail(err) {
        console.log('分享失败', err);
      },
    };
  },

  // 分享朋友圈配置
  onShareTimeline() {
    return {
      title: `${config.appName.full} - ${config.appName.description}`, // 分享标题
      path: '/pages/index/index', // 分享路径
      imageUrl: '/static/default/share-image.jpg', // 分享图片
      success(res) {
        console.log('分享成功', res);
      },
      fail(err) {
        console.log('分享失败', err);
      },
    };
  },
});