1. 根据指定类目，抓取类目的全部产品信息
2. 抓取字段：
    SKU: String
    price: Number
    inventory: Number
    url: String
    title_ZH: String
    title_EN: String
    category1: String
    category2: String
    category3: String
    images: Array
    length: Number
    width: Number
    height: Number
    weight: Number
    text: String
    默认添加 on_shelf 字段（Boolean），默认为false

2. 运行时，需指定目标类目
    例：node index.js /home-organization.html
3. 类目必须是第三级子类
4. 保存到本地mongDB的app数据库下的products集合


