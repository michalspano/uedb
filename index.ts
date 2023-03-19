#!/usr/bin/env ts-node

import dotenv from 'dotenv';
import * as utils from './utils/utils';
import DiscordJS, { Intents } from 'discord.js';

require('./utils/https');   // instantiate the https monitor
dotenv.config();            // setup the dotenv variables

// instantiate the DiscordJS Client
const client: DiscordJS.Client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
});

// to detect when the bot is ready
client.on('ready', () => {
    console.log(`${client.user!.tag} is online!`)
    client.user?.setActivity('Feelings...',
                            { type: 'PLAYING' }
    );
});

/* Function to parse a new quote from the API call
 * we detect fetched data that is null and recursively call it again until valid data is found */

const parseQuote: Function = (channel: any): void => {
    const quote: Promise<{ [key: string]: string }> = utils.getRandomQuote();
    quote.then((data: { [key: string]: string }) => {
        if (quote !== null) channel.send({
            embeds: [utils.embmedQuote(data.text, data.author)]
        });
        else parseQuote(channel);
    });
}

// detect when a new message is sent
client.on('messageCreate', async (message: DiscordJS.Message): Promise<void> => {
    if (message.author.bot) return;

    // detect when the bot is tagged - show the usage
    if (message.mentions.has(client.user!)) {
        await message.react(utils.OK_EMOJI);
        await message.reply({
            embeds: [utils.embedUsage(client.user!.id)]
        });
    }   

    // scan the message and try to detect the user's mood
    else if (utils.isCurrentUserSad(message.content)) {
        await message.react(utils.SUPPORT_EMOJI);
        await message.reply('I am here!');
        parseQuote(message.channel);
    }
});

client.login(process.env.TOKEN);
