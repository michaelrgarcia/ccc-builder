import { useState } from "react";

import { schools } from "../utils/staticAssistData";

import "../styles/App.css";
import Autocomplete from "./Autocomplete";

function App() {
  const [selectedSchools, setSelectedSchools] = useState([]);

  return (
    <>
      <header>
        <h1>CCCBuilder</h1>
        <p className="user-guide">
          Welcome! First, create a list of universities to transfer to.
        </p>
      </header>
      <main>
        <Autocomplete options={schools} updateParent={setSelectedSchools} />
        {selectedSchools.length > 0 ? (
          <button type="button" className="next">
            Next
          </button>
        ) : (
          ""
        )}
      </main>
    </>
  );
}

export default App;
