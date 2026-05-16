import { Client, Events, GatewayIntentBits } from "discord.js";
import { readConfig } from "./config";
import { createBotApplication } from "./core/application";
import { consoleLogger } from "./core/logger";
import { initI18n } from "./i18n";
import { createHaxFootballServices } from "./infrastructure/haxfootball-api";
import { createModules } from "./modules";

initI18n(process.env.LANGUAGE);

const config = readConfig();
const application = createBotApplication(createModules(), {
  haxFootball: createHaxFootballServices(config),
  logger: consoleLogger
});
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient) => {
  console.info(`Logged in as ${readyClient.user.tag}`);
});

application.bind(client);

process.once("SIGINT", () => shutdown());
process.once("SIGTERM", () => shutdown());

await client.login(config.discordBotToken);

function shutdown(): void {
  client.destroy();
  process.exit(0);
}
