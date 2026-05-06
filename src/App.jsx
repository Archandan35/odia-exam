import { useEffect, useState } from "react";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";

import { auth, db } from "./firebase";

export default function App() {

  const [user, setUser] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [questions, setQuestions] = useState([]);

  const [examQuestions, setExamQuestions] = useState([]);

  const [answers, setAnswers] = useState({});

  const [page, setPage] = useState("dashboard");

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(true);

  // ADMIN STATES
  const [role, setRole] = useState("student");

  const [newQuestion, setNewQuestion] = useState("");

  const [newOptions, setNewOptions] = useState([
    "",
    "",
    "",
    ""
  ]);

  const [correctAnswer, setCorrectAnswer] = useState(0);

  const [results, setResults] = useState([]);

  // AUTH STATE
  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, async (u) => {

      if (u) {

        setUser(u);

        await loadQuestions();

        const snap = await getDocs(
          collection(db, "users")
        );

        snap.forEach((doc) => {

          const data = doc.data();

          if (data.email === u.email) {
            setRole(data.role || "student");
          }

        });

      } else {

        setUser(null);

      }

      setLoading(false);

    });

    return () => unsubscribe();

  }, []);

  // LOAD QUESTIONS
  async function loadQuestions() {

    try {

      const snapshot = await getDocs(
        collection(db, "questions")
      );

      const data = [];

      snapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setQuestions(data);

    } catch (error) {

      alert(error.message);

    }
  }

  // SIGNUP
  async function signup() {

    if (!email || !password || !name) {
      alert("Fill all fields");
      return;
    }

    try {

      const res =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      await addDoc(collection(db, "users"), {
        uid: res.user.uid,
        name,
        email,
        role: "student",
      });

      alert("Signup successful");

    } catch (error) {

      alert(error.message);

    }
  }

  // LOGIN
  async function login() {

    if (!email || !password) {
      alert("Enter email/password");
      return;
    }

    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    } catch (error) {

      alert(error.message);

    }
  }

  // LOGOUT
  async function logout() {

    await signOut(auth);

  }

  // START EXAM
  function startExam(count) {

    if (questions.length === 0) {

      alert("No questions found");

      return;

    }

    const shuffled = [...questions]
      .sort(() => Math.random() - 0.5)
      .slice(0, count);

    setExamQuestions(shuffled);

    setAnswers({});

    setPage("exam");
  }

  // ADMIN ADD QUESTION
  async function addQuestion() {

    if (!newQuestion) {

      alert("Enter question");

      return;

    }

    try {

      await addDoc(collection(db, "questions"), {

        question: newQuestion,

        options: newOptions,

        answer: Number(correctAnswer),

        subject: "General"

      });

      alert("Question added");

      setNewQuestion("");

      setNewOptions([
        "",
        "",
        "",
        ""
      ]);

      setCorrectAnswer(0);

      await loadQuestions();

    } catch (error) {

      alert(error.message);

    }
  }

  // LOAD RESULTS
  async function loadResults() {

    try {

      const snapshot = await getDocs(
        collection(db, "results")
      );

      const arr = [];

      snapshot.forEach((doc) => {

        arr.push(doc.data());

      });

      setResults(arr);

    } catch (error) {

      alert(error.message);

    }
  }

  // SUBMIT EXAM
  async function submitExam() {

    let correct = 0;

    examQuestions.forEach((q, i) => {

      if (answers[i] === q.answer) {

        correct++;

      }

    });

    const score = Math.round(
      (correct / examQuestions.length) * 100
    );

    const resultData = {

      userId: user.uid,

      email: user.email,

      score,

      correct,

      total: examQuestions.length,

      createdAt: new Date().toISOString(),

    };

    try {

      await addDoc(
        collection(db, "results"),
        resultData
      );

      setResult(resultData);

      setPage("result");

    } catch (error) {

      alert(error.message);

    }
  }

  // LOADING
  if (loading) {

    return (

      <div style={{ padding: 40 }}>

        <h2>Loading...</h2>

      </div>
    );
  }

  // LOGIN PAGE
  if (!user) {

    return (

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f1f5f9",
        }}
      >

        <div
          style={{
            background: "white",
            padding: 30,
            borderRadius: 12,
            width: 320,
          }}
        >

          <h1>Odia Exam Portal</h1>

          <input
            placeholder="Full Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

          <br />
          <br />

          <input
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <br />
          <br />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <br />
          <br />

          <button onClick={signup}>
            Signup
          </button>

          <button onClick={login}>
            Login
          </button>

        </div>

      </div>
    );
  }

  // EXAM PAGE
  if (page === "exam") {

    return (

      <div style={{ padding: 20 }}>

        <h1>Mock Exam</h1>

        {examQuestions.map((q, i) => (

          <div
            key={i}
            style={{
              background: "white",
              padding: 20,
              marginBottom: 20,
              borderRadius: 10,
            }}
          >

            <h3>
              {i + 1}. {q.question}
            </h3>

            {q.options.map((opt, j) => (

              <div key={j}>

                <label>

                  <input
                    type="radio"
                    name={`q-${i}`}
                    checked={answers[i] === j}
                    onChange={() =>
                      setAnswers({
                        ...answers,
                        [i]: j,
                      })
                    }
                  />

                  {opt}

                </label>

              </div>
            ))}

          </div>
        ))}

        <button onClick={submitExam}>
          Submit Exam
        </button>

      </div>
    );
  }

  // RESULT PAGE
  if (page === "result") {

    return (

      <div
        style={{
          padding: 40,
          textAlign: "center",
        }}
      >

        <h1>Exam Result</h1>

        <h2>
          Score: {result.score}%
        </h2>

        <p>
          Correct:
          {result.correct}
          /
          {result.total}
        </p>

        <button
          onClick={() =>
            setPage("dashboard")
          }
        >
          Back Dashboard
        </button>

      </div>
    );
  }

  // ADMIN DASHBOARD
  if (role === "admin") {

    return (

      <div style={{ padding: 30 }}>

        <h1>Admin Dashboard</h1>

        <p>
          Logged in as admin:
          {user.email}
        </p>

        <hr />

        <h2>Add Question</h2>

        <input
          placeholder="Question"
          value={newQuestion}
          onChange={(e) =>
            setNewQuestion(e.target.value)
          }
        />

        <br />
        <br />

        {newOptions.map((opt, i) => (

          <div key={i}>

            <input
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => {

                const copy = [...newOptions];

                copy[i] = e.target.value;

                setNewOptions(copy);

              }}
            />

            <br />
            <br />

          </div>
        ))}

        <input
          type="number"
          placeholder="Correct Answer Index"
          value={correctAnswer}
          onChange={(e) =>
            setCorrectAnswer(e.target.value)
          }
        />

        <br />
        <br />

        <button onClick={addQuestion}>
          Add Question
        </button>

        <hr />

        <h2>
          Total Questions:
          {questions.length}
        </h2>

        <button onClick={loadResults}>
          Load Results
        </button>

        <h2>Student Results</h2>

        {results.map((r, i) => (

          <div
            key={i}
            style={{
              background: "white",
              padding: 15,
              marginBottom: 10,
              borderRadius: 8,
            }}
          >

            <p>Email: {r.email}</p>

            <p>Score: {r.score}%</p>

            <p>
              Correct:
              {r.correct}
              /
              {r.total}
            </p>

          </div>
        ))}

        <br />

        <button onClick={logout}>
          Logout
        </button>

      </div>
    );
  }

  // STUDENT DASHBOARD
  return (

    <div style={{ padding: 40 }}>

      <h1>Student Dashboard</h1>

      <p>
        Logged in:
        {user.email}
      </p>

      <h3>Select Mock Test</h3>

      <button
        onClick={() => startExam(10)}
      >
        10 Questions
      </button>

      <button
        onClick={() => startExam(15)}
      >
        15 Questions
      </button>

      <button
        onClick={() => startExam(20)}
      >
        20 Questions
      </button>

      <button
        onClick={() => startExam(50)}
      >
        50 Questions
      </button>

      <br />
      <br />

      <button onClick={logout}>
        Logout
      </button>

    </div>
  );
}
