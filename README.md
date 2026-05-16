# HaxFootball Discord

Discord bot for the BFL community.

## Setup

```sh
pnpm install
cp .env.example .env
pnpm run commands:deploy
pnpm run dev
```

Required environment variables:

- `DISCORD_BOT_TOKEN`
- `DISCORD_CLIENT_ID`
- `DISCORD_GUILD_ID`
- `HAXFOOTBALL_API_URL`
- `HAXFOOTBALL_API_KEY`
- `LANGUAGE` (`pt` in production)

## Production

Production runs on the Oracle host as `haxfootball-discord.service` from:

```sh
/home/ubuntu/haxfootball-discord
```

The service reads:

```sh
/home/ubuntu/haxfootball-discord/.env.production
```

Pushes to `main` run CI and deploy through `.github/workflows/ci.yml`. The
deploy job fetches the exact pushed SHA on Oracle, installs dependencies,
builds, installs the systemd unit, deploys Discord guild commands, and restarts
the systemd service.

Required GitHub Actions secrets:

- `ORACLE_SSH_HOST`
- `ORACLE_SSH_USER`
- `ORACLE_SSH_PRIVATE_KEY`
- `ORACLE_SSH_KNOWN_HOSTS`

## Registration

Run `/admin registration-panel` in the target Discord channel. The bot posts a
public registration panel with account registration and forgot-password
buttons. Users click the registration button, fill the modal, and the bot
creates an account through `@haxbrasil/haxfootball-api-sdk`. Users can also
click the forgot-password button to open a password change modal for the BFL
account linked to their Discord user.

The bot is stateless. HaxFootball API remains the source of truth.

The registration panel is posted as an embed and can be customized per command
run:

- `title`
- `description`
- `button_label`
- `forgot_password_button_label`
- `color` as a hex color such as `#00AEEF`
- `image_url`
- `thumbnail_url`

User-facing Discord text is localized with Lingui. Source strings and tests use
English; production should set `LANGUAGE=pt`.

## Architecture

The bot is organized around feature modules. Each module owns its Discord
commands, component ids, interaction handlers, and application use cases. The
composition root wires modules to infrastructure adapters such as the
HaxFootball API SDK.

Future persistence or agent runtimes should be added as infrastructure
adapters behind ports used by feature modules, rather than imported directly
from Discord handlers.
