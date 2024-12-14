import PropTypes from "prop-types";

import "../styles/Autocomplete.css";
import "../styles/Checkbox.css";

import Checkbox from "./Checkbox";

function CheckboxOption({ optText, checked }) {
  return (
    <div className="checkbox-option">
      <div className="opt-wrapper">
        <Checkbox checked={checked} />
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
