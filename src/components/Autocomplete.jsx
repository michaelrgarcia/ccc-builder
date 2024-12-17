import PropTypes from "prop-types";

import { useEffect, useRef, useState } from "react";
import { matchName } from "../utils/search";

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

function Autocomplete({ options }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]); // need to move this state up to App

  const optionsRef = useRef();
  const inputRef = useRef();
  const selectedOptRef = useRef();

  const filteredOptions = searchQuery
    ? options.filter(({ name }) => matchName(name, searchQuery))
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

  function deselectOption(selectedLocation) {
    const copySelected = [...selectedOptions];
    copySelected.splice(selectedLocation, 1);

    setSelectedOptions(copySelected);
  }

  function toggleSelectOption(optionId) {
    const selectedLocation = selectedOptions.findIndex(
      (option) => option.id === optionId
    );

    // -1 -> not found in selectedOptions
    if (selectedLocation === -1) {
      const matchingOption = filteredOptions.find(
        (option) => option.id === optionId
      );

      setSelectedOptions([...selectedOptions, matchingOption]);
    } else {
      deselectOption(selectedLocation);
    }
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
          {selectedOptions.map(({ name }, index) => (
            <SelectedOption
              key={index}
              text={name}
              clickHandler={() => deselectOption(index)}
            />
          ))}
        </div>
        <div className="search-input">
          <img src={MagnifyingGlass} />
          <Input
            id="universities"
            type="text"
            val={searchQuery}
            placeholder="Select an institution..."
            ref={inputRef}
            changeHandler={updateSearch}
            clickHandler={() => setShowOptions(true)}
          />
        </div>
        {showOptions ? (
          <div className="autocomplete-options" ref={optionsRef}>
            {filteredOptions.length === 0
              ? "No results"
              : filteredOptions.map(({ name, id }) => {
                  const isSelected = selectedOptions.some(
                    (option) => option.id === id
                  );

                  return (
                    <CheckboxOption
                      optText={name}
                      checked={isSelected}
                      clickHandler={() => toggleSelectOption(id)}
                      key={id}
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
  options: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default Autocomplete;
