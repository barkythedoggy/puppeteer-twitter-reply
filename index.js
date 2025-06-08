const puppeteer = require('puppeteer-core');
const chromium = require('chromium');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

app.post('/', async (req, res) => {
  const { target_tweet_url, comment } = req.body;
  if (!target_tweet_url || !comment) {
    return res.status(400).send('Missing tweet URL or reply message');
  }

  const cookies = JSON.parse(fs.readFileSync('cookies.json'));

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chromium.path,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setCookie(...cookies);
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

  console.log(`[🧭] Opening tweet URL: ${target_tweet_url}`);
  await page.goto(target_tweet_url, { waitUntil: 'domcontentloaded' });

  // 👇 檢查是否導到 login 頁
  if (page.url().includes('/login')) {
    console.log('[🚫] Not logged in. You are being redirected to Twitter login page.');
    await browser.close();
    return res.status(401).send('Not logged in. Please update your cookies.json');
  }

  try {
    await page.waitForSelector('div[data-testid="reply"]', { timeout: 10000 });
    await page.click('div[data-testid="reply"]');

    await page.waitForSelector('div[aria-label="Tweet text"]', { timeout: 10000 });
    await page.type('div[aria-label="Tweet text"]', comment, { delay: 10 });

    await page.click('div[data-testid="tweetButton"]');
    await page.waitForTimeout(2000);

    console.log('✅ Reply sent!');
    res.send('✅ Reply sent!');
  } catch (err) {
    console.error('❌ Failed to reply:', err.message);
    res.status(500).send(`❌ Failed to reply: ${err.message}`);
  } finally {
    await browser.close();
  }
});

app.get('/', (req, res) => res.send('🐦 Twitter Puppeteer Reply Bot is running!'));
app.listen(3000, () => console.log('🚀 Server running at http://localhost:3000/'));
