import "../styles/App.css";
import Autocomplete from "./Autocomplete";

const schools = [
  {
    name: "University of California, Berkeley",
    id: 3,
  },
  {
    name: "University of California, Los Angeles",
    id: 3,
  },
  {
    name: "University of California, Irvine",
    id: 3,
  },
  {
    name: "San Jose State University",
    id: 3,
  },
  {
    name: "San Francisco State University",
    id: 3,
  },
  {
    name: "California State University, Stanislaus",
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
