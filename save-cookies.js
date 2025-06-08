const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized'],
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' // 請確認這是你 Chrome 安裝的路徑
    });

    const page = await browser.newPage();

    console.log("🔐 開始前往 x.com/login");

    await page.goto('https://x.com/login', { waitUntil: 'load', timeout: 0 });

    console.log("✅ 請手動登入 Twitter，瀏覽器會等你 2 分鐘再自動關閉並儲存 cookies");

    // 等待 2 分鐘（120,000 毫秒）
    await new Promise(resolve => setTimeout(resolve, 120000));

    const cookies = await page.cookies();
    fs.writeFileSync('cookies.json', JSON.stringify(cookies, null, 2));
    console.log("✅ cookies 已儲存！");

    await browser.close();
  } catch (err) {
    console.error("❌ 發生錯誤：", err.message);
    process.exit(1);
  }
})();

