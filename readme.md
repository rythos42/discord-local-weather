References

- https://discord.com/developers/docs/interactions/receiving-and-responding
- https://api-docs.iqair.com/
- https://dashboard.iqair.com/
- https://discord.com/developers/docs/tutorials/hosting-on-cloudflare-workers
- https://github.com/discord/cloudflare-sample-app/
- https://dash.cloudflare.com/

Installation

- Install Wrangler with above instructions
- Get API key from AirVisual
- Run `npx wrangler secret put AIR_VISUAL_API_KEY`, need these secrets in CloudFlare Workers
  - DISCORD_TOKEN
  - DISCORD_PUBLIC_KEY
  - DISCORD_APPLICATION_ID
  - AIR_VISUAL_API_KEY
- Run `npm run publish`
- Run `npm run register`

Todo

- Possibly need to install ngrok to test locally, didn't do that, but the edit, publish, test loop isn't terrible.
- Possibly need to defer the interaction, had been doing that initially with Discord.js, but this serverless process can't use Discord.js so have to figure it out manually.
