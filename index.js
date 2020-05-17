const puppeteer = require('puppeteer');
const fs = require('fs');
const http = require('http');

const HOME_URL = 'https://soap2day.is';

const Runner = async () => {
    // await downloadTopImdb();
    await downloadMovieMetadata('movies_top_imdb.txt')
};

(async () => await Runner())()


async function downloadMovieMetadata(movieUrlsPath) {
    const urlStream = fs.createReadStream(movieUrlsPath);
    const { browser, page } = await setupSession(HOME_URL);
    let count = 0;
    fs.appendFile('movies_meta_data.json', '[\n', (err) => {
        if (err) throw err;
    });
    try {
        for await (const chunk of urlStream) {
            count++;
            const links = chunk.toString().split("\n");
            console.log('Processing chunk ', count);
            for (let link of links) {
                console.log(link);
                const data = await getMovieMetadata(page, link);
                fs.appendFile('movies_meta_data.json', JSON.stringify(data) + ",\n", (err) => {
                    if (err) {
                        console.log('Failed writing ', link);
                    }
                })
                await waitForSecs(Math.ceil(5 + Math.random(1) * 10));
            }
            await waitForSecs(Math.ceil(30 + Math.random(1) * 10));
        }
    } catch (e) {
        console.log(e);
        await browser.close();
    }
    fs.appendFile('movies_meta_data.json', ']\n', (err) => {
        if (err) throw err;
    });
    console.log('Done saving meta data');
    await browser.close();
}

async function getMovieMetadata(page, url) {
    console.log('Fetching ', url);
    await page.goto(url);
    const directors = await page.$('.col-lg-7 p:nth-child(5)');
    const cover = await page.$('.visible-lg img');
    const actors = await page.$('.col-lg-7 p:nth-child(9)');
    const genre = await page.$('.col-lg-7 p:nth-child(13)');
    const releaseDate = await page.$('.col-lg-7 p:nth-child(17)');
    const imdbRating = await page.$('.col-lg-7 div p:nth-child(4)');
    const story = await page.$('#wrap');
    return ({
        link: url,
        directors: await directors.evaluate(directors => directors.innerText.split(',')),
        cover: await cover.evaluate(cover => cover.src),
        actors: await actors.evaluate(actors => actors.innerText.split(',')),
        genre: await genre.evaluate(genre => genre.innerText.split(',')),
        releaseDate: await releaseDate.evaluate(releaseDate => releaseDate.innerText),
        imdbRating: await imdbRating.evaluate(rating => rating.innerText.split('from')[0].trim()),
        story: await story.evaluate(story => story.innerText)
    });
}

async function downloadTopImdb() {

    const HOME_URL = 'https://soap2day.is';
    const IMDB_TOP = HOME_URL + '/movielist/sort/imdb';

    const { browser, page } = await setupSession(IMDB_TOP);
    let movies = await page.$$eval('.thumbnail .img-group a', links => links.map(link => link.href));
    let nextPageLink = await page.$('.active+ li a');
    let currentPage = await nextPageLink.evaluate(nextLink => nextLink.innerText);;
    try {
        while (nextPageLink) {
            currentPage = await nextPageLink.evaluate(nextLink => nextLink.innerText);
            console.log('Processing page..', currentPage);
            await nextPageLink.click();
            await page.waitForNavigation();
            movies = await page.$$eval('.thumbnail .img-group a', links => links.map(link => link.href));
            await saveMovieLinks(movies, currentPage);
            nextPageLink = await page.$('.active+ li a');
        }
    } catch (e) {
        console.log('Failed fetching links at page ', currentPage);
        await browser.close();
    }
    await browser.close();
}

async function saveMovieLinks(movies, pageNo) {
    await fs.appendFile('movies_top_imdb.txt', movies.join('\n') + '\n', (err) => {
        if (err) throw err;
        console.log('Done adding links from page..', pageNo);
    });
}


async function getAllThumbsInPage(page) {
    const thumbs = await page.$$('.thumbnail');
    return thumbs;
}


async function setupSession(url) {
    const browser = await puppeteer.launch();
    const page = (await browser.pages())[0];
    await page.setViewport({ width: 1280, height: 800 })
    await page.goto(url);
    await browser.waitForTarget(target => target.url().match(new RegExp(url + '?')));
    await page.waitForNavigation()
    return { browser: browser, page: page }
}


async function waitForSecs(seconds) {
    return (new Promise(function (res, rej) {
        setTimeout(() => {
            console.log('waited for ', seconds, ' seconds');
            res(0);
        }, seconds * 1000);
    }));
}