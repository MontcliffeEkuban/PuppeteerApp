const puppeteer = require("puppeteer");
const categoryModel = require("./models/categoryModel.js");

const mainPage = "https://www.goten.com";  //主页


async function run() {
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

    await page.goto(mainPage);
    
    const totalCategory = 14;
    let categoryContainer = [];
    for (i = 1; i < totalCategory + 1; i++){
        //先得到主类目的信息
        const MAIN_CATEGORY_SELECTOR = `body > div.content > div > div.leftnav.fl > ul > li:nth-child(${i}) > a > span`;
        const MAIN_URL_SELECTOR = `body > div.content > div > div.leftnav.fl > ul > li:nth-child(${i}) > a`;
        
        const name = await page.$eval(MAIN_CATEGORY_SELECTOR, el => el.textContent );
        const url = await page.$eval(MAIN_URL_SELECTOR, el => el.getAttribute("href"));

        categoryContainer.push({ "name": name, "url": url, "parent": "no" })

        const totalMiddleCategory = await page.$eval(`body > div.content > div > div.leftnav.fl > ul > li:nth-child(${i}) > div`, el => el.children.length);
        
        //对当前主类目，获取次级类目信息
        for (j = 1; j < totalMiddleCategory + 1; j++){
            const SECONDARY_CATEGORY_SELECTOR = `body > div.content > div > div.leftnav.fl > ul > li:nth-child(${i}) > div > div:nth-child(${j}) > h6 > a`;
            const name2 = await page.$eval(SECONDARY_CATEGORY_SELECTOR, el => el.textContent.trim());
            const url2 = await page.$eval(SECONDARY_CATEGORY_SELECTOR, el => el.getAttribute("href"));

            categoryContainer.push({ "name": name2, "url": url2, "parent": url });
            //当前中间类目的全部三级类目的数量
            const totalSubCategory = await page.$eval(`body > div.content > div > div.leftnav.fl > ul > li:nth-child(${i}) > div > div:nth-child(${j})`, el => el.children.length);
            
            //对当前中间类目类目，获取全部三级子类目信息
            for (k = j; k < totalSubCategory; k++){
                const SUBCATEGORY_SELECTOR = `body > div.content > div > div.leftnav.fl > ul > li:nth-child(${i}) > div > div:nth-child(${j}) > a:nth-child(${k+1})`
                const name3 = await page.$eval(SUBCATEGORY_SELECTOR, el => el.textContent.trim());
                const url3 = await page.$eval(SUBCATEGORY_SELECTOR, el => el.getAttribute("href"));

                categoryContainer.push({ "name": name3, "url": url3, "parent": url2 });
            }

        }
    }

    categoryContainer.forEach(el => {
        categoryModel.savetodb(el);
    });

    categoryContainer.forEach(el => {
        console.log(el);
    });
    console.log(categoryContainer.length);
}



run();