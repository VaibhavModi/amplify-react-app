const STEAM_API_BASE = 'https://api.steampowered.com';
const MAX_FEATURED_GAMES = 5;

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

  if (!apiKey) {
    throw new Error('missing-steam-api-key');
  }

  return { apiKey };
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
  const url = formatSteamApiUrl(pathname, params);
  const response = await fetch(url);

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

function pickFeaturedGames(ownedGames, recentGames) {
  const recentIds = new Set(recentGames.map((game) => game.appid));
  return ownedGames
    .slice()
    .sort((left, right) => {
      const leftRecent = recentIds.has(left.appid);
      const rightRecent = recentIds.has(right.appid);

      if (leftRecent !== rightRecent) {
        return leftRecent ? -1 : 1;
      }

      return (right.playtime_forever || 0) - (left.playtime_forever || 0);
    })
    .slice(0, MAX_FEATURED_GAMES);
}

async function getAchievementSummary(apiKey, steamId, games) {
  const summaries = await Promise.all(
    games.map(async (game) => {
      try {
        const data = await fetchSteam('/ISteamUserStats/GetPlayerAchievements/v1/', {
          key: apiKey,
          steamid: steamId,
          appid: game.appid,
        });
        const achievements = data?.playerstats?.achievements;

        if (!Array.isArray(achievements) || achievements.length === 0) {
          return [game.appid, null];
        }

        const unlocked = achievements.reduce(
          (count, achievement) => count + (achievement?.achieved ? 1 : 0),
          0
        );

        return [game.appid, { unlocked, total: achievements.length }];
      } catch {
        return [game.appid, null];
      }
    })
  );

  return Object.fromEntries(summaries.filter(([, summary]) => summary));
}

export default async function handler(request, response) {
  if (request.method === 'OPTIONS') {
    return json(response, 204, {});
  }

  if (request.method !== 'GET') {
    return json(response, 405, { error: 'method-not-allowed' });
  }

  try {
    const { apiKey } = readRequiredConfig();
    const requestedProfile = String(request.query.profile || '').trim();

    if (!requestedProfile) {
      return json(response, 400, { error: 'missing-profile' });
    }

    const steamId = await resolveSteamId(apiKey, requestedProfile);

    const [playerSummaryData, ownedGamesData, recentGamesData] = await Promise.all([
      fetchSteam('/ISteamUser/GetPlayerSummaries/v2/', {
        key: apiKey,
        steamids: steamId,
      }),
      fetchSteam('/IPlayerService/GetOwnedGames/v1/', {
        key: apiKey,
        steamid: steamId,
        include_appinfo: true,
        include_played_free_games: true,
      }),
      fetchSteam('/IPlayerService/GetRecentlyPlayedGames/v1/', {
        key: apiKey,
        steamid: steamId,
        count: MAX_FEATURED_GAMES,
      }),
    ]);

    const profile = playerSummaryData?.response?.players?.[0] ?? null;
    const ownedGames = ownedGamesData?.response?.games ?? [];
    const recentlyPlayed = recentGamesData?.response?.games ?? [];
    const featuredGames = pickFeaturedGames(ownedGames, recentlyPlayed);
    const achievementsByApp = await getAchievementSummary(apiKey, steamId, featuredGames);

    return json(response, 200, {
      profile,
      ownedGames,
      recentlyPlayed,
      achievementsByApp,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown-error';
    const statusCode = message === 'missing-steam-api-key'
      ? 500
      : message === 'steam-profile-not-found'
        ? 404
        : message.startsWith('steam-request-failed:')
          ? 502
          : 500;

    return json(response, statusCode, {
      error: message,
    });
  }
}
