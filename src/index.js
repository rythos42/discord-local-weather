import { AutoRouter } from "itty-router";
import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from "discord-interactions";
import { getWeatherOutput } from "./commands/weather.js";

class JsonResponse extends Response {
  constructor(body, init) {
    const jsonBody = JSON.stringify(body);
    init = init || {
      headers: {
        "content-type": "application/json;charset=UTF-8",
      },
    };
    super(jsonBody, init);
  }
}

const router = AutoRouter();

router.get("/", (_, env) => {
  return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

router.post("/", async (request, env) => {
  try {
    console.log("Got a request.");
    const { isValid, interaction } = await server.verifyDiscordRequest(
      request,
      env
    );
    console.log("Checked signature.");
    if (!isValid || !interaction) {
      return new Response("Bad request signature.", { status: 401 });
    }
    console.log("Signature is good.");

    if (interaction.type === InteractionType.PING) {
      // The `PING` message is used during the initial webhook handshake, and is
      // required to configure the webhook in the developer portal.
      return new JsonResponse({
        type: InteractionResponseType.PONG,
      });
    }

    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
      console.log(
        "Received command '" + interaction.data.name.toLowerCase() + "'."
      );
      switch (interaction.data.name.toLowerCase()) {
        case "weather": {
          console.log("Processing 'weather' command.");
          const weather = await getWeatherOutput(env.AIR_VISUAL_API_KEY);
          console.log(
            `Got weather data and returning ${weather.length} embeds`
          );
          return new JsonResponse({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              embeds: weather,
            },
          });
        }
        default:
          return new JsonResponse({ error: "Unknown Type" }, { status: 400 });
      }
    }

    console.error("Unknown Type");
    return new JsonResponse({ error: "Unknown Type" }, { status: 400 });
  } catch (ex) {
    console.error("Error: " + JSON.stringify(ex));
    return new JsonResponse({ error: "Unknown Type" }, { status: 500 });
  }
});

router.all("*", () => new Response("Not Found.", { status: 404 }));

async function verifyDiscordRequest(request, env) {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  const body = await request.text();
  const isValidRequest =
    signature &&
    timestamp &&
    (await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY));
  if (!isValidRequest) {
    return { isValid: false };
  }

  return { interaction: JSON.parse(body), isValid: true };
}

const server = {
  verifyDiscordRequest,
  fetch: router.fetch,
};

export default server;
