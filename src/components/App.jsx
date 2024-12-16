import "../styles/App.css";
import Autocomplete from "./Autocomplete";

import { schools } from "../utils/staticAssistData";

function App() {
  return (
    <>
      <header>
        <h1>CCCBuilder</h1>
        <p className="user-guide">
          Welcome! First, create a list of universities to transfer to.
        </p>
      </header>
      <main>
        <Autocomplete options={schools} />
      </main>
    </>
  );
}

export default App;
