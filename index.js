const puppeteer = require('puppeteer');
const $ = require('cheerio');
const fs = require('fs');

const MongoClient = require('mongodb').MongoClient;
const dburl = "mongodb://localhost:27017/";


/////////////////////////////////////////////////////////////

const url = "https://ca.indeed.com/jobs?q=software+developer&l=Toronto%2C+ON&radius=50";

(async () => {
    const browser = await puppeteer.launch({headless: false})
    const page = await browser.newPage()
    await page.goto(url);


    const result = await page.evaluate(() => {
        function cleanString(str) {
            str = str.split('');
            if(str[1] == 'n') str.splice(0, 2);
            str = str.join('').toString().trim();
            return str;
        }

        console.log(document.querySelectorAll('.title a'));

        let titleArr = [];

        //Start web scraping from the first page to 40th page and 15 jobs on each page =>15*40=600 job infor in total
        for (let pageNum = 1;pageNum <=2 ; pageNum++){
          for(let i = 0;i < document.querySelectorAll('.title a').length ; i++) { //i < document.querySelectorAll('.title a').length
              let job = {
                  title: cleanString(document.querySelectorAll('.title')[i].textContent),
                  company: cleanString(document.querySelectorAll('.company')[i].textContent),
                  desc: cleanString(document.querySelectorAll('.summary')[i].textContent),
                  location: cleanString(document.querySelectorAll('.location')[i].textContent),
                  ratings: cleanString(document.querySelectorAll('.sjcl')[i].querySelector(".ratingsContent") == undefined ? 'N/A': document.querySelectorAll('.sjcl')[i].querySelector(".ratingsContent").textContent),
                  link: 'https://www.indeed.com' + document.querySelectorAll('.title a')[i].getAttribute('href'),
              }
              titleArr.push(job);
            }

            document.querySelector('[aria-label="Next"]').click();

        }
        return titleArr;
    })

    fs.writeFile('jobs.json', JSON.stringify(result), 'utf8', (err) => {
        if(err) console.error(err);
    })


    MongoClient.connect(dburl, function(err, db) {
      if (err) throw err;
      var dbo = db.db("jobDB");
      dbo.collection("jds").insertMany(result, function(err, res) {
        if (err) throw err;
        console.log("Number of documents inserted: " + res.insertedCount);
        db.close();
      });

      });

})()
