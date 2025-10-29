const scrapeCategory = async (browser, url) =>
  new Promise(async (resole, reject) => {
    try {
      let page = await browser.newPage();
      console.log(">> Mở tab mới...");
      await page.goto(url);
      console.log(">> Truy cập vào " + url);
      await page.waitForSelector("#webpage");
      console.log(">> Đã load xong...");

      const dataCategory = await page.$$eval(".pt123__nav > ul > li", (els) => {
        dataCategory = els.map((el) => {
          return {
            category: el.querySelector("a").innerText,
            link: el.querySelector("a").href,
          };
        });
        return dataCategory;
      });

      console.log(dataCategory);
      await page.close();
      console.log(">> Tab đã đóng");
      resole();
    } catch (error) {
      console.log("Lỗi ở scrapeCategory: " + error);
      reject(error);
    }
  });

module.exports = {
  scrapeCategory,
};
