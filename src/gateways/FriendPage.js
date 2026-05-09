import { useEffect, useMemo, useState } from 'react';

const DEFAULT_STEAM_PROXY_PATH = '/api/steam-profile';
const STEAM_PROXY_URL = process.env.REACT_APP_STEAM_PROXY_URL?.trim() || DEFAULT_STEAM_PROXY_PATH;
const STEAM_PROFILE_ID = process.env.REACT_APP_STEAM_PROFILE_ID?.trim();

const personaStates = {
  0: 'offline',
  1: 'online',
  2: 'busy',
  3: 'away',
  4: 'snooze',
  5: 'looking to trade',
  6: 'looking to play',
};

const formatHours = (minutes) => {
  const safeMinutes = Number(minutes) || 0;
  const hours = safeMinutes / 60;

  if (hours >= 100) {
    return `${Math.round(hours)} hrs`;
  }

  if (hours >= 10) {
    return `${hours.toFixed(1)} hrs`;
  }

  return `${hours.toFixed(hours >= 1 ? 1 : 0)} hrs`;
};

const formatInteger = (value) => new Intl.NumberFormat('en-US').format(Number(value) || 0);

const buildGameHeaderImage = (appid) => (
  `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`
);

const getStatusCopy = (profile) => {
  if (!profile) {
    return 'Steam signal unavailable';
  }

  if (profile.gameextrainfo) {
    return `online - playing ${profile.gameextrainfo}`;
  }

  return personaStates[profile.personastate] ?? 'offline';
};

const getAvatarInitials = (name) => (
  (name || 'Steam User')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
);

const getYearsOnSteam = (timestamp) => {
  if (!timestamp) {
    return null;
  }

  const createdAt = new Date(Number(timestamp) * 1000);
  const today = new Date();
  let years = today.getFullYear() - createdAt.getFullYear();
  const beforeAnniversary = (
    today.getMonth() < createdAt.getMonth()
    || (today.getMonth() === createdAt.getMonth() && today.getDate() < createdAt.getDate())
  );

  if (beforeAnniversary) {
    years -= 1;
  }

  return Math.max(0, years);
};

const normalizePayload = (payload) => {
  const profile = payload?.profile
    ?? payload?.player
    ?? payload?.response?.players?.[0]
    ?? null;
  const ownedGames = payload?.ownedGames
    ?? payload?.owned_games
    ?? payload?.games
    ?? payload?.ownedGamesResponse?.response?.games
    ?? [];
  const recentlyPlayed = payload?.recentlyPlayed
    ?? payload?.recently_played
    ?? payload?.recentGames
    ?? payload?.recentlyPlayedResponse?.response?.games
    ?? [];
  const achievementsByApp = payload?.achievementsByApp
    ?? payload?.achievements_by_app
    ?? payload?.achievementSummary
    ?? {};

  return {
    profile,
    ownedGames: Array.isArray(ownedGames) ? ownedGames : [],
    recentlyPlayed: Array.isArray(recentlyPlayed) ? recentlyPlayed : [],
    achievementsByApp: achievementsByApp && typeof achievementsByApp === 'object' ? achievementsByApp : {},
  };
};

const getFeaturedGames = (ownedGames, recentlyPlayed, achievementsByApp) => {
  const recentIds = new Set(recentlyPlayed.map((game) => game.appid));
  const recentLookup = new Map(recentlyPlayed.map((game) => [game.appid, game]));

  const merged = ownedGames
    .map((game) => ({
      ...game,
      ...recentLookup.get(game.appid),
      achievementSummary: achievementsByApp[game.appid] ?? null,
      isRecent: recentIds.has(game.appid),
    }))
    .sort((left, right) => {
      if (left.isRecent !== right.isRecent) {
        return left.isRecent ? -1 : 1;
      }

      return (right.playtime_forever || 0) - (left.playtime_forever || 0);
    });

  return merged.slice(0, 5);
};

async function loadSteamProfile(signal) {
  if (!STEAM_PROFILE_ID) {
    throw new Error('missing-config');
  }

  const baseUrl = STEAM_PROXY_URL.replace(/\/$/, '');
  const endpoint = `${baseUrl}?profile=${encodeURIComponent(STEAM_PROFILE_ID)}`;
  const response = await fetch(endpoint, { signal });

  if (!response.ok) {
    throw new Error(`steam-proxy-${response.status}`);
  }

  const payload = await response.json();
  return normalizePayload(payload);
}

export default function FriendPage() {
  const [steamData, setSteamData] = useState(null);
  const [loadingState, setLoadingState] = useState('loading');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    setLoadingState('loading');
    setLoadError('');

    loadSteamProfile(controller.signal)
      .then((payload) => {
        setSteamData(payload);
        setLoadingState('ready');
      })
      .catch((error) => {
        if (error.name === 'AbortError') {
          return;
        }

        setLoadingState('error');
        setLoadError(error.message);
      });

    return () => controller.abort();
  }, []);

  const profile = steamData?.profile ?? null;
  const ownedGames = steamData?.ownedGames ?? [];
  const recentlyPlayed = steamData?.recentlyPlayed ?? [];
  const achievementsByApp = steamData?.achievementsByApp ?? {};

  const featuredGames = useMemo(
    () => getFeaturedGames(ownedGames, recentlyPlayed, achievementsByApp),
    [ownedGames, recentlyPlayed, achievementsByApp]
  );
  const recentGames = useMemo(
    () => recentlyPlayed.slice(0, 5),
    [recentlyPlayed]
  );

  const stats = useMemo(() => {
    const totalMinutes = ownedGames.reduce((sum, game) => sum + (Number(game.playtime_forever) || 0), 0);
    const unlockedAchievements = Object.values(achievementsByApp).reduce(
      (sum, entry) => sum + (Number(entry?.unlocked) || 0),
      0
    );

    return {
      totalHours: formatInteger(Math.round(totalMinutes / 60)),
      gamesOwned: formatInteger(ownedGames.length),
      achievementsUnlocked: formatInteger(unlockedAchievements),
      yearsOnSteam: getYearsOnSteam(profile?.timecreated),
    };
  }, [achievementsByApp, ownedGames, profile]);

  const isConfigured = Boolean(STEAM_PROFILE_ID);
  const statusCopy = getStatusCopy(profile);
  const currentGameId = profile?.gameid ? Number(profile.gameid) : null;
  const profileName = profile?.personaname || 'Steam profile';
  const profileUrl = profile?.profileurl || `https://steamcommunity.com/id/${STEAM_PROFILE_ID || ''}`;

  return (
    <section className="friend-page">
      <div className="friend-page__intro">
        <h1 className="friend-page__title">Steam side quest</h1>
        <p className="friend-page__subtitle">
          A live snapshot of what I&apos;m playing, what I keep coming back to, and whether Steam says I&apos;m
          being productive right now.
        </p>
      </div>

      {!isConfigured && (
        <section className="steam-card steam-card--message" aria-live="polite">
          <p className="steam-card__message-title">Steam is not configured yet.</p>
          <p className="steam-card__message-body">
            Add <code>REACT_APP_STEAM_PROFILE_ID</code> and a backend Steam API key to load the live profile.
          </p>
        </section>
      )}

      {isConfigured && loadingState === 'loading' && (
        <section className="steam-card steam-card--message" aria-live="polite">
          <p className="steam-card__message-title">Loading Steam profile...</p>
          <p className="steam-card__message-body">Pulling profile details, library stats, and recently played games.</p>
        </section>
      )}

      {isConfigured && loadingState === 'error' && (
        <section className="steam-card steam-card--message steam-card--error" aria-live="polite">
          <p className="steam-card__message-title">Steam data could not load.</p>
          <p className="steam-card__message-body">
            {loadError === 'missing-config'
              ? 'The Steam proxy URL or public profile id is missing.'
              : 'The Friend page is waiting on the Steam proxy response. Check the endpoint and try again.'}
          </p>
        </section>
      )}

      {isConfigured && loadingState === 'ready' && (
        <section className="steam-card">
          <div className="steam-card__header">
            <div className="steam-card__profile">
              {profile?.avatarfull ? (
                <img
                  className="steam-card__avatar-image"
                  src={profile.avatarfull}
                  alt=""
                  width="72"
                  height="72"
                />
              ) : (
                <div className="steam-card__avatar-fallback" aria-hidden="true">
                  {getAvatarInitials(profileName)}
                </div>
              )}

              <div className="steam-card__identity">
                <p className="steam-card__name">{profileName}</p>
                <div className="steam-card__status">
                  <span className={`steam-card__status-dot${profile?.personastate ? ' is-online' : ''}`} aria-hidden="true" />
                  <span>{statusCopy}</span>
                </div>
              </div>

              <a className="steam-card__cta" href={profileUrl} target="_blank" rel="noreferrer">
                view profile
              </a>
            </div>
          </div>

          <div className="steam-card__body">
            <div className="steam-card__stats" aria-label="Steam profile summary">
              <div className="steam-stat">
                <span className="steam-stat__value">{stats.totalHours}</span>
                <span className="steam-stat__label">total hours</span>
              </div>
              <div className="steam-stat">
                <span className="steam-stat__value">{stats.gamesOwned}</span>
                <span className="steam-stat__label">games owned</span>
              </div>
              <div className="steam-stat">
                <span className="steam-stat__value">{stats.achievementsUnlocked}</span>
                <span className="steam-stat__label">achievements</span>
              </div>
              <div className="steam-stat">
                <span className="steam-stat__value">{stats.yearsOnSteam ?? '--'}</span>
                <span className="steam-stat__label">yrs on steam</span>
              </div>
            </div>

            <div className="steam-section">
              <div className="steam-section__title">library - featured games</div>
              <div className="steam-games">
                {featuredGames.map((game) => {
                  const achievementSummary = game.achievementSummary;
                  const achievementPercent = achievementSummary?.total
                    ? Math.round((achievementSummary.unlocked / achievementSummary.total) * 100)
                    : 0;
                  const isCurrentGame = currentGameId === Number(game.appid);

                  return (
                    <article className="steam-game" key={game.appid}>
                      {isCurrentGame && (
                        <div className="steam-game__badge">
                          <span className="steam-game__badge-dot" aria-hidden="true" />
                          playing now
                        </div>
                      )}

                      <img
                        className="steam-game__art"
                        src={buildGameHeaderImage(game.appid)}
                        alt=""
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.visibility = 'hidden';
                        }}
                      />

                      <div className="steam-game__info">
                        <p className="steam-game__name">{game.name}</p>
                        <p className="steam-game__meta">
                          <span>last 2 weeks: {formatHours(game.playtime_2weeks)}</span>
                          <span aria-hidden="true">·</span>
                          <span>appid {game.appid}</span>
                        </p>

                        {achievementSummary && (
                          <div className="steam-game__achievements" aria-label={`${game.name} achievement progress`}>
                            <div className="steam-game__achievement-track">
                              <div
                                className="steam-game__achievement-fill"
                                style={{ width: `${achievementPercent}%` }}
                              />
                            </div>
                            <span className="steam-game__achievement-label">
                              {achievementSummary.unlocked}/{achievementSummary.total} achievements
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="steam-game__hours">{formatHours(game.playtime_forever)}</div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="steam-section">
              <div className="steam-section__title">recently played</div>
              <div className="steam-games">
                {recentGames.length > 0 ? recentGames.map((game) => {
                  const isCurrentGame = currentGameId === Number(game.appid);

                  return (
                    <article className="steam-game" key={`recent-${game.appid}`}>
                      {isCurrentGame && (
                        <div className="steam-game__badge">
                          <span className="steam-game__badge-dot" aria-hidden="true" />
                          playing now
                        </div>
                      )}

                      <img
                        className="steam-game__art"
                        src={buildGameHeaderImage(game.appid)}
                        alt=""
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.visibility = 'hidden';
                        }}
                      />

                      <div className="steam-game__info">
                        <p className="steam-game__name">{game.name}</p>
                        <p className="steam-game__meta">
                          <span>last 2 weeks: {formatHours(game.playtime_2weeks)}</span>
                          <span aria-hidden="true">·</span>
                          <span>all time: {formatHours(game.playtime_forever)}</span>
                        </p>
                      </div>

                      <div className="steam-game__hours">{formatHours(game.playtime_2weeks)}</div>
                    </article>
                  );
                }) : (
                  <article className="steam-game">
                    <div className="steam-game__info">
                      <p className="steam-game__name">No recent Steam sessions found</p>
                      <p className="steam-game__meta">
                        <span>Steam did not return any recently played games for this profile.</span>
                      </p>
                    </div>
                  </article>
                )}
              </div>
            </div>

            <div className="steam-card__footer">
              <p className="steam-card__footer-copy">Live from Steam, with the dramatic editing left intact.</p>
              <a className="steam-card__footer-link" href={profileUrl} target="_blank" rel="noreferrer">
                full profile on steam
              </a>
            </div>
          </div>
        </section>
      )}
    </section>
  );
}
