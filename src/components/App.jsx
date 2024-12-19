import { useState } from "react";

import { schools } from "../utils/staticAssistData";

import "../styles/App.css";
import Autocomplete from "./Autocomplete";

// not for reuse. move this outside of the components dir?

// this component will get huge. treat each if statement body as
// if it were a separate function. mental overhead is not needed

function App() {
  const [currentStage, setCurrentStage] = useState("school-select");
  const [planProgress, setPlanProgress] = useState(0);

  const [selectedSchools, setSelectedSchools] = useState([]);
  const [selectedMajors, setSelectedMajors] = useState([]);

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
          <Autocomplete options={schools} updateParent={setSelectedSchools} />
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
              const endpoint =
                "https://7bd2zfvix4.execute-api.us-east-2.amazonaws.com/transition1/schools";

              return (
                <div className="major-select" key={id}>
                  <p className="school-name">{name}</p>
                  <Autocomplete
                    options={schools}
                    updateParent={setSelectedMajors}
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
