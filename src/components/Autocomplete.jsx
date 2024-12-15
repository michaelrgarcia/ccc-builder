import PropTypes from "prop-types";

import { useState } from "react";

import "../styles/Autocomplete.css";
import CheckboxOption from "./CheckboxOption";

function Autocomplete({ options }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showOptions, setShowOptions] = useState(false);

  function updateSearch(e) {
    setSearchQuery(e.target.value);
  }

  function toggleOptions() {
    setShowOptions(!showOptions);
  }

  return (
    <div className="autocomplete-container">
      <input
        type="text"
        placeholder="Select an institution..."
        onChange={updateSearch}
        onClick={toggleOptions}
      />
      <div className="autocomplete-options">
        {options.map(({ name }, index) => (
          <CheckboxOption optText={name} key={index} />
        ))}
      </div>
    </div>
  );
}

Autocomplete.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default Autocomplete;
