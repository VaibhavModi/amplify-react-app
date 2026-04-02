export default function FriendPage({ goHome }) {
  return (
    <>
      <p className="eyebrow">New frame</p>
      <h1>Friend page</h1>
      <p className="route-copy">
        This is the shared content frame for the friend route.
      </p>
      <div className="route-actions">
        <button className="ghost-button" onClick={goHome} type="button">
          Back to home
        </button>
      </div>
    </>
  );
}
