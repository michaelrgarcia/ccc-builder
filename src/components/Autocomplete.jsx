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
  optionNameLabel,
  optionIdLabel,
  options,
  placeholderTxt,
  updateParent,
  searchAlgorithm,
  inputId,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);

  const containerRef = useRef();

  const filteredOptions = searchQuery
    ? options.filter((option) =>
        searchAlgorithm(option[optionNameLabel], searchQuery)
      )
    : options;

  function updateSearch(e) {
    setSearchQuery(e.target.value);
    setShowOptions(true);
  }

  function toggleSelectOption(optionId) {
    const selectedLocation = selectedOptions.findIndex(
      (option) => option[optionIdLabel] === optionId
    );

    let newSelectedOptions;

    // -1 -> not found in selectedOptions
    if (selectedLocation === -1) {
      const matchingOption = filteredOptions.find(
        (option) => option[optionIdLabel] === optionId
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
    function toggleOptions(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    }

    document.addEventListener("click", toggleOptions, true);

    return () => {
      document.removeEventListener("click", toggleOptions, true);
    };
  }, []);

  return (
    <div className="autocomplete-container" ref={containerRef}>
      <div className="selected-options">
        {selectedOptions.map((option, index) => {
          return (
            <SelectedOption
              key={option[optionIdLabel]}
              text={option[optionNameLabel]}
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
          id={inputId}
          type="text"
          val={searchQuery}
          placeholder={placeholderTxt}
          changeHandler={updateSearch}
          clickHandler={() => setShowOptions(true)}
        />
      </div>
      {showOptions ? (
        <div className="autocomplete-options">
          {filteredOptions.length === 0
            ? "No results"
            : filteredOptions.map((option) => {
                const isSelected = selectedOptions.some(
                  (selected) =>
                    selected[optionIdLabel] === option[optionIdLabel]
                );

                return (
                  <CheckboxOption
                    optText={option[optionNameLabel]}
                    checked={isSelected}
                    clickHandler={() =>
                      toggleSelectOption(option[optionIdLabel])
                    }
                    key={option[optionIdLabel]}
                  />
                );
              })}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

Autocomplete.propTypes = {
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

export default Autocomplete;
