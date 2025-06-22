import {
    Client,
    GatewayIntentBits,
    Message,
    OmitPartialGroupDMChannel,
} from "discord.js";
import { Shoukaku, Player, Connectors, Track, LoadType } from "shoukaku";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// see below for more info
const Nodes = [
    {
        name: "Localhost",
        url: "lavahatry4.techbyte.host:3000",
        auth: "NAIGLAVA-dash.techbyte.host",
    },
];

const shoukaku = new Shoukaku(new Connectors.DiscordJS(client), Nodes);

shoukaku.on("ready", (node) => console.log(`Node is Ready ${node}`));

const playerMap = new Map<string, Player>();

client.on(
    "messageCreate",
    async (message: OmitPartialGroupDMChannel<Message>) => {
        if (message.author.bot) return;

        if (message.content.startsWith("!play")) {
            const input = message.content.split(" ")[1];

            if (!input) return message.channel.send("No track to load");
            if (!message.member?.voice.channelId)
                return message.channel.send("Not in a voice channel");
            if (!message.guild) return message.channel.send("Guild not found");

            const node = shoukaku.getIdealNode();
            if (!node) return message.channel.send("No nodes available");

            const resolved = await node.rest.resolve(input);
            if (!resolved || resolved.loadType === LoadType.EMPTY)
                return message.channel.send("Track not found");

            const track = resolved.data as Track;
            let player = playerMap.get(message.guild.id);

            if (!shoukaku.connections.has(message.guild.id)) {
                player = await shoukaku.joinVoiceChannel({
                    guildId: message.guild.id,
                    shardId: message.guild.shardId,
                    channelId: message.member.voice.channelId,
                    deaf: true,
                });

                playerMap.set(message.guild.id, player);
            }

            if (!player) return message.reply("ไม่สามารถสร้าง player ได้");
            return player.playTrack({ track: { encoded: track.encoded } });
        }

        if (message.content.startsWith("!stop")) {
            if (!message.guild) return message.channel.send("Guild not found");

            const player = playerMap.get(message.guild.id);
            if (!player) return message.channel.send("No active player found");

            shoukaku.leaveVoiceChannel(message.guild.id);
            playerMap.delete(message.guild.id);
            return message.channel.send("Ok!");
        }

        if (message.content.startsWith("!nightcore")) {
            if (!message.guild) return message.channel.send("Guild not found");
            const player = playerMap.get(message.guild.id);
            if (!player) return message.channel.send("No active player found");

            await player.setTimescale({ speed: 1.2, pitch: 1.2, rate: 1.2 });
            return message.channel.send("Nightcore activated!");
        }
    },
);

client.login("");
