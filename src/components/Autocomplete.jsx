import PropTypes from "prop-types";

import { useEffect, useRef, useState } from "react";

import "../styles/Autocomplete.css";

import MagnifyingGlass from "../assets/magnify.svg";
import XCircle from "../assets/close-circle.svg";

import CheckboxOption from "./CheckboxOption";
import Input from "./Input";

function SelectedOption({ text, clickHandler }) {
  return (
    <button className="selected-opt" onClick={clickHandler}>
      <img src={XCircle} alt="Close" />
      {text}
    </button>
  );
}

SelectedOption.propTypes = {
  text: PropTypes.string.isRequired,
  clickHandler: PropTypes.func.isRequired,
};

function Autocomplete({
  options,
  placeholderTxt,
  updateParent,
  searchAlgorithm,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);

  const optionsRef = useRef();
  const inputRef = useRef();
  const selectedOptRef = useRef();

  const filteredOptions = searchQuery
    ? options.filter(({ name }) => searchAlgorithm(name, searchQuery))
    : options;

  function updateSearch(e) {
    setSearchQuery(e.target.value);
  }

  function toggleOptions(e) {
    if (
      optionsRef.current &&
      !optionsRef.current.contains(e.target) &&
      inputRef.current &&
      !inputRef.current.contains(e.target) &&
      selectedOptRef.current &&
      !selectedOptRef.current.contains(e.target)
    ) {
      setShowOptions(false);
    }
  }

  function toggleSelectOption(optionId) {
    const selectedLocation = selectedOptions.findIndex(
      (option) => Object.values(option)[1] === optionId
    );

    let newSelectedOptions;

    // -1 -> not found in selectedOptions
    if (selectedLocation === -1) {
      const matchingOption = filteredOptions.find(
        (option) => Object.values(option)[1] === optionId
      );

      newSelectedOptions = [...selectedOptions, matchingOption];
    } else {
      newSelectedOptions = [...selectedOptions];
      newSelectedOptions.splice(selectedLocation, 1);
    }

    setSelectedOptions(newSelectedOptions);
    updateParent(newSelectedOptions);
  }

  useEffect(() => {
    document.addEventListener("click", toggleOptions, true);

    return () => {
      document.removeEventListener("click", toggleOptions, true);
    };
  }, []);

  return (
    <>
      <div className="autocomplete-container">
        <div className="selected-options" ref={selectedOptRef}>
          {selectedOptions.map((opt, index) => {
            const optValues = Object.values(opt);

            const optName = optValues[0];

            return (
              <SelectedOption
                key={index}
                text={optName}
                clickHandler={() => {
                  const copySelected = [...selectedOptions];
                  copySelected.splice(index, 1);

                  setSelectedOptions(copySelected);
                  updateParent(copySelected);
                }}
              />
            );
          })}
        </div>
        <div className="search-input">
          <img src={MagnifyingGlass} />
          <Input
            id="universities"
            type="text"
            val={searchQuery}
            placeholder={placeholderTxt}
            ref={inputRef}
            changeHandler={updateSearch}
            clickHandler={() => setShowOptions(true)}
          />
        </div>
        {showOptions ? (
          <div className="autocomplete-options" ref={optionsRef}>
            {filteredOptions.length === 0
              ? "No results"
              : filteredOptions.map((opt) => {
                  const optValues = Object.values(opt);

                  const optName = optValues[0];
                  const optId = optValues[1];

                  const isSelected = selectedOptions.some(
                    (option) => Object.values(option)[1] === optId
                  );

                  return (
                    <CheckboxOption
                      optText={optName}
                      checked={isSelected}
                      clickHandler={() => toggleSelectOption(optId)}
                      key={optId}
                    />
                  );
                })}
          </div>
        ) : (
          ""
        )}
      </div>
    </>
  );
}

Autocomplete.propTypes = {
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

export default Autocomplete;
