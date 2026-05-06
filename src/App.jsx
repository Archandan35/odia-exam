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

  // AUTH
  const [user, setUser] = useState(null);

  const [role, setRole] = useState("student");

  const [loading, setLoading] = useState(true);

  // LOGIN
  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [selectedRole, setSelectedRole] =
    useState("student");

  // QUESTIONS
  const [questions, setQuestions] =
    useState([]);

  const [newQuestion, setNewQuestion] =
    useState("");

  const [newOptions, setNewOptions] =
    useState(["", "", "", ""]);

  const [correctAnswer, setCorrectAnswer] =
    useState(0);

  // EXAM
  const [page, setPage] =
    useState("dashboard");

  const [examQuestions, setExamQuestions] =
    useState([]);

  const [answers, setAnswers] =
    useState({});

  const [result, setResult] =
    useState(null);

  // RESULTS
  const [results, setResults] =
    useState([]);

  // USERS
  const [students, setStudents] =
    useState([]);

  // AUTH CHECK
  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (u) => {

          if (u) {

            setUser(u);

            await loadQuestions();

            await loadUserRole(u.email);

          } else {

            setUser(null);

          }

          setLoading(false);

        }
      );

    return () => unsubscribe();

  }, []);

  // LOAD USER ROLE
  async function loadUserRole(email) {

    const snap = await getDocs(
      collection(db, "users")
    );

    snap.forEach((doc) => {

      const data = doc.data();

      if (data.email === email) {

        setRole(data.role || "student");

      }

    });
  }

  // LOAD QUESTIONS
  async function loadQuestions() {

    try {

      const snapshot =
        await getDocs(
          collection(db, "questions")
        );

      const arr = [];

      snapshot.forEach((doc) => {

        arr.push({
          id: doc.id,
          ...doc.data(),
        });

      });

      setQuestions(arr);

    } catch (error) {

      alert(error.message);

    }
  }

  // SIGNUP
  async function signup() {

    if (
      !name ||
      !email ||
      !password
    ) {

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

    if (
      !newQuestion ||
      newOptions.some((o) => !o)
    ) {

      alert("Fill all question fields");

      return;

    }

    try {

      await addDoc(
        collection(db, "questions"),
        {
          question: newQuestion,
          options: newOptions,
          answer: Number(correctAnswer),
          subject: "General",
        }
      );

      alert("Question Added");

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

    const snapshot =
      await getDocs(
        collection(db, "results")
      );

    const arr = [];

    snapshot.forEach((doc) => {

      arr.push(doc.data());

    });

    setResults(arr);
  }

  // LOAD STUDENTS
  async function loadStudents() {

    const snapshot =
      await getDocs(
        collection(db, "users")
      );

    const arr = [];

    snapshot.forEach((doc) => {

      const data = doc.data();

      if (data.role === "student") {

        arr.push(data);

      }

    });

    setStudents(arr);
  }

  // START EXAM
  function startExam(count) {

    if (questions.length === 0) {

      alert("No questions found");

      return;

    }

    const shuffled =
      [...questions]
        .sort(() =>
          Math.random() - 0.5
        )
        .slice(0, count);

    setExamQuestions(shuffled);

    setAnswers({});

    setPage("exam");
  }

  // SUBMIT EXAM
  async function submitExam() {

    let correct = 0;

    examQuestions.forEach((q, i) => {

      if (
        answers[i] === q.answer
      ) {

        correct++;

      }

    });

    const score =
      Math.round(
        (
          correct /
          examQuestions.length
        ) * 100
      );

    const resultData = {

      userId: user.uid,

      email: user.email,

      score,

      correct,

      total:
        examQuestions.length,

      createdAt:
        new Date().toISOString(),

    };

    await addDoc(
      collection(db, "results"),
      resultData
    );

    setResult(resultData);

    setPage("result");
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
            width: 350,
            boxShadow:
              "0 5px 20px rgba(0,0,0,0.1)",
          }}
        >

          <h1
            style={{
              textAlign: "center",
              marginBottom: 25,
            }}
          >
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
              marginBottom: 15,
              padding: 12,
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
              marginBottom: 15,
              padding: 12,
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
              marginBottom: 15,
              padding: 12,
            }}
          />

          <select
            value={selectedRole}
            onChange={(e) =>
              setSelectedRole(
                e.target.value
              )
            }
            style={{
              width: "100%",
              marginBottom: 20,
              padding: 12,
            }}
          >

            <option value="student">
              Student
            </option>

            <option value="admin">
              Admin
            </option>

          </select>

          <div
            style={{
              display: "flex",
              gap: 10,
            }}
          >

            <button
              onClick={signup}
              style={{
                flex: 1,
              }}
            >
              Signup
            </button>

            <button
              onClick={login}
              style={{
                flex: 1,
              }}
            >
              Login
            </button>

          </div>

        </div>

      </div>
    );
  }

  // EXAM PAGE
  if (page === "exam") {

    return (

      <div style={{ padding: 30 }}>

        <h1>Mock Exam</h1>

        {examQuestions.map((q, i) => (

          <div
            key={i}
            style={{
              background: "white",
              padding: 20,
              borderRadius: 10,
              marginBottom: 20,
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
                    checked={
                      answers[i] === j
                    }
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

        <button
          onClick={submitExam}
        >
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
          Score:
          {result.score}%
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
          Logged in as:
          {user.email}
        </p>

        <hr />

        <h2>Add Question</h2>

        <input
          placeholder="Question"
          value={newQuestion}
          onChange={(e) =>
            setNewQuestion(
              e.target.value
            )
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

              const copy =
                [...newOptions];

              copy[i] =
                e.target.value;

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
          placeholder="Correct Answer Index"
          value={correctAnswer}
          onChange={(e) =>
            setCorrectAnswer(
              e.target.value
            )
          }
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 15,
          }}
        />

        <button
          onClick={addQuestion}
        >
          Add Question
        </button>

        <hr />

        <h2>
          Total Questions:
          {questions.length}
        </h2>

        <button
          onClick={loadResults}
        >
          Load Results
        </button>

        <button
          onClick={loadStudents}
        >
          View Students
        </button>

        <h2>Results</h2>

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

            <p>
              Email:
              {r.email}
            </p>

            <p>
              Score:
              {r.score}%
            </p>

            <p>
              Correct:
              {r.correct}
              /
              {r.total}
            </p>

          </div>
        ))}

        <h2>Students</h2>

        {students.map((s, i) => (

          <div
            key={i}
            style={{
              background: "white",
              padding: 15,
              marginBottom: 10,
              borderRadius: 8,
            }}
          >

            <p>
              Name:
              {s.name}
            </p>

            <p>
              Email:
              {s.email}
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

      <br />
      <br />

      <button onClick={logout}>
        Logout
      </button>

    </div>
  );
}
