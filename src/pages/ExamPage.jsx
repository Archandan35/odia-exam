import ExamHeader from "../components/ExamHeader";
import QuestionNavigator from "../components/QuestionNavigator";

export default function ExamPage() {
  return (
    <div className="main">

      <ExamHeader />

      <div className="exam-layout">

        <div className="card">
          <h2>Question 1</h2>

          <p>Which of the following is correct?</p>

          <div>
            <input type="radio" /> Option A
          </div>

          <div>
            <input type="radio" /> Option B
          </div>

          <div>
            <input type="radio" /> Option C
          </div>

          <div>
            <input type="radio" /> Option D
          </div>

        </div>

        <QuestionNavigator total={40} />

      </div>

    </div>
  );
}
