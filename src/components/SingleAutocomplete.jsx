import PropTypes from "prop-types";

import { useCallback, useEffect, useRef, useState } from "react";

import "../styles/Autocomplete.css";

import MagnifyingGlass from "../assets/magnify.svg";
import XCircle from "../assets/close-circle.svg";

import Input from "./Input";

function SingleAutocomplete({
  options,
  placeholderTxt,
  updateParent,
  searchAlgorithm,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState({});

  const [tempInputVal, setTempInputVal] = useState("");

  const containerRef = useRef();

  const filteredOptions = searchQuery
    ? options.filter(({ name }) => searchAlgorithm(name, searchQuery))
    : options;

  function updateSearch(e) {
    setSearchQuery(e.target.value);
    setTempInputVal(e.target.value);
  }

  function toggleSelectOption(optionId) {
    const matchingOption = filteredOptions.find(
      (option) => Object.values(option)[1] === optionId
    );

    setSelectedOption(matchingOption);
    updateParent(matchingOption);
  }

  const toggleOptions = useCallback(
    (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowOptions(false);
        setSearchQuery("");
        setTempInputVal(selectedOption.name);
      }
    },
    [selectedOption.name]
  );

  useEffect(() => {
    document.addEventListener("click", toggleOptions, true);

    return () => {
      document.removeEventListener("click", toggleOptions, true);
    };
  }, [toggleOptions]);

  return (
    <div className="autocomplete-container" ref={containerRef}>
      <div className="search-input">
        {selectedOption.name ? (
          <>
            <Input
              id="community-colleges"
              type="text"
              val={tempInputVal}
              placeholder={placeholderTxt}
              changeHandler={updateSearch}
              clickHandler={() => setShowOptions(true)}
            />
            <img
              src={XCircle}
              className="deselect-option"
              onClick={() => {
                setSearchQuery("");
                setTempInputVal("");

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
                      onClick={() => {
                        toggleSelectOption(optId);
                        setTempInputVal(optName);
                      }}
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
  searchAlgorithm: PropTypes.func.isRequired,
};

export default SingleAutocomplete;
