const STEAM_API_BASE = 'https://api.steampowered.com';

function json(response, statusCode, body) {
  response.status(statusCode).setHeader('Content-Type', 'application/json');
  response.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.send(JSON.stringify(body));
}

function readRequiredConfig() {
  const apiKey = process.env.STEAM_API_KEY?.trim();
  const profileId = process.env.STEAM_PROFILE_ID?.trim();
  const showcaseAppIds = (process.env.STEAM_SHOWCASE_APPIDS || '')
    .split(',')
    .map((value) => value.trim())
    .filter((value) => /^\d+$/.test(value))
    .map((value) => Number(value));

  if (!apiKey) {
    throw new Error('missing-steam-api-key');
  }

  if (!profileId) {
    throw new Error('missing-steam-profile-id');
  }

  if (showcaseAppIds.length === 0) {
    throw new Error('missing-showcase-appids');
  }

  return { apiKey, profileId, showcaseAppIds };
}

function formatSteamApiUrl(pathname, params) {
  const url = new URL(`${STEAM_API_BASE}${pathname}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

async function fetchSteam(pathname, params) {
  const response = await fetch(formatSteamApiUrl(pathname, params));

  if (!response.ok) {
    throw new Error(`steam-request-failed:${response.status}`);
  }

  return response.json();
}

async function resolveSteamId(apiKey, profileId) {
  if (/^\d{17}$/.test(profileId)) {
    return profileId;
  }

  const data = await fetchSteam('/ISteamUser/ResolveVanityURL/v1/', {
    key: apiKey,
    vanityurl: profileId,
  });

  if (data?.response?.success !== 1 || !data?.response?.steamid) {
    throw new Error('steam-profile-not-found');
  }

  return data.response.steamid;
}

function buildShowcaseGames(showcaseAppIds, ownedGames, recentGames) {
  const ownedLookup = new Map(ownedGames.map((game) => [Number(game.appid), game]));
  const recentIds = new Set(recentGames.map((game) => Number(game.appid)));

  return showcaseAppIds
    .map((appid) => {
      const ownedGame = ownedLookup.get(Number(appid));

      if (!ownedGame) {
        return null;
      }

      return {
        appid: Number(ownedGame.appid),
        name: ownedGame.name,
        recentlyPlayed: recentIds.has(Number(ownedGame.appid)),
      };
    })
    .filter(Boolean);
}

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') {
    return json(response, 204, {});
  }

  if (request.method !== 'GET') {
    return json(response, 405, { error: 'method-not-allowed' });
  }

  try {
    const { apiKey, profileId, showcaseAppIds } = readRequiredConfig();
    const steamId = await resolveSteamId(apiKey, profileId);

    const [ownedGamesData, recentGamesData] = await Promise.all([
      fetchSteam('/IPlayerService/GetOwnedGames/v1/', {
        key: apiKey,
        steamid: steamId,
        include_appinfo: true,
        include_played_free_games: true,
      }),
      fetchSteam('/IPlayerService/GetRecentlyPlayedGames/v1/', {
        key: apiKey,
        steamid: steamId,
        count: 20,
      }),
    ]);

    const ownedGames = ownedGamesData?.response?.games ?? [];
    const recentlyPlayed = recentGamesData?.response?.games ?? [];
    const showcaseGames = buildShowcaseGames(showcaseAppIds, ownedGames, recentlyPlayed);

    return json(response, 200, {
      showcaseGames,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown-error';
    const statusCode = (
      message === 'steam-profile-not-found'
        ? 404
        : message.startsWith('missing-')
          ? 500
          : message.startsWith('steam-request-failed:')
            ? 502
            : 500
    );

    return json(response, statusCode, { error: message });
  }
}
