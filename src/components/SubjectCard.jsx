export default function SubjectCard({ title }) {
  return (
    <div className="subject-card">
      <h2>{title}</h2>

      <p>120 Questions</p>

      <button>Start Test</button>
    </div>
  );
}
