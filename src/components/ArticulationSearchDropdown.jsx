import PropTypes from "prop-types";

import "../styles/ArticulationSearchDropdown.css";
import { useEffect, useState } from "react";
import {
  finalizeSearch,
  getArticulationParams,
  getClassFromDb,
  sortClassData,
} from "../utils/tvUtils";
import { getEquivalentArtInfo, myArtInPlan } from "../utils/planTools";

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

function renderCourseItem(item, baseKey) {
  if (Array.isArray(item)) {
    return item.map((subitem) => renderCourseItem(subitem));
  }

  if (typeof item !== "string") {
    const courseName = `${item.prefix} ${item.courseNumber} - ${item.courseTitle}`;

    return <p key={`${baseKey}-${courseName}`}>{courseName}</p>;
  }
}

function SearchArtOption({
  paramsList,
  inputName,
  inPlan,
  searchArt,
  children,
  toggleAudit,
  onArticulationSelect,
  planCourses,
  cachedSearch,
}) {
  const [optForPlan, setOptForPlan] = useState({});

  useEffect(() => {
    async function selectEquivalentPrajArticulation() {
      toggleAudit((prev) => !prev);

      try {
        const endpoint = import.meta.env.VITE_PRAJWAL_ARTICULATIONS;

        const response = await fetch(endpoint, {
          body: JSON.stringify(paramsList),
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Connection: "keep-alive",
          },
        });

        if (response.ok) {
          const prajArt = await response.json();

          const equivalent = getEquivalentArtInfo(optForPlan, prajArt);

          const fyCourse =
            equivalent.articulationType === "Course"
              ? {
                  courseTitle: equivalent.courseTitle,
                  coursePrefix: equivalent.coursePrefix,
                  courseNumber: equivalent.courseNumber,
                  courseId: equivalent.courseId,
                }
              : {
                  seriesTitle: equivalent.seriesTitle,
                  seriesId: equivalent.seriesId,
                };

          onArticulationSelect(
            [...planCourses],
            equivalent.option,
            equivalent,
            fyCourse,
            prajArt,
            cachedSearch,
            optForPlan
          );
        }
      } catch (err) {
        console.error("Failed articulations search: ", err);
      } finally {
        toggleAudit((prev) => !prev);
      }
    }

    if (optForPlan.prefix || optForPlan.length > 0) {
      selectEquivalentPrajArticulation();
    }
  }, [
    optForPlan,
    paramsList,
    toggleAudit,
    onArticulationSelect,
    cachedSearch,
    planCourses,
  ]);

  return (
    <label className="search-articulation-option">
      <input
        type="radio"
        name={inputName}
        checked={inPlan}
        onChange={() => {
          if (!inPlan) {
            setOptForPlan(searchArt);
          }

          /*

        ... will need to deal with lesser ArticulationSelectDropdowns by replacing the articulation in their parent CourseItems (somehow)
    
        ^ maybe this logic can go into onArticulationSelect


        */
        }}
      />
      <>{children}</>
    </label>
  );
}

SearchArtOption.propTypes = {
  paramsList: PropTypes.arrayOf(
    PropTypes.shape({
      cccId: PropTypes.number.isRequired,
      fyId: PropTypes.number.isRequired,
      yr: PropTypes.number.isRequired,
      majorId: PropTypes.string.isRequired,
    }).isRequired
  ).isRequired,
  inputName: PropTypes.string.isRequired,
  searchArt: PropTypes.any.isRequired,
  inPlan: PropTypes.bool.isRequired,
  existingEquivalent: PropTypes.any,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  toggleAudit: PropTypes.func.isRequired,
  onArticulationSelect: PropTypes.func.isRequired,
  planCourses: PropTypes.array.isRequired,
  cachedSearch: PropTypes.arrayOf(StreamArticulation),
};

function renderStreamArticulations(
  streamArticulations,
  inputName,
  paramsList,
  toggleAudit,
  planCourses,
  onArticulationSelect,
  cachedSearch
) {
  const sortedItems = sortClassData(streamArticulations);
  const renderedElements = [];

  for (let i = 0; i < sortedItems.length; i++) {
    const subitem = sortedItems[i];
    const optKey = `${inputName}-search-option-${i}`;

    const inPlan = myArtInPlan(subitem, planCourses);

    if (Array.isArray(subitem)) {
      renderedElements.push(
        <div key={`${optKey}-group`} className="search-art-optgroup">
          <SearchArtOption
            key={optKey}
            paramsList={paramsList}
            inputName={inputName}
            searchArt={subitem}
            inPlan={inPlan}
            toggleAudit={toggleAudit}
            planCourses={planCourses}
            onArticulationSelect={onArticulationSelect}
            cachedSearch={cachedSearch}
          >
            <div className="search-art-courses">
              {renderCourseItem(subitem, optKey)}
            </div>
          </SearchArtOption>
        </div>
      );
    } else if (subitem.courseNumber && subitem.courseTitle && subitem.prefix) {
      const courseName = `${subitem.prefix} ${subitem.courseNumber} - ${subitem.courseTitle}`;

      renderedElements.push(
        <SearchArtOption
          key={optKey}
          paramsList={paramsList}
          inputName={inputName}
          searchArt={subitem}
          inPlan={inPlan}
          toggleAudit={toggleAudit}
          planCourses={planCourses}
          onArticulationSelect={onArticulationSelect}
          cachedSearch={cachedSearch}
        >
          <p key={`${optKey}-text`}>{courseName}</p>
        </SearchArtOption>
      );
    }
  }

  return renderedElements;
}

function ArticulationList({
  cccInfo,
  inputName,
  streamArticulations,
  createArticulationParams,
  toggleAudit,
  planCourses,
  onArticulationSelect,
  cachedSearch,
}) {
  const paramsList = createArticulationParams(cccInfo.cccId);

  const listBaseKey = `${cccInfo.cccId}-${inputName}`;

  return (
    <div key={`list-${listBaseKey}`} className="articulation-list">
      <p key={`ccc-${listBaseKey}`} className="ccc-name">
        {cccInfo.cccName}
      </p>
      <div key={`stream-${listBaseKey}`} className="stream-articulations">
        {renderStreamArticulations(
          streamArticulations,
          inputName,
          paramsList,
          toggleAudit,
          planCourses,
          onArticulationSelect,
          cachedSearch
        )}
      </div>
    </div>
  );
}

ArticulationList.propTypes = {
  cccInfo: PropTypes.shape({
    cccName: PropTypes.string.isRequired,
    cccId: PropTypes.number.isRequired,
  }).isRequired,
  inputName: PropTypes.string.isRequired,
  streamArticulations: PropTypes.arrayOf(StreamArticulation),
  createArticulationParams: PropTypes.func.isRequired,
  toggleAudit: PropTypes.func.isRequired,
  planCourses: PropTypes.array.isRequired,
  onArticulationSelect: PropTypes.func.isRequired,
  cachedSearch: PropTypes.arrayOf(StreamArticulation),
};

function ArticulationSearchDropdown({
  fyCourseId,
  majorId,
  cachedSearch,
  updateArticulations,
  createArticulationParams,
  onArticulationSelect,
  planCourses,
}) {
  const [searchActive, setSearchActive] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);

  const [foundArticulations, setFoundArticulations] = useState([]);

  const [auditInProgress, setAuditInProgress] = useState(false);

  const cccCount = 116;
  const availableArticulations = cachedSearch || foundArticulations;

  const renderedArticulations = availableArticulations.map((art, artIndex) => {
    if (!art || !art.result) return null;

    const { result } = art;

    const courseCache = [];
    let cccName = "";
    let agreementLink = "";

    for (let i = 0; i < result.length; i++) {
      const item = result[i];

      if (!item) return null;

      if (item.ccName) {
        cccName = item.ccName;
      } else if (item.agreementLink) {
        agreementLink = item.agreementLink;
      } else {
        courseCache.push(item);
      }

      if (cccName && agreementLink) {
        const agreementUrl = new URL(agreementLink);
        const cccId = Number(agreementUrl.searchParams.get("institution"));

        return (
          <ArticulationList
            key={`${cccName}-${artIndex}-for-${fyCourseId}`}
            cccInfo={{
              cccName,
              cccId,
            }}
            inputName={`radio-for-${fyCourseId}`}
            streamArticulations={courseCache}
            updateArticulations={updateArticulations}
            createArticulationParams={createArticulationParams}
            toggleAudit={(newVal) => setAuditInProgress(newVal)}
            onArticulationSelect={onArticulationSelect}
            planCourses={planCourses}
            cachedSearch={cachedSearch}
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
        <p
          className="subtitle"
          style={{ fontWeight: "normal", textAlign: "center" }}
        >
          This may take some time. Final result will be preserved.
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
  } else if (auditInProgress) {
    return (
      <div className="articulation-search-dropdown">
        <p
          className="subtitle"
          style={{
            animationName: "waver",
            animationDuration: "2s",
            animationIterationCount: "infinite",
            fontSize: "1.3em",
          }}
        >
          Optimizing plan...
        </p>
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
  createArticulationParams: PropTypes.func.isRequired,
  planCourses: PropTypes.array.isRequired,
  onArticulationSelect: PropTypes.func.isRequired,
};

export default ArticulationSearchDropdown;
