const http = require("http");
const express = require("express");
const puppeteer = require("puppeteer");
const moment = require("moment");
const cors = require("cors");
const bodyParser = require("body-parser");
const router = express.Router();
const app = express();
const port = 3000;
const server = http.createServer(app);

app.use(cors());

let month = moment().format("MM");
let lastMonth = moment().subtract(1, "month").format("MM");

let year = moment().format("YYYY");
let getSkorBulanan = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto("http://evaluasi.badilum.mahkamahagung.go.id/", {
      waitUntil: "networkidle0",
      timeout: 0,
    });
    await page.waitForSelector(
      ".table.table-hover.table-striped.table-td-valign-middle.mx-auto.w-auto",
      {
        visible: true,
      }
    );
    await page.select("select#kategori", "1");
    await page.select("select#kelas", "4");
    await page.select("select#bulan_awal", month);
    await page.select("select#tahun_awal", year);
    await page.select("select#bulan_akhir", month);
    await page.select("select#tahun_akhir", year);

    await page.evaluate(() =>
      document.querySelector(".btn.btn-sm.btn-success.m-r-5").click()
    );

    await new Promise((r) => setTimeout(r, 2000));

    const rows = await page.$$("#TabelData tbody tr");

    let responseMessage;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const pn = await row.$eval(
        "td:nth-child(4) div a",
        (element) => element.textContent
      );

      const nomor = await row.$eval(
        "td:nth-child(1) div",
        (element) => element.textContent
      );

      const nilai = await row.$eval(
        "td:nth-child(9) div b",
        (element) => element.textContent
      );

      if (pn === "Pengadilan Negeri Negara") {
        responseMessage = {
          jenis: "bulan sekarang",
          peringkat: nomor,
          skor: nilai,
        };
      }
    }
    await browser.close();
    return responseMessage;
  } catch (error) {
    responseMessage = {
      jenis: "bulan sekarang",
      peringkat: "0",
      skor: "Koneksi terputus",
    };
    await browser.close();
    return responseMessage;
  }
};

let getSkorBulanLalu = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto("http://evaluasi.badilum.mahkamahagung.go.id/", {
      waitUntil: "networkidle0",
      timeout: 0,
    });
    await page.waitForSelector(
      ".table.table-hover.table-striped.table-td-valign-middle.mx-auto.w-auto",
      {
        visible: true,
      }
    );
    await page.select("select#kategori", "1");
    await page.select("select#kelas", "4");
    await page.select("select#bulan_awal", lastMonth);
    await page.select("select#tahun_awal", year);
    await page.select("select#bulan_akhir", lastMonth);
    await page.select("select#tahun_akhir", year);

    await page.evaluate(() =>
      document.querySelector(".btn.btn-sm.btn-success.m-r-5").click()
    );

    await new Promise((r) => setTimeout(r, 2000));

    const rows = await page.$$("#TabelData tbody tr");

    let responseMessage;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const pn = await row.$eval(
        "td:nth-child(4) div a",
        (element) => element.textContent
      );

      const nomor = await row.$eval(
        "td:nth-child(1) div",
        (element) => element.textContent
      );

      const nilai = await row.$eval(
        "td:nth-child(9) div b",
        (element) => element.textContent
      );

      if (pn === "Pengadilan Negeri Negara") {
        responseMessage = {
          jenis: "bulan lalu",
          peringkat: nomor,
          skor: nilai,
        };
      }
    }
    await browser.close();
    return responseMessage;
  } catch (error) {
    responseMessage = {
      jenis: "bulan lalu",
      peringkat: "0",
      skor: "Koneksi terputus",
    };
    await browser.close();
    return responseMessage;
  }
};

// getSkorBulanan().then((res) => console.log(res));
let eis = async () => {
  let bulan_sekarang = await getSkorBulanan();
  let bulan_lalu = await getSkorBulanLalu();

  return { now: bulan_sekarang, past: bulan_lalu };
};

app.get("/getdataeis", async (req, res) => {
  eis().then((msg) => {
    res.status(200).json({
      status: true,
      response: msg,
    });
  });
});

server.listen(port, () => {
  console.log(`EIS listening at port ${port}`);
});
