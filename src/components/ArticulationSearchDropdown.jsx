import PropTypes from "prop-types";

import "../styles/ArticulationSearchDropdown.css";
import { useCallback, useEffect, useState } from "react";
import {
  finalizeSearch,
  getArticulationParams,
  getClassFromDb,
} from "../utils/tvUtils";

const PrajArticulation = PropTypes.shape({
  articulationType: PropTypes.oneOf(["Course", "Series"]).isRequired,
  courseTitle: PropTypes.string,
  seriesTitle: PropTypes.string,
  coursePrefix: PropTypes.string,
  courseNumber: PropTypes.string,
  courseId: PropTypes.string,
  seriesId: PropTypes.string,
  credits: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  articulationOptions: PropTypes.arrayOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        courseTitle: PropTypes.string.isRequired,
        courseNumber: PropTypes.string.isRequired,
        coursePrefix: PropTypes.string.isRequired,
        courseId: PropTypes.string.isRequired,
        note: PropTypes.string,
      })
    )
  ).isRequired,
});

function ArticulationSearchDropdown({
  articulation,
  planCourses,
  onArticulationSelect,
  fyCourseId,
  majorId,
}) {
  const [searchActive, setSearchActive] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [foundArticulations, setFoundArticulations] = useState([]);

  const cccCount = 116;

  useEffect(() => {
    if (!searchActive) return;

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

      setFoundArticulations([]);

      let articulations;

      try {
        articulations = await getClassFromDb(fyCourseId);

        if (!articulations && links) {
          articulations = await processChunks(linksCopy);

          await finalizeSearch(fyCourseId, articulations);
        }
      } catch (err) {
        console.error("error processing requests", err);
      } finally {
        setSearchActive(false);
      }
    }

    searchForArticulations();
  }, [fyCourseId, majorId, searchActive]);

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
        <p className="subtitle">Articulations found: </p>
        <div className="search-articulations"></div>
      </div>
    );
  } else if (!searchActive && foundArticulations.length === 0) {
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
  } else if (!searchActive && foundArticulations.length > 0) {
    return <p>articulations found! soon to be rendered here</p>;
  }
}

ArticulationSearchDropdown.propTypes = {
  articulation: PrajArticulation,
  planCourses: PropTypes.array.isRequired,
  onArticulationSelect: PropTypes.func.isRequired,
  fyCourseId: PropTypes.string.isRequired,
  majorId: PropTypes.string.isRequired,
};

export default ArticulationSearchDropdown;
