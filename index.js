const puppeteer = require('puppeteer');
const $ = require('cheerio');
const fs = require('fs');
// CHANGE THIS LINE TO CHANGE WHAT INDEED PAGE TO SCRAPE
const url = "https://ca.indeed.com/jobs?q=Electrician+Journeyman&l=Surrey%2C+BC&radius=0";

(async () => {
    const browser = await puppeteer.launch({headless: true})
    const page = await browser.newPage()
    await page.goto(url);


    const result = await page.evaluate(() => {
        function cleanString(str) {
            str = str.split('');
            if(str[1] == 'n') str.splice(0, 2);
            str = str.join('').toString().trim();
            return str;
        }

        let titleArr = [];

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
        return titleArr;
    })

    fs.writeFile('jobs.json', JSON.stringify(result), 'utf8', (err) => {
        if(err) console.error(err);
    })

})()
