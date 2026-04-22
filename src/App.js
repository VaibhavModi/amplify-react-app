import { lazy, Suspense, useEffect, useState } from 'react';
import profilePortrait from './images/profile-portrait.webp';
import './App.css';


const loadRecruiterPage = () => import('./gateways/RecruiterPage');
const loadVisitorPage = () => import('./gateways/VisitorPage');
const loadFriendPage = () => import('./gateways/FriendPage');

const RecruiterPage = lazy(loadRecruiterPage);
const VisitorPage = lazy(loadVisitorPage);
const FriendPage = lazy(loadFriendPage);

const gateways = {
  recruiter: {
    label: 'Recruiter',
    button: 'Recruiter',
    detail:
      'A direct way into my work, how I think, and the practical signals that matter when you are hiring.',
    accent: 'cyan',
    shortcut: 'R',
  },
  visitor: {
    label: 'Visitor',
    button: 'Visitor',
    detail:
      'A more open path through who I am, what I am building, and the ideas that keep pulling me back in.',
    accent: 'magenta',
    shortcut: 'V',
  },
  friend: {
    label: 'Friend',
    button: 'Friend',
    detail: 'A softer route through side quests, shared context, and the things I am into right now.',
    accent: 'gold',
    shortcut: 'F',
  },
};

const gatewayOrder = ['recruiter', 'visitor', 'friend'];
const validViews = new Set(['home', ...gatewayOrder]);
const routeComponents = {
  recruiter: RecruiterPage,
  visitor: VisitorPage,
  friend: FriendPage,
};
const routeLoaders = {
  recruiter: loadRecruiterPage,
  visitor: loadVisitorPage,
  friend: loadFriendPage,
};

function Header({ activeView, goHome }) {
  const routeOpen = activeView !== 'home';
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [activeView]);

  const handleHomeClick = (event) => {
    event.preventDefault();
    goHome();
  };

  return (
    <header className={`topbar${routeOpen ? ' topbar--compact' : ''}${menuOpen ? ' topbar--menu-open' : ''}`}>
      <a className="brand-lockup brand-lockup-link" href="/" onClick={handleHomeClick}>
        <span className={routeOpen ? 'header-photo-frame header-photo-frame--active' : 'header-photo-frame'}>
          <span className={routeOpen ? 'header-photo-wrap is-visible' : 'header-photo-wrap'} aria-hidden="true">
            <img src={profilePortrait} alt="" className="header-photo" width="498" height="664" />
          </span>
        </span>
        <span className="brand">vaibhav modi</span>
      </a>
      <nav className="topbar-links" aria-label="Site links">
        <a className="topbar-link" href="https://github.com/vaibhavmodi" target="_blank" rel="noreferrer"
          onClick={() => !/^(localhost|127\.|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(window.location.hostname) && window.gtag?.('event', 'social_click', { platform: 'github', transport_type: 'beacon' })}>github</a>
        <a className="topbar-link" href="https://www.linkedin.com/in/vaibhavmodir/" target="_blank" rel="noreferrer"
          onClick={() => !/^(localhost|127\.|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(window.location.hostname) && window.gtag?.('event', 'social_click', { platform: 'linkedin', transport_type: 'beacon' })}>linkedin</a>
      </nav>
      <button
        className="menu-toggle"
        onClick={() => setMenuOpen((o) => !o)}
        type="button"
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
      >
        {menuOpen ? '✕' : '☰'}
      </button>
    </header>
  );
}

function HomeFrame({ openView }) {
  const [hoveredGateway, setHoveredGateway] = useState(null);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const map = { r: 'recruiter', v: 'visitor', f: 'friend' };
      const match = map[e.key.toLowerCase()];
      if (match) openView(match);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [openView]);

  return (
    <section className="route-frame route-frame--home">
      <div className="route-frame__inner route-frame__inner--home">
        <section className="operator-layout">
          <div className="photo-panel" aria-label="Profile photo">
            <div className="photo-ring">
              <div className="photo-placeholder">
                <img
                  src={profilePortrait}
                  alt="Portrait Photo"
                  className="profile-photo"
                  width="498"
                  height="664"
                  fetchpriority="high"
                  decoding="async"
                />
              </div>
            </div>
            <p className="home-factline">
              <span className="home-factline__label">fun fact</span>
              Did you know Earth's moon is the only moon without a name?
            </p>
            <p className="currently-line">
              <span className="currently-label">Currently →</span>
              {' '}building this site
            </p>
          </div>

          <div className="content-panel">
            <div className="operator-copy">
              <p className="eyebrow">Software engineer & a curious builder</p>
              <p className="intro-bio">
                I build software, care deeply about thoughtful experiences, and
                like making digital spaces feel a little more human than they need to be.
              </p>
              <h1>
                Choose the doorway
                <br />
                that describes you.
              </h1>
            </div>

            <section className="gateway-console">
              <div className="gateway-actions" role="tablist" aria-label="Gateway paths">
                {gatewayOrder.map((key) => {
                  const gateway = gateways[key];
                  return (
                    <button
                      key={key}
                      className={`gateway-button gateway-button--${gateway.accent}`}
                      onClick={() => openView(key)}
                      onMouseEnter={() => setHoveredGateway(key)}
                      onMouseLeave={() => setHoveredGateway(null)}
                      type="button"
                    >
                      {gateway.button}
                      <kbd className="gateway-key">{gateway.shortcut}</kbd>
                    </button>
                  );
                })}
              </div>
              <p className={`gateway-detail${hoveredGateway ? ' gateway-detail--visible' : ''}`}>
                {hoveredGateway ? gateways[hoveredGateway].detail : '\u00A0'}
              </p>
            </section>
          </div>
        </section>
      </div>
    </section>
  );
}

function RouteFrame({ view, goHome }) {
  const selectedGateway = gateways[view];
  const RoutePage = routeComponents[view];

  return (
    <section className={`route-frame route-frame--${selectedGateway.accent}`}>
      <div className="route-frame__inner">
        <Suspense
          fallback={
            <>
              <p className="eyebrow">Loading</p>
              <h1>{selectedGateway.label} page</h1>
              <p className="route-copy">Loading this doorway...</p>
            </>
          }
        >
          <RoutePage goHome={goHome} />
        </Suspense>
      </div>
    </section>
  );
}

function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const pathView = pathname === '/' ? 'home' : pathname.replace(/^\//, '');
  const currentView = validViews.has(pathView) ? pathView : 'home';

  const openView = (view) => {
    const nextPath = view === 'home' ? '/' : `/${view}`;
    if (window.location.pathname !== nextPath) {
      window.history.pushState(
        {
          appPath: view,
          fromHome: currentView === 'home',
        },
        '',
        nextPath
      );
      setPathname(nextPath);
    }
  };

  const goHome = () => {
    if (currentView === 'home') {
      return;
    }

    if (window.history.state?.fromHome) {
      window.history.back();
      return;
    }

    window.history.replaceState({ appPath: 'home', fromHome: false }, '', '/');
    setPathname('/');
  };

  useEffect(() => {
    const titles = {
      home: 'Landing Zone',
      recruiter: 'Recruiter',
      visitor: 'Visitor',
      friend: 'Friend',
    };
    const title = titles[currentView] ?? 'Landing Zone';
    document.title = title;
    const isLocal = /^(localhost|127\.|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(window.location.hostname);
    if (typeof window.gtag === 'function' && !isLocal) {
      const path = currentView === 'home' ? '/' : `/${currentView}`;
      window.gtag('event', 'page_view', {
        page_path: path,
        page_title: title,
        page_location: window.location.origin + path,
      });
    }
  }, [currentView]);

  useEffect(() => {
    let timer;
    const handleVisibility = () => {
      clearTimeout(timer);
      if (document.hidden) {
        document.documentElement.classList.add('tab-hidden');
        document.title = 'you left something here 👀';
      } else {
        document.title = document.title !== 'you left something here 👀'
          ? document.title
          : (currentView === 'home' ? 'Landing Zone' : gateways[currentView]?.label ?? 'Landing Zone');
        // hold red for 2s so user sees it, then transition to green
        timer = setTimeout(() => {
          document.documentElement.classList.remove('tab-hidden');
        }, 500);
      }
    };
    window.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibility);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };

    window.history.replaceState(
      {
        appPath: currentView,
        fromHome: window.history.state?.fromHome ?? false,
      },
      '',
      window.location.pathname
    );

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView]);

  useEffect(() => {
    if (currentView !== 'home') {
      return undefined;
    }

    const preloadRoutes = () => {
      Object.values(routeLoaders).forEach((loadRoute) => {
        loadRoute();
      });
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(preloadRoutes, { timeout: 3000 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timerId = window.setTimeout(preloadRoutes, 2500);
    return () => window.clearTimeout(timerId);
  }, [currentView]);

  return (
    <div className="site-shell">
      <div className="site-noise" aria-hidden="true" />

      <main className="operator-stage">
        <Header activeView={currentView} goHome={goHome} />

        {currentView === 'home' ? (
          <HomeFrame openView={openView} />
        ) : (
          <RouteFrame view={currentView} goHome={goHome} />
        )}
      </main>
    </div>
  );
}

export default App;
