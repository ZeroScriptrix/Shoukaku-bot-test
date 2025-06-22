import { Client, GatewayIntentBits } from "discord.js";

const client = new Client({
    intents: [
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.Guilds
    ]
})

client.on("ready", () => console.log(`Logged in as ${client.user?.tag}`))

client.login("")
