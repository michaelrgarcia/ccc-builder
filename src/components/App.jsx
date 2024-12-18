import { useEffect, useState } from "react";

import { schools } from "../utils/staticAssistData";

import "../styles/App.css";
import Autocomplete from "./Autocomplete";

// not for reuse. move this outside of the components dir?

// this component will get huge. treat each if statement body as
// if it were a separate function. mental overhead is not needed

const academicYear = 75; // will be able to change this later

function App() {
  const [currentStage, setCurrentStage] = useState("school-select");
  const [planProgress, setPlanProgress] = useState(0);

  const [error, setError] = useState(null);

  const [selectedSchools, setSelectedSchools] = useState([]);

  const [majors, setMajors] = useState({});
  const [selectedMajors, setSelectedMajors] = useState([]);

  useEffect(() => {
    async function getMajors() {
      try {
        const majorData = {};

        await Promise.all(
          selectedSchools.map(async ({ name, id }) => {
            const endpoint = import.meta.env.VITE_ASSIST_SCHOOLS;
            const response = await fetch(
              `${endpoint}/major-data/${id}/${academicYear}`
            );

            if (!response.ok) {
              throw new Error("Failed to fetch majors for ", name);
            }

            const data = await response.json();
            majorData[id] = data;
          })
        );

        setMajors(majorData);
      } catch (err) {
        console.error("Failed to fetch majors: ", err);

        setError("Critical error fetching major data. Refresh the page.");
      }
    }

    if (selectedSchools.length > 0) {
      getMajors();
    }
  }, [selectedSchools]);

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (currentStage === "school-select") {
    return (
      <>
        <header>
          <h1>CCCBuilder</h1>
          <p className="user-guide">
            Welcome! First, create a list of universities to transfer to.
          </p>
          <div className="progress-container">
            <label htmlFor="plan-progress">0% done</label>
            <progress
              id="plan-progress"
              value={planProgress}
              max={100}
            ></progress>
          </div>
        </header>
        <main>
          <Autocomplete
            options={schools}
            placeholderTxt="Select an institution..."
            updateParent={setSelectedSchools}
          />
          {selectedSchools.length > 0 ? (
            <button
              type="button"
              className="next"
              onClick={() => {
                setPlanProgress(10);
                setCurrentStage("major-select");
              }}
            >
              Next
            </button>
          ) : (
            ""
          )}
        </main>
      </>
    );
  } else if (currentStage === "major-select") {
    return (
      <>
        <header>
          <h1>CCCBuilder</h1>
          <p className="user-guide">Select your majors.</p>
          <div className="progress-container">
            <label htmlFor="plan-progress">10% done</label>
            <progress
              id="plan-progress"
              value={planProgress}
              max={100}
            ></progress>
          </div>
        </header>
        <main>
          <div className="major-selects">
            {selectedSchools.map(({ name, id }) => {
              return (
                <div className="major-select" key={id}>
                  <p className="school-name">{name}</p>
                  <Autocomplete
                    options={majors[id] || []}
                    placeholderTxt="Select a major..."
                    updateParent={setSelectedMajors} // fix; only majors from one school can be selected
                  />
                </div>
              );
            })}
          </div>
          {selectedMajors.length > 0 ? (
            <button
              type="button"
              className="next"
              onClick={() => {
                setPlanProgress(20);
                setCurrentStage("primary-cc-select");
              }}
            >
              Next
            </button>
          ) : (
            ""
          )}
        </main>
      </>
    );
  }
}

export default App;
