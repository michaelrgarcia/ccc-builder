import PropTypes from "prop-types";
import { forwardRef } from "react";

const Input = forwardRef((props, ref) => {
  const { id, type, val, placeholder, changeHandler, clickHandler } = props;

  return (
    <input
      id={id}
      type={type}
      value={val}
      placeholder={placeholder}
      ref={ref}
      onChange={changeHandler}
      onClick={clickHandler}
    />
  );
});

Input.displayName = "Input";

Input.propTypes = {
  id: PropTypes.string,
  type: PropTypes.string.isRequired,
  val: PropTypes.string,
  placeholder: PropTypes.string,
  changeHandler: PropTypes.func.isRequired,
  clickHandler: PropTypes.func,
};

export default Input;
