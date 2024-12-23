import { useEffect, useState } from "react";

import { caliCCs, universities } from "../utils/staticAssistData";

import "../styles/App.css";
import Autocomplete from "./Autocomplete";
import SingleAutocomplete from "./SingleAutocomplete";
import { ccAndMajorSearch, uniSearch } from "../utils/search";

// not for reuse. move this outside of the components dir?

// this component will get huge. treat each if statement body as
// if it were a separate function. mental overhead is not needed

const academicYear = 75; // will be able to change this later

function App() {
  const [currentStage, setCurrentStage] = useState("school-select");
  const [planProgress, setPlanProgress] = useState(0);

  const [error, setError] = useState(null);

  const [majors, setMajors] = useState({});

  // combine these at some point
  const [selectedSchools, setSelectedSchools] = useState([]);
  const [selectedMajors, setSelectedMajors] = useState({});
  const [selectedCCC, setSelectedCCC] = useState({});

  const [baseArticulations, setBaseArticulations] = useState({});

  useEffect(() => {
    async function getMajors() {
      try {
        const endpoint = import.meta.env.VITE_ASSIST_SCHOOLS;
        const majorData = {};

        await Promise.all(
          selectedSchools.map(async ({ name, id }) => {
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

  useEffect(() => {
    async function getBaseArticulations() {
      try {
        const endpoint = import.meta.env.VITE_BASE_SEARCHER;

        await Promise.all(
          selectedSchools.map(async ({ name, id }) => {
            const fyName = name;
            const fyId = id;

            const associatedMajors = selectedMajors[id];

            associatedMajors.map(async ({ major, key }) => {
              const majorId = `${academicYear}/${selectedCCC.id}/to/${fyId}/Major/${key}`;

              const response = await fetch(
                `${endpoint}/?cccId=${selectedCCC.id}&fyId=${fyId}&yr=${academicYear}&majorId=${majorId}`
              );

              if (!response.ok) {
                throw new Error(
                  `Failed primary search for ${fyName}, ${major}`
                );
              }

              const newArticulations = await response.json();

              setBaseArticulations(newArticulations);
            });
          })
        );
      } catch (err) {
        console.error("Failed primary search: ", err);

        setError(
          "Critical error fetching articulations for selected primary community college. Please refresh the page."
        );
      }
    }

    if (selectedCCC.id) {
      getBaseArticulations();
    }
  }, [selectedSchools, selectedMajors, selectedCCC.id]);

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
            optionNameLabel="name"
            optionIdLabel="id"
            options={universities}
            placeholderTxt="Select a university..."
            updateParent={setSelectedSchools}
            searchAlgorithm={uniSearch}
            inputId="universities"
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
    const handleMajorSelect = (schoolId) => (newSelections) => {
      setSelectedMajors((prev) => {
        const updatedMajors = { ...prev };

        if (newSelections.length === 0) {
          delete updatedMajors[schoolId];
        } else {
          updatedMajors[schoolId] = newSelections;
        }

        return updatedMajors;
      });
    };

    const majorsForEachSchool = Object.values(selectedMajors);

    return (
      <>
        <header>
          <h1>CCCBuilder</h1>
          <p className="user-guide">
            Select at least one major for each school.
          </p>
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
                    optionNameLabel="major"
                    optionIdLabel="key"
                    options={majors[id] || []}
                    placeholderTxt="Select a major..."
                    updateParent={handleMajorSelect(id)}
                    searchAlgorithm={ccAndMajorSearch}
                    inputId={`major-select-${id}`}
                  />
                </div>
              );
            })}
          </div>
          {majorsForEachSchool.length === selectedSchools.length ? (
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
  } else if (currentStage === "primary-cc-select") {
    return (
      <>
        <header>
          <h1>CCCBuilder</h1>
          <p className="user-guide">Select your primary community college.</p>
          <div className="progress-container">
            <label htmlFor="plan-progress">20% done</label>
            <progress
              id="plan-progress"
              value={planProgress}
              max={100}
            ></progress>
          </div>
        </header>
        <main>
          <SingleAutocomplete
            optionNameLabel="name"
            optionIdLabel="id"
            options={caliCCs}
            placeholderTxt="Select a community college..."
            updateParent={setSelectedCCC}
            searchAlgorithm={ccAndMajorSearch}
            inputId="community-colleges"
          />
          {selectedCCC.name ? (
            <button
              type="button"
              className="next"
              onClick={() => {
                setPlanProgress(50);
                setCurrentStage("primary-cc-search");
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
  } else if (currentStage === "primary-cc-search") {
    return (
      <>
        <header>
          <h1>CCCBuilder</h1>
          <p className="user-guide">
            Search for any missing articulations and make the necessary choices.
          </p>
          <div className="progress-container">
            <label htmlFor="plan-progress">70% done</label>
            <progress
              id="plan-progress"
              value={planProgress}
              max={100}
            ></progress>
          </div>
        </header>
        <main>
          <p> pypp</p>
        </main>
      </>
    );
  }
}

export default App;
