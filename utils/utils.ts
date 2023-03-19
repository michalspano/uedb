import fetch from 'cross-fetch';
import Sentiment from 'sentiment';
import DiscordJS, { ColorResolvable } from 'discord.js';

// constants
const API_URL: string = 'https://type.fit/api/quotes';
const HEADER_COLOR: ColorResolvable = '#5E81AC';
export const [OK_EMOJI, SUPPORT_EMOJI]: [string, string] = ['🤖', '🤗'];
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

const fetchData = async (): Promise<{ [key: string | symbol]: any }> => {
    const response = await fetch(API_URL);
    return await response.json();
}

export const getRandomQuote = async (): Promise<{ [key: string]: string }> => {
    const data = await fetchData();
    return data[Math.floor(Math.random() * data.length)];
}

export const embmedQuote = (text: string, author: string): DiscordJS.MessageEmbed => {
    return new DiscordJS.MessageEmbed()
        .setTitle('A motivation quote tailored for you!')
        .setFields([
            { name: '🌅 Quote', value: `"${text}"`, inline: true },
            { name: '👤 Author', value: author, inline: true }
        ])
        .setColor(HEADER_COLOR)
        .setImage(EMBED_ICON)
        .setTimestamp()
}

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

const strictlyAlphaNumeric = (str: string): string => {
    return str.replace(/[^a-zA-Z0-9]/g, '');
}