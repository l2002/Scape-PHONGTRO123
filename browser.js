const pupeteer = require("puppeteer");

const startBrowser = async () => {
  let browser;
  try {
    browser = pupeteer.launch({
      headless: true,
      args: ["--disable-setuid-sandbox"],
      ignoreHttpErrors: true,
    });
  } catch (error) {
    console.log("Không tạo được browser: " + error);
  }
  return browser;
};

module.exports = startBrowser;
