export default function QuestionNavigator({ total = 10 }) {
  return (
    <div className="card">
      <h3>Question Navigator</h3>

      <div className="navigator-grid">
        {Array.from({ length: total }).map((_, i) => (
          <button key={i}>{i + 1}</button>
        ))}
      </div>
    </div>
  );
}
