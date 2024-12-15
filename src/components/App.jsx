import "../styles/App.css";
import Autocomplete from "./Autocomplete";

const schools = [
  {
    name: "test",
    id: 3,
  },
  {
    name: "test",
    id: 3,
  },
  {
    name: "test",
    id: 3,
  },
  {
    name: "test",
    id: 3,
  },
  {
    name: "test",
    id: 3,
  },
  {
    name: "test",
    id: 3,
  },
];

function App() {
  return (
    <>
      <header>
        <h1>CCCBuilder</h1>
        <p className="user-guide">
          Welcome! First, create a list of universities to transfer to.
        </p>
      </header>
      <Autocomplete options={schools} />
    </>
  );
}

export default App;
