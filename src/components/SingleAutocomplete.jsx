import PropTypes from "prop-types";

import { useCallback, useEffect, useRef, useState } from "react";

import "../styles/Autocomplete.css";

import MagnifyingGlass from "../assets/magnify.svg";
import XCircle from "../assets/close-circle.svg";

import Input from "./Input";

function SingleAutocomplete({
  optionNameLabel,
  optionIdLabel,
  options,
  placeholderTxt,
  updateParent,
  searchAlgorithm,
  inputId,
}) {
  const [inputValues, setInputValues] = useState({
    searchQuery: "",
    tempVal: "",
  });
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState({});

  const containerRef = useRef();

  const filteredOptions = inputValues.searchQuery
    ? options.filter((option) =>
        searchAlgorithm(option[optionNameLabel], inputValues.searchQuery)
      )
    : options;

  function updateSearch(e) {
    setInputValues({
      searchQuery: e.target.value,
      tempVal: e.target.value,
    });
  }

  function toggleSelectOption(optionId) {
    const matchingOption = filteredOptions.find(
      (option) => option[optionIdLabel] === optionId
    );

    setSelectedOption(matchingOption);
    updateParent(matchingOption);
  }

  const toggleOptions = useCallback(
    (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowOptions(false);
        setInputValues({
          searchQuery: "",
          tempVal: selectedOption.name,
        });
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
              id={inputId}
              type="text"
              val={inputValues.tempVal}
              placeholder={placeholderTxt}
              changeHandler={updateSearch}
              clickHandler={() => setShowOptions(true)}
            />
            <img
              src={XCircle}
              className="deselect-option"
              onClick={() => {
                setInputValues({
                  searchQuery: "",
                  tempVal: "",
                });

                setSelectedOption({});
                updateParent({});
              }}
            />
          </>
        ) : (
          <>
            <img src={MagnifyingGlass} />
            <Input
              id={inputId}
              type="text"
              val={inputValues.searchQuery}
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
            : filteredOptions.map((option) => {
                const isSelected = selectedOption.id === option[optionIdLabel];

                return (
                  <button
                    type="button"
                    className={`single-option ${isSelected ? "selected" : ""}`}
                    key={option[optionIdLabel]}
                  >
                    <div
                      className="opt-wrapper"
                      onClick={() => {
                        toggleSelectOption(option[optionIdLabel]);
                        setInputValues({
                          ...inputValues,
                          tempVal: option[optionNameLabel],
                        });
                      }}
                    >
                      <p>{option[optionNameLabel]}</p>
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
  optionNameLabel: PropTypes.string.isRequired,
  optionIdLabel: PropTypes.string.isRequired,
  options: (props, propName, componentName) => {
    const { options, optionNameLabel, optionIdLabel } = props;

    if (!Array.isArray(options)) {
      return new Error(`${propName} in ${componentName} must be an array.`);
    }

    for (let i = 0; i < options.length; i++) {
      const option = options[i];

      if (
        typeof option[optionNameLabel] !== "string" &&
        typeof option[optionNameLabel] !== "number"
      ) {
        return new Error(
          `Invalid ${propName} at index ${i}: Each object must have a valid "${optionNameLabel}" (string or number).`
        );
      }

      if (
        typeof option[optionIdLabel] !== "string" &&
        typeof option[optionIdLabel] !== "number"
      ) {
        return new Error(
          `Invalid ${propName} at index ${i}: Each object must have a valid "${optionIdLabel}" (string or number).`
        );
      }
    }

    return null;
  },
  placeholderTxt: PropTypes.string,
  updateParent: PropTypes.func,
  searchAlgorithm: PropTypes.func.isRequired,
  inputId: PropTypes.string.isRequired,
};

export default SingleAutocomplete;
