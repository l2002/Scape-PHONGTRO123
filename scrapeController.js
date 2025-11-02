const scrapers = require("./scraper");
const fs = require("fs");

const scrapeController = async (browserInstance) => {
  const url = "https://phongtro123.com/";
  const indexs = [1, 2, 3, 4];
  try {
    let browser = await browserInstance;
    const categories = await scrapers.scrapeCategory(browser, url);
    const selectedCategories = categories.filter((category, index) =>
      indexs.some((i) => i === index)
    );

    console.log(selectedCategories);

    let result1 = await scrapers.scraper(browser, selectedCategories[0].link);
    console.log("data =", result1);
    fs.writeFile("nhanguyencan.json", JSON.stringify(result1), (err) => {
      if (err) {
        console.log("Write file failed: " + err);
      }
      console.log("Data added successfully");
    });

    let result2 = await scrapers.scraper(browser, selectedCategories[1].link);
    console.log("data =", result2);
    fs.writeFile("canhochungcu.json", JSON.stringify(result2), (err) => {
      if (err) {
        console.log("Write file failed: " + err);
      }
      console.log("Data added successfully");
    });

    let result3 = await scrapers.scraper(browser, selectedCategories[2].link);
    console.log("data =", result3);
    fs.writeFile("canhomini.json", JSON.stringify(result3), (err) => {
      if (err) {
        console.log("Write file failed: " + err);
      }
      console.log("Data added successfully");
    });

    let result4 = await scrapers.scraper(browser, selectedCategories[3].link);
    console.log("data =", result4);
    fs.writeFile("canhodichvu.json", JSON.stringify(result4), (err) => {
      if (err) {
        console.log("Write file failed: " + err);
      }
      console.log("Data added successfully");
    });
    await browser.close();
  } catch (error) {
    console.log("Lỗi ở scrapeController: " + error);
  }
};

module.exports = scrapeController;
