import { readConfig } from "./config";
import { createBotApplication } from "./core/application";
import { consoleLogger } from "./core/logger";
import { deployGuildCommands } from "./deploy-commands";
import { initI18n } from "./i18n";
import { createModules } from "./modules";

initI18n(process.env.LANGUAGE);

const config = readConfig();
const application = createBotApplication(createModules(), {
  haxFootball: {
    accountRegistration: {
      async createAccount() {
        throw new Error("Command deployment does not use API services");
      },
      async resetPassword() {
        throw new Error("Command deployment does not use API services");
      }
    },
    discordPermissions: {
      async hasPermission() {
        throw new Error("Command deployment does not use API services");
      }
    }
  },
  logger: consoleLogger
});

await deployGuildCommands(config, application);

console.info("Discord guild commands deployed.");
