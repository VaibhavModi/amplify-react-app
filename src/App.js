import { useLocation, useNavigate } from 'react-router-dom';
import profilePortrait from './images/profile-portrait.png';
import './App.css';

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

function Header({ activeView }) {
  const routeOpen = activeView !== 'home';

  return (
    <header className={routeOpen ? 'topbar topbar--compact' : 'topbar'}>
      <div className="brand-lockup">
        <span className={routeOpen ? 'header-photo-wrap is-visible' : 'header-photo-wrap'} aria-hidden="true">
          <img src={profilePortrait} alt="" className="header-photo" />
        </span>
        <span className="brand">vaibhav modi</span>
      </div>
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
                <img src={profilePortrait} alt="Portrait of Vaibhav Modi" className="profile-photo" />
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

  return (
    <section className={`route-frame route-frame--${selectedGateway.accent}`}>
      <div className="route-frame__inner">
        <p className="eyebrow">New frame</p>
        <h1>{selectedGateway.label} page</h1>
        <p className="route-copy">
          This is the shared content frame for the {selectedGateway.label.toLowerCase()} route.
        </p>
        <div className="route-actions">
          <button className="ghost-button" onClick={goHome} type="button">
            Back to home
          </button>
        </div>
      </div>
    </section>
  );
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathView = location.pathname === '/' ? 'home' : location.pathname.replace(/^\//, '');
  const currentView = validViews.has(pathView) ? pathView : 'home';

  const openView = (view) => {
    navigate(view === 'home' ? '/' : `/${view}`);
  };

  return (
    <div className="site-shell">
      <div className="site-noise" aria-hidden="true" />

      <main className="operator-stage">
        <Header activeView={currentView} />

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
