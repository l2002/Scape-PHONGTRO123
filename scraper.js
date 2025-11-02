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

      await page.close();
      console.log(">> Tab đã đóng");
      resole(dataCategory);
    } catch (error) {
      console.log("Lỗi ở scrapeCategory: " + error);
      reject(error);
    }
  });

const scraper = (browser, url) =>
  new Promise(async (resolve, reject) => {
    try {
      const newPage = await browser.newPage();
      console.log(">> Đã mở tab mới...");
      await newPage.goto(url, { waitUntil: "networkidle2" });
      console.log(">> Truy cập vào " + url);

      // Chờ header xuất hiện thật sự
      await newPage.waitForSelector(
        "header.mt-2.mb-3 h1.fs-4.fw-medium.mb-2.lh-sm"
      );
      console.log(">> Đã load xong header...");

      const scrapeData = {};

      // Lay header
      const headerData = await newPage.$eval("header.mt-2.mb-3", (el) => {
        const h1 = el.querySelector("h1.fs-4.fw-medium.mb-2.lh-sm");
        const p = el.querySelector("p");
        return {
          title: h1 ? h1.innerText.trim() : null,
          des: p ? p.innerText.trim() : null,
        };
      });

      scrapeData.header = headerData;

      // Lay link detail item
      const detailLinks = await newPage.$$eval(".post__listing > li", (els) => {
        detailLinks = els.map((el) => {
          return el.querySelector("h3 > a").href;
        });
        return detailLinks;
      });

      const scraperDetail = async (link) =>
        new Promise(async (resolve, reject) => {
          try {
            const pageDetail = await browser.newPage();
            console.log(">> Truy cập:", link);

            await pageDetail.goto(link, { waitUntil: "networkidle2" });

            await pageDetail.waitForSelector?.("img", { timeout: 15000 });

            // ép tất cả item visible (phòng khi carousel chỉ render item active)
            await pageDetail.evaluate(() => {
              document
                .querySelectorAll("#carousel_Photos .carousel-item")
                .forEach((item) => item.classList?.add("active"));
            });

            // lấy danh sách ảnh
            const images = await pageDetail.$$eval(
              "#carousel_Photos .carousel-item",
              (els) => {
                images = els.map((el) => {
                  return el.querySelector("img")?.src;
                });
                // Lọc ra những phần tử hợp lệ (không phải false, null, undefined, v.v...),
                return images.filter(Boolean);
              }
            );

            // console.log("Số ảnh:", images.length);
            console.log(images);

            // Lay header detail
            // ==== LẤY HEADER ====
            const header = await pageDetail.$eval(
              "header.border-bottom.pb-4.mb-4",
              (el) => {
                return {
                  title: el.querySelector("h1")?.innerText?.trim() || "",
                  star:
                    el
                      .querySelector(".star")
                      ?.className.replace(/^\D+/g, "")
                      ?.trim() || "",
                  badge: el.querySelector(".badge")?.innerText?.trim() || "",
                  price:
                    el.querySelector(".text-green")?.innerText?.trim() || "",
                  area:
                    el.querySelector("sup")?.parentElement?.innerText?.trim() ||
                    "",
                  updatedAt: el.querySelector("time")?.innerText?.trim() || "",
                };
              }
            );

            const attributes = await pageDetail.$$eval("table tr", (rows) => {
              const result = {};
              rows.forEach((row) => {
                const key = row
                  .querySelector("td:first-child")
                  ?.innerText?.trim();
                const value = row
                  .querySelector("td:last-child")
                  ?.innerText?.trim();
                if (key && value) result[key.replace(":", "")] = value;
              });
              return result;
            });

            // detailData.images = images;
            // detailData.header = header;
            // detailData.attributes = attributes;

            // console.log(detailData);

            const mainContentHeader = await pageDetail.$eval(
              "div",
              (el) => el.querySelector("h2").innerText
            );
            const mainContentContent = await pageDetail.$$eval(
              "div > p",
              (els) => els.map((el) => el.innerText)
            );

            // console.log(mainContentHeader);
            // console.log(mainContentContent);

            // Thong tin lien he
            const contact = await pageDetail.$eval(
              "div.bg-white.shadow-sm.rounded.p-3.mb-3.d-none.d-lg-block",
              (el) => {
                return {
                  nameContact:
                    el
                      .querySelector("span.fs-5.fw-medium")
                      ?.innerText?.trim() || "",
                  phoneContact:
                    el
                      .querySelector('a[href^="tel:"]')
                      ?.getAttribute("href")
                      ?.replace("tel:", "")
                      ?.trim() || "",
                  zalo:
                    el
                      .querySelector('a[href^="https://zalo.me/"]')
                      ?.href?.trim() || "",
                };
              }
            );

            const detailData = {
              header,
              images,
              attributes: {
                district: attributes["Quận huyện"] || "",
                province: attributes["Tỉnh thành"] || "",
                address: attributes["Địa chỉ"] || "",
                hashtag: attributes["Mã tin"] || "",
                datePosted: attributes["Ngày đăng"] || "",
                expiryDate: attributes["Ngày hết hạn"] || "",
              },
              contact,
            };

            // console.log(contact);
            // console.log(detailData);

            await pageDetail.close();
            console.log(">> Đã đóng tab:", link);
            resolve(detailData);
          } catch (error) {
            console.log("Lấy data detail lỗi:", error.message);
            reject(error);
          }
        });

      const details = [];
      for (let link of detailLinks) {
        const detail = await scraperDetail(link);
        details.push(detail);
      }
      scrapeData.body = details;

      console.log(details);

      scrapeData.body = details;

      console.log(">> Trình duyệt đã đóng");
      resolve(details);
    } catch (error) {
      console.log("Lỗi ở scrapeController:", error.message);
      reject(error);
    }
  });

module.exports = {
  scrapeCategory,
  scraper,
};
