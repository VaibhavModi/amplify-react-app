export default function FriendPage() {
  return (
    <section className="friend-page">
      <div className="friend-hero">
        <h1 className="friend-hero__title">hey, you found the fun page</h1>
        <p className="friend-hero__subtitle">
          no resumes here. just vibes, games, and chaos.
        </p>
        <div className="friend-status" aria-label="Current status">
          <span className="friend-status__dot" aria-hidden="true" />
          <span className="friend-status__text">probably playing chess rn</span>
        </div>
      </div>
    </section>
  );
}
