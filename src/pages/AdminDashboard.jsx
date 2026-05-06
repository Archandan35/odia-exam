import AdminSidebar from "../components/AdminSidebar";
import StatsCard from "../components/StatsCard";
import SubjectCard from "../components/SubjectCard";

export default function AdminDashboard() {
  return (
    <div className="dashboard">

      <AdminSidebar />

      <div className="main">

        <h1>Admin Dashboard</h1>

        <div className="subject-grid">
          <StatsCard title="Students" value="120" />
          <StatsCard title="Subjects" value="15" />
          <StatsCard title="Results" value="520" />
        </div>

        <h2>Subjects</h2>

        <div className="subject-grid">
          <SubjectCard title="SBI PO Mock Test" />
          <SubjectCard title="RRB PO Mock Test" />
          <SubjectCard title="Bank Clerk Mock Test" />
        </div>

      </div>

    </div>
  );
}
