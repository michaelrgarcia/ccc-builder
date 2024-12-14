import Checkbox from "./Checkbox";

import "../styles/App.css";

function App() {
  return (
    <>
      <header>
        <h1>CCCBuilder</h1>
        <p className="user-guide">
          Select the institutions you would like to transfer.
        </p>
      </header>
      <Checkbox checked={true} />
    </>
  );
}

export default App;
