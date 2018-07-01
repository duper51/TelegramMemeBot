const TelegramBot = require('node-telegram-bot-api');
const cheerio = require("cheerio");
const request = require("request");
const fs = require("fs");

fs.readFile("config.json", function (err, contents) {
    if(err) {
        console.error("We encountered an issue while reading your config.json file. Are you sure it exists?");
        console.error(err);
    } else {
        let config = JSON.parse(contents.toString());
        if(config.token !== undefined) {
            initBot(config);
        } else {
            console.error("Your config doesn't posses a token option. Please add your telegram token there.");
        }
    }
});

function initBot(config) {
    // replace the value below with the Telegram token you receive from @BotFather
    const token = config.token;

    // Create a bot that uses 'polling' to fetch new updates
    const bot = new TelegramBot(token, {polling: true});

    // Matches "/echo [whatever]"
    bot.onText(/https:\/\/ifunny\.co\/fun\/([^\?\r\n]+)/, (msg, match) => {
        // 'msg' is the received Message from Telegram
        // 'match' is the result of executing the regexp above on the text content
        // of the message

        const chatId = msg.chat.id;
        const resp = match[1]; // the captured "whatever"
        bot.sendMessage(chatId, resp);
        let memeURL = "https://ifunny.co/fun/" + resp;

        request(memeURL, function (e, d, r) {
            if(e) {
                console.warn("Error reading meme page: " + memeURL);
                bot.sendMessage(chatId, "I'm having some trouble. Try again later");
                return;
            }
            let $ = cheerio.load(r);
            let possibleImage = $('.media__image');
            let possibleVideo = $("meta[property='og:video']");
            if(possibleVideo.length > 0) {
                bot.sendMessage(chatId, "vid");
                bot.sendMessage(chatId, possibleVideo.attr('content'));
            } else if(possibleImage.length > 0) {
                bot.sendMessage(chatId, "img");
                bot.sendMessage(chatId, possibleImage.attr('src'));
            } else {
                bot.sendMessage(chatId, "I couldn't find a meme at that URL! Sorry!")
            }
        });
    });
}