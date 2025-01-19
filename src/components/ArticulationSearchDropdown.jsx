import PropTypes from "prop-types";

import "../styles/ArticulationSearchDropdown.css";
import { useEffect, useState } from "react";
import {
  finalizeSearch,
  getArticulationParams,
  getClassFromDb,
  sortClassData,
} from "../utils/tvUtils";

const MyLowerDiv = PropTypes.shape({
  prefix: PropTypes.string,
  courseNumber: PropTypes.string,
  courseTitle: PropTypes.string,
  courseId: PropTypes.string,
  cid: PropTypes.string,
});
const MySeriesItem = PropTypes.oneOfType([PropTypes.string, MyLowerDiv]);
const MySeries = PropTypes.arrayOf(MySeriesItem);
const MyArticulation = PropTypes.oneOfType([MyLowerDiv, MySeries]);

const StreamArticulation = PropTypes.oneOfType([
  MyArticulation,
  PropTypes.string,
]);

function renderCourseItem(item, parentKey = "") {
  if (Array.isArray(item)) {
    return item.map((subitem, index) =>
      renderCourseItem(subitem, `${parentKey}-${index}`)
    );
  }

  if (typeof item !== "string") {
    return (
      <p
        key={parentKey}
      >{`${item.prefix} ${item.courseNumber} - ${item.courseTitle}`}</p>
    );
  }
}

function renderStreamArticulations(items, groupName) {
  const sortedItems = sortClassData(items);
  const renderedElements = [];

  for (let i = 0; i < sortedItems.length; i++) {
    const subitem = sortedItems[i];

    if (Array.isArray(subitem)) {
      const sharedInputName = `${groupName}-group-${i}`;

      renderedElements.push(
        <div key={i} className="search-art-optgroup">
          <label className="search-articulation-option">
            <input
              type="radio"
              name={groupName}
              onClick={() => {
                console.log("xo");
                /*

          * some function that allows user to select articulation for the plan
          * and calls prajwals articulation endpt(s) to check articulatesTo
          
          stopSearch();

          */
              }}
              disabled
            />
            <div className="search-art-courses">
              {renderCourseItem(subitem, sharedInputName)}
            </div>
          </label>
        </div>
      );
    } else if (subitem.courseNumber && subitem.courseTitle && subitem.prefix) {
      const courseName = `${subitem.prefix} ${subitem.courseNumber} - ${subitem.courseTitle}`;

      renderedElements.push(
        <label key={i} className="search-articulation-option">
          <input
            type="radio"
            name={courseName}
            onClick={() => {
              console.log("xo");
              /*

          * some function that allows user to select articulation for the plan
          * and calls prajwals articulation endpt(s) to check articulatesTo
          
          stopSearch();

          */
            }}
            disabled
          />
          <p>{courseName}</p>
        </label>
      );
    }
  }

  return renderedElements;
}

function ArticulationList({ cccName, streamArticulations, stopSearch }) {
  return (
    <div className="articulation-list">
      <p className="ccc-name">{cccName}</p>
      <div className="stream-articulations">
        {renderStreamArticulations(streamArticulations, "root")}
      </div>
    </div>
  );
}

ArticulationList.propTypes = {
  cccName: PropTypes.string.isRequired,
  streamArticulations: PropTypes.arrayOf(StreamArticulation),
  stopSearch: PropTypes.func.isRequired,
};

function ArticulationSearchDropdown({
  fyCourseId,
  majorId,
  cachedSearch,
  updateArticulations,
}) {
  const [searchActive, setSearchActive] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);

  const [foundArticulations, setFoundArticulations] = useState([]);

  const cccCount = 116;
  const availableArticulations = cachedSearch || foundArticulations;

  const renderedArticulations = availableArticulations.map((art, artIndex) => {
    if (!art || !art.result) return null;

    const { result } = art;

    const courseCache = [];
    let collegeName = "";

    for (let i = 0; i < result.length; i++) {
      const item = result[i];

      if (!item) return null;

      if (item.ccName) {
        collegeName = item.ccName;
      } else {
        courseCache.push(item);
      }

      if (collegeName) {
        return (
          <ArticulationList
            key={`${collegeName}-${artIndex}-for-${fyCourseId}`}
            cccName={collegeName}
            streamArticulations={courseCache}
            updateArticulations={updateArticulations}
            stopSearch={() => setSearchActive(false)}
          />
        );
      }
    }
  });

  useEffect(() => {
    if (!searchActive) return;

    // still need to implement messages for the response codes in tvUtils

    const splitMajorId = majorId.split("/");

    const receivingId = splitMajorId[3];
    const majorKey = splitMajorId[splitMajorId.length - 1];
    const year = splitMajorId[0];

    const splitCourseId = fyCourseId.split("_");
    const idForChunks = splitCourseId[0];

    async function streamProcessor(stream) {
      const reader = stream.getReader();
      const decoder = new TextDecoder("utf-8");

      const streamArticulations = [];
      let accumulatedData = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        const decodedChunk = decoder.decode(value, { stream: true });

        accumulatedData += decodedChunk;

        let end = accumulatedData.indexOf("\n");

        while (end !== -1) {
          const jsonString = accumulatedData.slice(0, end);
          accumulatedData = accumulatedData.slice(end + 1);

          try {
            const streamArticulation = JSON.parse(jsonString);

            if (streamArticulation.result) {
              streamArticulations.push(streamArticulation);

              setFoundArticulations((prev) => [...prev, streamArticulation]);
            }

            setSearchProgress((prev) => prev + 1);
          } catch (error) {
            console.error(`error parsing articulation: ${error}`);
          }

          end = accumulatedData.indexOf("\n");
        }
      }

      return streamArticulations;
    }

    async function requestArticulations(linksChunk) {
      let streamArticulations = [];

      try {
        const linksList = JSON.stringify(linksChunk);

        const endpoint = `${
          import.meta.env.VITE_NEW_ARTICULATION_FETCHER
        }/?courseId=${idForChunks}&year=${year}`;

        const response = await fetch(endpoint, {
          body: linksList,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Connection: "keep-alive",
          },
        });

        streamArticulations = await streamProcessor(response.body);
      } catch (error) {
        console.error(`error processing stream: ${error}`);
      }

      return streamArticulations;
    }

    async function processChunks(links, articulations = []) {
      const concurrencyLimit = 29;

      let linksChunk;

      if (links.length === 0) return articulations;

      if (links.length < concurrencyLimit) {
        linksChunk = links.splice(0, links.length - 1);
      } else {
        linksChunk = links.splice(0, concurrencyLimit);
      }

      try {
        const streamArticulations = await requestArticulations(linksChunk);

        articulations.push(...streamArticulations);

        return await processChunks(links, articulations); // recursive call
      } catch (error) {
        console.error("error processing chunk:", error);
      }
    }

    async function searchForArticulations() {
      const links = getArticulationParams(receivingId, majorKey, year);
      const linksCopy = [...links];

      let articulations;

      try {
        articulations = await getClassFromDb(fyCourseId);

        if (!articulations && links) {
          articulations = await processChunks(linksCopy);

          await finalizeSearch(fyCourseId, articulations);
        }

        updateArticulations(articulations);
      } catch (err) {
        console.error("error processing requests", err);
      } finally {
        setSearchActive(false);
      }
    }

    searchForArticulations();
  }, [fyCourseId, majorId, searchActive, updateArticulations]);

  if (searchActive) {
    return (
      <div className="articulation-search-dropdown">
        <div className="loading-container">
          <p
            className="subtitle"
            style={{
              animationName: "waver",
              animationDuration: "2s",
              animationIterationCount: "infinite",
              fontSize: "1.3em",
            }}
          >
            Searching...
          </p>
          <progress
            id="plan-progress"
            value={searchProgress}
            max={cccCount}
          ></progress>
        </div>
        <p className="subtitle">Select 1 option </p>
        <div className="search-articulations">{renderedArticulations}</div>
      </div>
    );
  } else if (!searchActive && availableArticulations.length === 0) {
    return (
      <div className="articulation-search-dropdown">
        <p className="subtitle">Click Search to proceed.</p>
        <p className="subtitle" style={{ fontWeight: "normal" }}>
          This may take some time.
        </p>
        <button
          type="button"
          className="search-articulation"
          onClick={() => setSearchActive(true)}
        >
          Search
        </button>
      </div>
    );
  } else if (!searchActive && availableArticulations.length > 0) {
    return (
      <div className="articulation-search-dropdown">
        <p className="subtitle">Select 1 option</p>
        <div className="search-articulations">{renderedArticulations}</div>
      </div>
    );
  }
}

ArticulationSearchDropdown.propTypes = {
  fyCourseId: PropTypes.string.isRequired,
  majorId: PropTypes.string.isRequired,
  cachedSearch: PropTypes.arrayOf(StreamArticulation),
  updateArticulations: PropTypes.func.isRequired,
};

export default ArticulationSearchDropdown;
