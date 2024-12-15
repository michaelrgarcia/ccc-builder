import PropTypes from "prop-types";

import { useEffect, useRef, useState } from "react";

import "../styles/Autocomplete.css";
import MagnifyingGlass from "../assets/magnify.svg";

import CheckboxOption from "./CheckboxOption";
import Input from "./Input";

function Autocomplete({ options }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showOptions, setShowOptions] = useState(false);

  const optionsRef = useRef();
  const inputRef = useRef();

  const renderedOptions = options.map(({ name }, index) => (
    <CheckboxOption optText={name} key={index} />
  ));

  function updateSearch(e) {
    setSearchQuery(e.target.value);
  }

  function toggleOptions(e) {
    if (
      optionsRef.current &&
      !optionsRef.current.contains(e.target) &&
      inputRef.current &&
      !inputRef.current.contains(e.target)
    ) {
      setShowOptions(false);
    }
  }

  useEffect(() => {
    document.addEventListener("click", toggleOptions, true);

    return () => {
      document.removeEventListener("click", toggleOptions, true);
    };
  }, []);

  return (
    <div className="autocomplete-container">
      <div className="search-input">
        <img src={MagnifyingGlass} />
        <Input
          id="universities"
          type="text"
          placeholder="Select an institution..."
          ref={inputRef}
          changeHandler={updateSearch}
          clickHandler={() => setShowOptions(true)}
        />
      </div>
      {showOptions ? (
        <div className="autocomplete-options" ref={optionsRef}>
          {renderedOptions}
        </div>
      ) : (
        ""
      )}
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
