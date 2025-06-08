const puppeteer = require('puppeteer');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

app.post('/reply', async (req, res) => {
  const { url, reply } = req.body;
  if (!url || !reply) {
    return res.status(400).send('Missing tweet URL or reply message');
  }

  const cookies = JSON.parse(fs.readFileSync('cookies.json'));

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setCookie(...cookies);
  await page.goto(url, { waitUntil: 'networkidle2' });

  try {
    await page.waitForSelector('div[data-testid="reply"]', { timeout: 10000 });
    await page.click('div[data-testid="reply"]');

    await page.waitForSelector('div[aria-label="Tweet text"]', { timeout: 10000 });
    await page.type('div[aria-label="Tweet text"]', reply, { delay: 10 });

    await page.click('div[data-testid="tweetButton"]');
    await page.waitForTimeout(2000);

    console.log('✅ Reply sent!');
    res.send('✅ Reply sent!');
  } catch (err) {
    console.error('❌ Failed to reply:', err.message);
    res.status(500).send('❌ Failed to reply');
  } finally {
    await browser.close();
  }
});

app.get('/', (req, res) => res.send('Twitter Puppeteer Reply Bot is running!'));
app.listen(3000, () => console.log('🚀 Server running at http://localhost:3000'));
