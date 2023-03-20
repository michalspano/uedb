import fetch from 'cross-fetch';
import Sentiment from 'sentiment';
import DiscordJS, { ColorResolvable } from 'discord.js';

// constants
const API_URL: string = 'https://type.fit/api/quotes';
const HEADER_COLOR: ColorResolvable = '#5E81AC';
export const [OK_EMOJI, SUPPORT_EMOJI]: [string, string] = ['🤖', '🤗'];
// we're using an url to an image hosted on GitHub (a local file won't work, and would be posted as an attachment)
const EMBED_ICON: string = 'https://github.com/michalspano/uedb/blob/main/images/icon.png?raw=true';

/* Excluded words:
 * we create a buffer with words that needn't be evalued.
 * for instance, the word 'discord' implies something negative, however,
 * in case of a discord server, the word 'discord' is a (positive) word. */
export const isCurrentUserSad = (msg: string): boolean => {
    const EXCLUDED: string[] = [
        'discord', '.' // ...
    ];

    // omit the excluded words from the message
    msg = msg.split(' ').filter(word => !EXCLUDED.includes(strictlyAlphaNumeric(word).toLowerCase())).join(' ');
    const sentiment: Sentiment = new Sentiment();
    return sentiment.analyze(msg).score < 0;
}

// Note: the potentially returned data of null is handled in the parseQuote function of index.ts
const fetchData = async (): Promise<{ [key: string | symbol]: any }> => {
    try {
        const response: Response = await fetch(API_URL);
        return await response.json();
    } catch (error) {
        return Promise.reject(error);
    }
}

export const getRandomQuote = async (): Promise<{ [key: string]: string }> => {
    const data = await fetchData();
    return data[Math.floor(Math.random() * data.length)];
}

// This function returns an embed to display a quote in the Discord's Embed format.
// It takes in two parameters: text and author, which are the quote and the author of the quote, respectively.

export const embmedQuote = (text: string, author: string): DiscordJS.MessageEmbed => {
    return new DiscordJS.MessageEmbed()
        .setTitle('A motivation quote tailored for you!')
        .setFields([
            { name: '🌅 Quote', value: `"${text}"`, inline: true },
            { name: '👤 Author', value: author, inline: true }
        ])
        .setColor(HEADER_COLOR)
        .setTimestamp()
}

// This function returns an embed object that contains the usage instructions for the bot.
// It takes a bot ID as a parameter, which is used to tag the bot in the instructions.
// The function returns an embed object that contains a title, a field, and an image.
// The field contains the instructions for how to begin using the bot.

export const embedUsage = (botID: string): DiscordJS.MessageEmbed => {
    return new DiscordJS.MessageEmbed()
        .setTitle(`🔧 Usage`)
        .setFields([
            { name: '🤖 Getting started', value: `Tag <@${botID}> to start!` },
            { name: '🙂 Mood check', value: "I'll be able to detect your **mood** and act accordingly in every message sent.", inline: true }
        ])
        .setImage(EMBED_ICON)
        .setColor(HEADER_COLOR)
        .setTimestamp()
}

// Removes all non-alphanumeric characters from the input string.
const strictlyAlphaNumeric = (str: string): string => {
    if (typeof str !== 'string') {
        throw new TypeError('strictlyAlphaNumeric expects a string');
    }

    return str.replace(/[^a-zA-Z0-9]/g, '');
}