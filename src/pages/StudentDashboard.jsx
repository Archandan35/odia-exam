import SubjectCard from "../components/SubjectCard";

export default function StudentDashboard() {
  return (
    <div className="main">

      <h1>Student Dashboard</h1>

      <div className="subject-grid">
        <SubjectCard title="SBI PO Mock Test" />
        <SubjectCard title="RRB PO Mock Test" />
        <SubjectCard title="SSC Mock Test" />
      </div>

    </div>
  );
}
