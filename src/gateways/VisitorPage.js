export default function VisitorPage({ goHome }) {
  return (
    <>
      <p className="eyebrow">New frame</p>
      <h1>Visitor page</h1>
      <p className="route-copy">
        This is the shared content frame for the visitor route.
      </p>
      <div className="route-actions">
        <button className="ghost-button" onClick={goHome} type="button">
          Back to home
        </button>
      </div>
    </>
  );
}
