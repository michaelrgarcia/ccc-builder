import PropTypes from "prop-types";

import "../styles/Autocomplete.css";
import "../styles/Checkbox.css";

import Checkbox from "./Checkbox";

function CheckboxOption({ optText, clickHandler, checked }) {
  return (
    <div className={`checkbox-option ${checked ? "selected" : ""}`}>
      <div className="opt-wrapper" onClick={clickHandler}>
        <Checkbox checked={checked} onChange={clickHandler} />
        <p>{optText}</p>
      </div>
    </div>
  );
}

CheckboxOption.propTypes = {
  optText: PropTypes.string.isRequired,
  clickHandler: PropTypes.func,
  checked: PropTypes.bool.isRequired,
};

export default CheckboxOption;
