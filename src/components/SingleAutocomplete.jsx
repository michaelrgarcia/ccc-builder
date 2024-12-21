import PropTypes from "prop-types";

import { useEffect, useRef, useState } from "react";
import { matchName } from "../utils/search";

import "../styles/Autocomplete.css";

import MagnifyingGlass from "../assets/magnify.svg";
import XCircle from "../assets/close-circle.svg";

import CheckboxOption from "./CheckboxOption";
import Input from "./Input";

function SingleAutocomplete({ options, placeholderTxt, updateParent }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState({});

  const containerRef = useRef();

  const filteredOptions = searchQuery
    ? options.filter(({ name }) => matchName(name, searchQuery))
    : options;

  function updateSearch(e) {
    setSearchQuery(e.target.value);
  }

  function toggleOptions(e) {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      setShowOptions(false);
    }
  }

  function toggleSelectOption(optionId) {
    const matchingOption = filteredOptions.find(
      (option) => Object.values(option)[1] === optionId
    );

    setSelectedOption(matchingOption);
    updateParent(matchingOption);
  }

  useEffect(() => {
    document.addEventListener("click", toggleOptions, true);

    return () => {
      document.removeEventListener("click", toggleOptions, true);
    };
  }, []);

  return (
    <div className="autocomplete-container" ref={containerRef}>
      <div className="search-input">
        {selectedOption.name ? (
          <>
            <Input
              id="community-colleges"
              type="text"
              val={selectedOption.name}
              placeholder={placeholderTxt}
              changeHandler={updateSearch}
              clickHandler={() => setShowOptions(true)}
            />
            <img
              src={XCircle}
              className="deselect-option"
              onClick={() => {
                setSelectedOption({});
                updateParent({});
              }}
            />
          </>
        ) : (
          <>
            <img src={MagnifyingGlass} />
            <Input
              id="community-colleges"
              type="text"
              val={searchQuery}
              placeholder={placeholderTxt}
              changeHandler={updateSearch}
              clickHandler={() => setShowOptions(true)}
            />
          </>
        )}
      </div>
      {showOptions ? (
        <div className="autocomplete-options">
          {filteredOptions.length === 0
            ? "No results"
            : filteredOptions.map((opt) => {
                const optValues = Object.values(opt);

                const optName = optValues[0];
                const optId = optValues[1];

                const isSelected = selectedOption.id === optId;

                return (
                  <button
                    type="button"
                    className={`single-option ${isSelected ? "selected" : ""}`}
                    key={optId}
                  >
                    <div
                      className="opt-wrapper"
                      onClick={() => toggleSelectOption(optId)}
                    >
                      <p>{optName}</p>
                    </div>
                  </button>
                );
              })}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

SingleAutocomplete.propTypes = {
  // array of objects with a name and id
  options: PropTypes.arrayOf(
    PropTypes.objectOf((propValue, key, componentName, propFullName) => {
      if (typeof key !== "string") {
        return new Error(
          `${propFullName} key in ${componentName} must be a string.`
        );
      }

      if (
        typeof propValue[key] !== "string" &&
        typeof propValue[key] !== "number"
      ) {
        return new Error(
          `${propFullName} in ${componentName} must have values that are strings or numbers.`
        );
      }

      return null;
    })
  ).isRequired,
  placeholderTxt: PropTypes.string,
  updateParent: PropTypes.func,
};

export default SingleAutocomplete;
