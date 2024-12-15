import PropTypes from "prop-types";

import { useState } from "react";

import "../styles/Autocomplete.css";
import "../styles/Checkbox.css";

import Checkbox from "./Checkbox";

function CheckboxOption({ optText, checked = false }) {
  const [isSelected, setIsSelected] = useState(checked);

  function toggleCheck() {
    setIsSelected(!isSelected);
  }

  return (
    <div className={`checkbox-option ${isSelected ? "selected" : ""}`}>
      <div className="opt-wrapper" onClick={toggleCheck}>
        <Checkbox checked={isSelected} onChange={toggleCheck} />
        <p>{optText}</p>
      </div>
    </div>
  );
}

CheckboxOption.propTypes = {
  optText: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
};

export default CheckboxOption;
