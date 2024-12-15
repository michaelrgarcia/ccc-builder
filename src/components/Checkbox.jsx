import PropTypes from "prop-types";

import "../styles/Checkbox.css";

function Checkbox({ checked, onChange }) {
  return (
    <div className="checkbox-container">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="checkmark" onClick={onChange}></span>
    </div>
  );
}

Checkbox.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default Checkbox;
