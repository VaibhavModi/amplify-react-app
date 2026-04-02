import { lazy, Suspense, useEffect, useState } from 'react';
import profilePortrait from './images/profile-portrait.png';
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
  },
  visitor: {
    label: 'Visitor',
    button: 'Visitor',
    detail:
      'A more open path through who I am, what I am building, and the ideas that keep pulling me back in.',
    accent: 'magenta',
  },
  friend: {
    label: 'Friend',
    button: 'Friend',
    detail: 'A softer route through side quests, shared context, and the things I am into right now.',
    accent: 'gold',
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
  const handleHomeClick = (event) => {
    event.preventDefault();
    goHome();
  };

  return (
    <header className={routeOpen ? 'topbar topbar--compact' : 'topbar'}>
      <a className="brand-lockup brand-lockup-link" href="/" onClick={handleHomeClick}>
        <span className={routeOpen ? 'header-photo-wrap is-visible' : 'header-photo-wrap'} aria-hidden="true">
          <img src={profilePortrait} alt="" className="header-photo" width="675" height="900" />
        </span>
        <span className="brand">vaibhav modi</span>
      </a>
      <div className="topbar-links" aria-label="Future sections">
        <span>tech stack</span>
        <span>social</span>
        <span>blog</span>
      </div>
    </header>
  );
}

function HomeFrame({ openView }) {
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
                  width="675"
                  height="900"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
            </div>
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
                      type="button"
                    >
                      {gateway.button}
                    </button>
                  );
                })}
              </div>
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
      window.history.pushState({}, '', nextPath);
      setPathname(nextPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
        <Header activeView={currentView} goHome={() => openView('home')} />

        {currentView === 'home' ? (
          <HomeFrame openView={openView} />
        ) : (
          <RouteFrame view={currentView} goHome={() => openView('home')} />
        )}
      </main>
    </div>
  );
}

export default App;
