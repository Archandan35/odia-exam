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
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

import { auth, db } from "./firebase";

export default function App() {

  const [loading, setLoading] = useState(true);

  const [darkMode, setDarkMode] = useState(false);

  const [user, setUser] = useState(null);

  const [role, setRole] = useState("student");

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [selectedRole, setSelectedRole] =
    useState("student");

  const [questions, setQuestions] =
    useState([]);

  const [results, setResults] =
    useState([]);

  const [students, setStudents] =
    useState([]);

  const [leaderboard, setLeaderboard] =
    useState([]);

  const [page, setPage] =
    useState("dashboard");

  const [newQuestion, setNewQuestion] =
    useState("");

  const [newOptions, setNewOptions] =
    useState(["", "", "", ""]);

  const [correctAnswer, setCorrectAnswer] =
    useState(0);

  const [editingId, setEditingId] =
    useState(null);

  const [examQuestions, setExamQuestions] =
    useState([]);

  const [answers, setAnswers] =
    useState({});

  const [result, setResult] =
    useState(null);

  const [timer, setTimer] =
    useState(0);

  // AUTH
  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (u) => {

          try {

            if (u) {

              setUser(u);

              await loadRole(u.email);

              await loadQuestions();

            } else {

              setUser(null);

            }

          } catch (error) {

            console.log(error);

          }

          setLoading(false);

        }
      );

    return () => unsubscribe();

  }, []);

  // TIMER
  useEffect(() => {

    let interval;

    if (page === "exam") {

      interval = setInterval(() => {

        setTimer((prev) => prev - 1);

      }, 1000);
    }

    return () => clearInterval(interval);

  }, [page]);

  useEffect(() => {

    if (timer <= 0 && page === "exam") {

      submitExam();

    }

  }, [timer]);

  // FULLSCREEN ANTI CHEAT
  async function enableFullscreen() {

    try {

      await document.documentElement
        .requestFullscreen();

    } catch (e) {

      console.log(e);

    }
  }

  // LOAD ROLE
  async function loadRole(userEmail) {

    const snapshot = await getDocs(
      collection(db, "users")
    );

    snapshot.forEach((d) => {

      const data = d.data();

      if (data.email === userEmail) {

        setRole(data.role || "student");

      }

    });
  }

  // LOAD QUESTIONS
  async function loadQuestions() {

    const snapshot = await getDocs(
      collection(db, "questions")
    );

    const arr = [];

    snapshot.forEach((d) => {

      arr.push({
        id: d.id,
        ...d.data(),
      });

    });

    setQuestions(arr);
  }

  // SIGNUP
  async function signup() {

    try {

      const res =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      await addDoc(
        collection(db, "users"),
        {
          uid: res.user.uid,
          name,
          email,
          role: selectedRole,
        }
      );

      alert("Signup successful");

    } catch (error) {

      alert(error.message);

    }
  }

  // LOGIN
  async function login() {

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

  // ADD QUESTION
  async function addQuestion() {

    try {

      await addDoc(
        collection(db, "questions"),
        {
          question: newQuestion,
          options: newOptions,
          answer: Number(correctAnswer),
        }
      );

      alert("Question Added");

      setNewQuestion("");

      setNewOptions([
        "",
        "",
        "",
        "",
      ]);

      await loadQuestions();

    } catch (error) {

      alert(error.message);

    }
  }

  // DELETE QUESTION
  async function deleteQuestion(id) {

    await deleteDoc(
      doc(db, "questions", id)
    );

    await loadQuestions();
  }

  // EDIT QUESTION
  async function updateQuestion() {

    await updateDoc(
      doc(db, "questions", editingId),
      {
        question: newQuestion,
        options: newOptions,
        answer: Number(correctAnswer),
      }
    );

    setEditingId(null);

    setNewQuestion("");

    setNewOptions([
      "",
      "",
      "",
      "",
    ]);

    await loadQuestions();
  }

  // LOAD RESULTS
  async function loadResults() {

    const snapshot = await getDocs(
      collection(db, "results")
    );

    const arr = [];

    snapshot.forEach((d) => {

      arr.push(d.data());

    });

    setResults(arr);

    const sorted = arr.sort(
      (a, b) => b.score - a.score
    );

    setLeaderboard(sorted);
  }

  // LOAD STUDENTS
  async function loadStudents() {

    const snapshot = await getDocs(
      collection(db, "users")
    );

    const arr = [];

    snapshot.forEach((d) => {

      const data = d.data();

      if (data.role === "student") {

        arr.push(data);

      }

    });

    setStudents(arr);
  }

  // START EXAM
  async function startExam(count) {

    await enableFullscreen();

    const shuffled = [...questions]
      .sort(() => Math.random() - 0.5)
      .slice(0, count);

    setExamQuestions(shuffled);

    setAnswers({});

    setTimer(count * 60);

    setPage("exam");
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

      email: user.email,

      score,

      correct,

      total: examQuestions.length,

      createdAt: new Date().toISOString(),

    };

    await addDoc(
      collection(db, "results"),
      resultData
    );

    setResult(resultData);

    setPage("result");
  }

  // EXPORT RESULTS
  function exportResults() {

    const text = JSON.stringify(
      results,
      null,
      2
    );

    const blob = new Blob([text], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "results.json";

    a.click();
  }

  const bg = darkMode ? "#0f172a" : "#f1f5f9";

  const card = darkMode ? "#1e293b" : "white";

  const text = darkMode ? "white" : "black";

  if (loading) {

    return (
      <div style={{
        background: bg,
        color: text,
        minHeight: "100vh",
        padding: 40,
      }}>
        <h1>Loading...</h1>
      </div>
    );
  }

  // LOGIN PAGE
  if (!user) {

    return (

      <div style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: bg,
      }}>

        <div style={{
          background: card,
          padding: 30,
          width: 350,
          borderRadius: 12,
        }}>

          <h1 style={{ color: text }}>
            Odia Exam Portal
          </h1>

          <input
            placeholder="Full Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            style={{
              width: "100%",
              padding: 12,
              marginBottom: 12,
            }}
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            style={{
              width: "100%",
              padding: 12,
              marginBottom: 12,
            }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            style={{
              width: "100%",
              padding: 12,
              marginBottom: 12,
            }}
          />

          <select
            value={selectedRole}
            onChange={(e) =>
              setSelectedRole(e.target.value)
            }
            style={{
              width: "100%",
              padding: 12,
              marginBottom: 12,
            }}
          >

            <option value="student">
              Student
            </option>

            <option value="admin">
              Admin
            </option>

          </select>

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

      <div style={{
        background: bg,
        color: text,
        minHeight: "100vh",
        padding: 20,
      }}>

        <h1>
          Mock Exam
        </h1>

        <h2>
          Timer: {timer}s
        </h2>

        {examQuestions.map((q, i) => (

          <div
            key={i}
            style={{
              background: card,
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

      <div style={{
        background: bg,
        color: text,
        minHeight: "100vh",
        padding: 40,
      }}>

        <h1>
          Result
        </h1>

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
          Dashboard
        </button>

      </div>
    );
  }

  // ADMIN DASHBOARD
  if (role === "admin") {

    return (

      <div style={{
        background: bg,
        color: text,
        minHeight: "100vh",
        padding: 30,
      }}>

        <h1>
          Admin Dashboard
        </h1>

        <button
          onClick={() =>
            setDarkMode(!darkMode)
          }
        >
          Toggle Theme
        </button>

        <button onClick={logout}>
          Logout
        </button>

        <hr />

        <h2>
          Add / Edit Question
        </h2>

        <input
          placeholder="Question"
          value={newQuestion}
          onChange={(e) =>
            setNewQuestion(e.target.value)
          }
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
          }}
        />

        {newOptions.map((opt, i) => (

          <input
            key={i}
            placeholder={`Option ${i + 1}`}
            value={opt}
            onChange={(e) => {

              const copy = [...newOptions];

              copy[i] = e.target.value;

              setNewOptions(copy);

            }}
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 10,
            }}
          />

        ))}

        <input
          type="number"
          value={correctAnswer}
          onChange={(e) =>
            setCorrectAnswer(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
          }}
        />

        {editingId ? (
          <button onClick={updateQuestion}>
            Update Question
          </button>
        ) : (
          <button onClick={addQuestion}>
            Add Question
          </button>
        )}

        <hr />

        <h2>
          Questions
        </h2>

        {questions.map((q) => (

          <div
            key={q.id}
            style={{
              background: card,
              padding: 15,
              marginBottom: 10,
              borderRadius: 8,
            }}
          >

            <p>
              {q.question}
            </p>

            <button
              onClick={() => {

                setEditingId(q.id);

                setNewQuestion(q.question);

                setNewOptions(q.options);

                setCorrectAnswer(q.answer);

              }}
            >
              Edit
            </button>

            <button
              onClick={() =>
                deleteQuestion(q.id)
              }
            >
              Delete
            </button>

          </div>
        ))}

        <hr />

        <button onClick={loadResults}>
          Load Results
        </button>

        <button onClick={loadStudents}>
          View Students
        </button>

        <button onClick={exportResults}>
          Export Results
        </button>

        <h2>
          Leaderboard
        </h2>

        {leaderboard.map((r, i) => (

          <div key={i}>
            #{i + 1} - {r.email} - {r.score}%
          </div>

        ))}

        <h2>
          Students
        </h2>

        {students.map((s, i) => (

          <div key={i}>
            {s.name} - {s.email}
          </div>

        ))}

      </div>
    );
  }

  // STUDENT DASHBOARD
  return (

    <div style={{
      background: bg,
      color: text,
      minHeight: "100vh",
      padding: 40,
    }}>

      <h1>
        Student Dashboard
      </h1>

      <button
        onClick={() =>
          setDarkMode(!darkMode)
        }
      >
        Toggle Theme
      </button>

      <button onClick={logout}>
        Logout
      </button>

      <h3>
        Select Mock Test
      </h3>

      <button
        onClick={() =>
          startExam(10)
        }
      >
        10 Questions
      </button>

      <button
        onClick={() =>
          startExam(15)
        }
      >
        15 Questions
      </button>

      <button
        onClick={() =>
          startExam(20)
        }
      >
        20 Questions
      </button>

      <button
        onClick={() =>
          startExam(50)
        }
      >
        50 Questions
      </button>

    </div>
  );
}
