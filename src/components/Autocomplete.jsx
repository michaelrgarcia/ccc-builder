import PropTypes from "prop-types";

import { useState } from "react";

import "../styles/Autocomplete.css";

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
      <input type="text" onChange={updateSearch} onClick={toggleOptions} />
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
