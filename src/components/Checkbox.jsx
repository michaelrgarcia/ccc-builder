import PropTypes from "prop-types";

import { useState } from "react";

import "../styles/Checkbox.css";

function Checkbox({ checked }) {
  const [boxChecked, setBoxChecked] = useState(checked);

  function toggleCheck() {
    setBoxChecked(!boxChecked);
  }

  if (boxChecked) {
    return (
      <label className="checkbox-container">
        Test
        <input type="checkbox" checked={true} onChange={toggleCheck} />
        <span className="checkmark"></span>
      </label>
    );
  } else {
    return (
      <label className="checkbox-container">
        Test
        <input type="checkbox" checked={false} onChange={toggleCheck} />
        <span className="checkmark"></span>
      </label>
    );
  }
}

Checkbox.propTypes = {
  checked: PropTypes.bool,
};

export default Checkbox;
