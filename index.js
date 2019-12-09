
const puppeteer = require("puppeteer");
const CREDS = require("./creds.js");
const productModel = require("./models/productModel.js");

const mainPage = "https://www.goten.com";  //主页

const inputValue = process.argv[2];        //从用户输入获取参数
const targetURL = inputValue + "?WarehouseId=111"; //定义目标页面

async function run(){
    //Part0: 初始化浏览器
    const browser = await puppeteer.launch(
        {
            headless: false,
            defaultViewport: {
                height: 720,
                width: 1280,
            }
        }
    );
    const page = await browser.newPage();
    console.log("browser launched...");

    //Part1: 登录
    //进入主页并且查看是否登录
    await page.goto(mainPage);
    const LOGIN_SELECTOR = "body > div.top-new > div.headtop.prohead > div.new-headtop.layui-form > div > div.newheadtopr.lang.fr > ul > li:nth-child(1) > a";
    let isLoginedIn = await page.$eval(LOGIN_SELECTOR, el => el.textContent);
    
    //如果未登录，执行登录
    if(isLoginedIn == "登录"){
        //前往登录页面
        await page.goto(mainPage + "/login.html");

        //输入验证并登录
        const USERNAME_SELECTOR = "#AccountName";
        const PASSWORD_SELECTOR = "#Password";
        const BUTTON_SELECTOR = "body > div.contentc > div.login > form > ul > li:nth-child(5) > div > button";
        await page.click(USERNAME_SELECTOR);
        await page.keyboard.type(CREDS.user000.username);
        await page.click(PASSWORD_SELECTOR);
        await page.keyboard.type(CREDS.user000.password);
        await page.click(BUTTON_SELECTOR); 

        console.log("logined in...");
    } 

    //Part2: 前往目标页面,选择中文
    await page.goto(mainPage);
    const LANGUAGE_SELECTOR = "body > div.top-new > div.headtop.prohead > div.new-headtop.layui-form > div > div.newheadtopl.lang.fl > ul > li.layui-form > div > div > div > input";
    const CHINESE_SELECTOR = "body > div.top-new > div.headtop.prohead > div.new-headtop.layui-form > div > div.newheadtopl.lang.fl > ul > li.layui-form > div > div > dl > dd:nth-child(2)";
    await page.click(LANGUAGE_SELECTOR, {button: "left", clickCount: 1, delay: 1000});
    await page.click(CHINESE_SELECTOR);

    //前往目标页
    await page.goto(mainPage + targetURL);

    //得到总共的页数
    const PAGES_SELECTOR = "body > div.pages3 > div > div.goods-arranged > div.view-list > div > div > p";
    const totalPages = await page.$eval(PAGES_SELECTOR, el => {
        let str = el.textContent;
        let index = str.indexOf("共");
        return str.charAt(index + 1);
    });

    let productList = [];
    //获取该类目全部产品列表
    for(let pageIndex = 1; pageIndex <= totalPages; pageIndex ++){
        //如果不是第一页，前往期他页，
        if(pageIndex > 1) await page.goto(mainPage + targetURL + `&pageIndex=${pageIndex}`);

        //获得当前页面的产品数
        const totalItems = await page.$$eval("div.proitemIndx", divs => divs.length);
        //依次获得每一个产品的SKU和URL
        for(let item = 1; item <= totalItems; item ++){
            const SKU_SELECTOR = `body > div.pages3 > div > div.goods-arranged > div:nth-child(${item}) > h5`;
            const URL_SELECTOR = `body > div.pages3 > div > div.goods-arranged > div:nth-child(${item}) > a`;
            const SKU = await page.$eval(SKU_SELECTOR, el => el.textContent.slice(4));
            const detailPageURL = await page.$eval(URL_SELECTOR, el => el.getAttribute("href"));
            
            //填充数据到list中
            productList.push({"SKU": SKU, "URL": mainPage + detailPageURL});  
        }
    }

    //对于每一个产品，进入详细页面，获取详细数据
    for (const product of productList) {
        //跳转到产品详情页
        await page.goto(product.URL);
        //定义目标数据选择器
        const PRICE_SELECTOR = ".currPrice";
        const INVENTORY_SELECTOR = "#ktotal";
        const TITLE_ZH_SELECTOR = "body > div.content.headtopmargin > div.goods-view > div.goods-mian > div.good_head > div > h3";
        const TITLE_EN_SELECTOR = "body > div.content.headtopmargin > div.goods-view > div.goods-mian > div.good_head > div > h4";
        const CATEGORY1_SELECTOR = "body > div.content.headtopmargin > div.location > p > a:nth-child(2)";
        const CATEGORY2_SELECTOR = "body > div.content.headtopmargin > div.location > p > a:nth-child(3)";
        const CATEGORY3_SELECTOR = "body > div.content.headtopmargin > div.location > p > a:nth-child(4)";
        const IMAGE_SELECTOR = ".small-img";
        const LENGTH_SELECTOR = "body > div.content.martop > div.details.fl > div > div > divs > div.volume > ul > li:nth-child(1) > em";
        const WIDTH_SELECTOR = "body > div.content.martop > div.details.fl > div > div > divs > div.volume > ul > li:nth-child(2) > em";
        const HEIGHT_SELECTOR = "body > div.content.martop > div.details.fl > div > div > divs > div.volume > ul > li:nth-child(3) > em";
        const WEIGHT_SELECTOR = "body > div.content.martop > div.details.fl > div > div > divs > div.volume > ul > li:nth-child(4) > em";
        const TEXT_SELECTOR = ".richtext";

        //获取数据
        const price = await page.$eval(PRICE_SELECTOR, el => parseFloat(el.textContent.slice(4)));
        const inventory = await page.$eval(INVENTORY_SELECTOR, el => parseInt(el.textContent));
        const title_ZH = await page.$eval(TITLE_ZH_SELECTOR, el => el.textContent.trim());
        const title_EN = await page.$eval(TITLE_EN_SELECTOR, el => el.textContent.trim());
        const category1 = await page.$eval(CATEGORY1_SELECTOR, el => el.getAttribute("href"));
        const category2 = await page.$eval(CATEGORY2_SELECTOR, el => el.getAttribute("href"));
        const category3 = await page.$eval(CATEGORY3_SELECTOR, el => el.getAttribute("href"));
        const images = await page.$$eval(IMAGE_SELECTOR, els => {
            let data = [];
            els.forEach(el => {
                data.push(el.firstChild.getAttribute("src"));
            });
            return data;
        });
        const length = await page.$eval(LENGTH_SELECTOR, el => parseFloat(el.textContent));
        const width = await page.$eval(WIDTH_SELECTOR, el => parseFloat(el.textContent));
        const height = await page.$eval(HEIGHT_SELECTOR, el => parseFloat(el.textContent));
        const weight = await page.$eval(WEIGHT_SELECTOR, el => parseFloat(el.textContent));  
        const text = await page.$eval(TEXT_SELECTOR, el => el.textContent.trim());
        
        console.log(text);

        let data = {
            SKU: product.SKU,
            url: product.URL,
            price: price, 
            inventory: inventory,
            title_ZH: title_ZH,
            title_EN: title_EN,
            category1: category1,
            category2: category2,
            category3: category3,
            images: images,
            length: length,
            width: width,
            height: height,
            weight: weight,
            text: text,
            on_shelf: false
        }

        productModel.savetodb(data);
    }
    
    //End: 关闭
    console.log("browser closed...");
    browser.close();
}

run();

