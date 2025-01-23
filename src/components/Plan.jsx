import PropTypes from "prop-types";

import ArticulationSearchDropdown from "./ArticulationSearchDropdown";

import {
  createInstructions,
  getUniName,
  groupByUni,
  findArticulation,
  matchArticulation,
  articulationInPlan,
  requirementCompleted,
  updatePlanCourses,
  populatePlan,
  createArticulatesTo,
  filterSearchArtInPlan,
  myArtInPlan,
  minimizeCourses,
  getSearchArt,
} from "../utils/planTools";

import { useEffect, useState } from "react";

import InfoIcon from "../assets/information-variant-circle-outline.svg";
import FilledInfoIcon from "../assets/information-variant-circle.svg";
import DownArrow from "../assets/chevron-down.svg";
import UpArrow from "../assets/chevron-up.svg";

import "../styles/Plan.css";

const Major = PropTypes.shape({
  key: PropTypes.string.isRequired,
  major: PropTypes.string.isRequired,
});

const Course = PropTypes.shape({
  type: PropTypes.oneOf(["Course", "Series"]).isRequired,
  courseTitle: PropTypes.string,
  seriesTitle: PropTypes.string,
  coursePrefix: PropTypes.string,
  courseNumber: PropTypes.string,
  courseId: PropTypes.string,
  seriesId: PropTypes.string,
  credits: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
});

const CourseGroup = PropTypes.shape({
  type: PropTypes.oneOf(["AllCourses", "NCourses", "NCredits"]).isRequired,
  amount: PropTypes.number,
  courses: PropTypes.arrayOf(Course).isRequired,
});

const Requirement = PropTypes.shape({
  requiredCourses: PropTypes.arrayOf(CourseGroup).isRequired,
  conjunction: PropTypes.oneOf(["And", "Or"]),
});

const RequirementGroup = PropTypes.shape({
  inputs: PropTypes.shape({
    cccId: PropTypes.string,
    fyId: PropTypes.string.isRequired,
    yr: PropTypes.string,
    majorId: PropTypes.string.isRequired,
  }).isRequired,
  requirements: PropTypes.arrayOf(Requirement).isRequired,
});

const Articulation = PropTypes.shape({
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

const ArticulationObj = PropTypes.shape({
  cccInfo: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    code: PropTypes.string,
  }),
  universityInfo: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    code: PropTypes.string,
  }),
  articulationInfo: PropTypes.shape({
    term: PropTypes.string,
    termId: PropTypes.string.isRequired,
    major: PropTypes.string.isRequired,
    majorId: PropTypes.string,
  }),
  articulatedCourses: PropTypes.arrayOf(Articulation).isRequired,
  nonArticulatedCourses: PropTypes.arrayOf(Course).isRequired,
});

function ArticulationSelectDropdown({
  articulation,
  planCourses,
  onArticulationSelect,
}) {
  return (
    <div className="articulation-select-dropdown">
      <p className="subtitle">Select 1 option</p>
      <div className="articulation-select-options">
        {articulation.articulationOptions.map((option, index) => {
          const inPlan = option.every((course) =>
            planCourses.some((planCourse) =>
              matchArticulation(course, planCourse)
            )
          );

          const fyCourse =
            articulation.articulationType === "Course"
              ? {
                  courseTitle: articulation.courseTitle,
                  coursePrefix: articulation.coursePrefix,
                  courseNumber: articulation.courseNumber,
                  courseId: articulation.courseId,
                }
              : {
                  seriesTitle: articulation.seriesTitle,
                  seriesId: articulation.seriesId,
                };

          return (
            <label
              key={`select-for-${
                articulation.seriesId || articulation.courseId
              }-${index}`}
              className="articulation-select-option"
            >
              <input
                type="radio"
                name={`radio-for-${
                  articulation.seriesId || articulation.courseId
                }`}
                checked={inPlan}
                onChange={() => {
                  if (!inPlan) {
                    const updatedPlanCourses = planCourses.filter(
                      (planCourse) =>
                        !articulation?.articulationOptions.some(
                          (existingOption) =>
                            existingOption.every((course) =>
                              matchArticulation(course, planCourse)
                            )
                        )
                    );

                    onArticulationSelect(
                      updatedPlanCourses,
                      option,
                      articulation,
                      fyCourse
                    );
                  }
                }}
              />
              <div key={index} className="option-group">
                {option.map(
                  ({
                    courseId,
                    seriesId,
                    courseTitle,
                    seriesTitle,
                    courseNumber,
                    coursePrefix,
                  }) => (
                    <p key={`articulation-${seriesId || courseId}`}>
                      {seriesTitle ||
                        `${coursePrefix} ${courseNumber} - ${courseTitle}`}
                    </p>
                  )
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

ArticulationSelectDropdown.propTypes = {
  articulation: Articulation,
  planCourses: PropTypes.array.isRequired,
  onArticulationSelect: PropTypes.func.isRequired,
};

function ArticulationItem({ identifier, articulatesTo, cccInfo }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="ccc-articulation">
      <div className="articulation-item">
        <p className="course-identifier">{identifier}</p>
        <button
          type="button"
          className="articulation-info-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <img src={FilledInfoIcon} alt="Toggle Info" />
          ) : (
            <img src={InfoIcon} alt="Toggle Info" />
          )}
        </button>
      </div>
      {isOpen ? (
        <div className="articulation-info-dropdown">
          <p className="subtitle">
            From: <span>{cccInfo.name}</span>
          </p>
          <p className="subtitle">Articulates to</p>
          <ul>
            {articulatesTo.map(({ fyCourse, major, majorId }, index) => {
              const { coursePrefix, courseNumber, courseTitle, seriesTitle } =
                fyCourse;
              const splitMajorId = majorId.split("/");
              const fyName = getUniName(splitMajorId[3]);

              return (
                <li key={index}>
                  {`${
                    seriesTitle ||
                    `${coursePrefix} ${courseNumber} - ${courseTitle}`
                  } 
                     (${fyName}: ${major})`}
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

ArticulationItem.propTypes = {
  identifier: PropTypes.string.isRequired,
  articulatesTo: PropTypes.arrayOf(
    PropTypes.shape({
      term: PropTypes.string,
      termId: PropTypes.string,
      major: PropTypes.string.isRequired,
      majorId: PropTypes.string.isRequired,
      fyCourse: PropTypes.shape({
        courseTitle: PropTypes.string,
        seriesTitle: PropTypes.string,
        coursePrefix: PropTypes.string,
        courseNumber: PropTypes.string,
        courseId: PropTypes.string,
        seriesId: PropTypes.string,
      }).isRequired,
    }).isRequired
  ).isRequired,
  cccInfo: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    code: PropTypes.string,
  }).isRequired,
};

function CourseItem({
  course,
  requirementFulfilled,
  articulation,
  onArticulationSelect,
  planCourses,
  onSearchDecline,
  majorId,
  createArticulationParams,
  wholeReqFinished,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExcluded, setIsExcluded] = useState(false);
  const [searchPlanned, setSearchPlanned] = useState(false);
  const [searchArticulation, setSearchArticulation] = useState(null);

  const {
    courseTitle,
    coursePrefix,
    courseNumber,
    credits,
    courseId,
    seriesId,
    type,
  } = course;

  const courseIdentifier =
    type === "Course"
      ? `${coursePrefix} ${courseNumber} - ${courseTitle}`
      : course.seriesTitle;

  const searchInPlan = getSearchArt(planCourses, course);

  const searchIdentifier = searchInPlan
    ? searchInPlan
        .map(
          ({ coursePrefix, courseNumber }) => `${coursePrefix} ${courseNumber}`
        )
        .join(", ")
    : "";

  const isArticulationInPlan = articulationInPlan(articulation, planCourses);

  const shouldShowSearchDropdown =
    isOpen &&
    !(searchArticulation || articulation) &&
    !searchPlanned &&
    searchInPlan.length === 0;

  return (
    <>
      <div
        className="course-item"
        style={{
          opacity: isExcluded ? 0.3 : 1,
        }}
      >
        <div className="identifiers">
          <p
            className="course-identifier"
            style={{
              fontWeight:
                isArticulationInPlan ||
                (searchArticulation &&
                  searchArticulation.some(({ result }) =>
                    myArtInPlan(result[0], planCourses)
                  )) ||
                (searchInPlan.length > 0 && !isArticulationInPlan) ||
                requirementFulfilled ||
                isExcluded ||
                wholeReqFinished
                  ? "normal"
                  : "bold",
            }}
          >
            {courseIdentifier}
          </p>
          <p className="units">{Number(credits)} units</p>
        </div>
        <button
          type="button"
          className="articulation-select-toggle"
          onClick={() => {
            setIsOpen((prev) => !prev);
            setSearchPlanned(false);
          }}
          aria-expanded={isOpen}
        >
          {isOpen ? (
            <img src={UpArrow} alt="Toggle Articulation Select" />
          ) : (
            <img src={DownArrow} alt="Toggle Articulation Select" />
          )}
        </button>
      </div>
      {isOpen && isExcluded ? (
        <div className="articulation-select-dropdown" style={{ opacity: 0.3 }}>
          <p className="subtitle">Requirement skipped.</p>
        </div>
      ) : isOpen &&
        searchInPlan.length > 0 &&
        !isArticulationInPlan &&
        !searchArticulation ? (
        <div className="articulation-select-dropdown">
          <p className="subtitle">Satisfied by {searchIdentifier}</p>
        </div>
      ) : shouldShowSearchDropdown ? (
        <div className="articulation-select-dropdown">
          <p>Search another CCC for an articulation?</p>
          <div className="pre-search-choices">
            <button
              type="button"
              className="yes-to-search"
              onClick={() => setSearchPlanned(true)}
            >
              Yes
            </button>
            <button
              type="button"
              className="no-to-search"
              onClick={() => {
                onSearchDecline(course);
                setIsExcluded(true);
              }}
            >
              Skip
            </button>
          </div>
        </div>
      ) : isOpen && articulation ? (
        <ArticulationSelectDropdown
          articulation={articulation}
          onArticulationSelect={onArticulationSelect}
          planCourses={planCourses}
        />
      ) : isOpen && !articulation && (searchPlanned || searchArticulation) ? (
        <ArticulationSearchDropdown
          fyCourseId={seriesId || courseId}
          majorId={majorId}
          cachedSearch={searchArticulation}
          updateArticulations={(newArt) => setSearchArticulation(newArt)}
          createArticulationParams={createArticulationParams}
          onArticulationSelect={onArticulationSelect}
          planCourses={planCourses}
          onFailedSearchSkip={() => {
            onSearchDecline(course);
            setIsExcluded(true);
          }}
        />
      ) : (
        ""
      )}
    </>
  );
}

CourseItem.propTypes = {
  course: Course.isRequired,
  requirementFulfilled: PropTypes.bool.isRequired,
  articulation: Articulation,
  onArticulationSelect: PropTypes.func.isRequired,
  planCourses: PropTypes.array.isRequired,
  onSearchDecline: PropTypes.func.isRequired,
  majorId: PropTypes.string.isRequired,
  createArticulationParams: PropTypes.func.isRequired,
  wholeReqFinished: PropTypes.bool.isRequired,
};

function CourseItemGroup({
  courseGroup,
  reqLength,
  groupIndex,
  articulations,
  planCourses,
  onArticulationSelect,
  onSearchDecline,
  excludedCourses,
  createArticulationParams,
  majorId,
  wholeReqFinished,
}) {
  const { courses, type, amount } = courseGroup;

  if (courses.length === 0) {
    return null;
  }

  let fulfillmentCount = 0;

  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];

    const existingArticulation = findArticulation(course, articulations);

    const searchArticulation = getSearchArt(planCourses, course);

    if (
      articulationInPlan(existingArticulation, planCourses) ||
      searchArticulation.length > 0
    ) {
      fulfillmentCount += type === "NCourses" ? 1 : Number(course.credits);
    }
  }

  const groupFulfilled =
    fulfillmentCount >= amount ||
    courses.every((course) =>
      excludedCourses.some(
        (excluded) => JSON.stringify(excluded) === JSON.stringify(course)
      )
    );

  return (
    <div className="course-group">
      {reqLength > 1 || (courses.length > 1 && amount) ? (
        <div className="group-header">
          <div className="group-letter">
            {String.fromCharCode(groupIndex + 1 + 64)}
          </div>
          {type === "NCourses" ? (
            <p className="n-course-indicator">
              Select {amount} from the following
              {groupFulfilled ? " ✅" : " ⚠️"}
            </p>
          ) : type === "NCredits" ? (
            <div className="n-credits-indicator">
              <p className="n-credits">
                Select {amount} units from the following
              </p>
              <p className="credits-selected">
                ({fulfillmentCount} units selected)
                {groupFulfilled ? " ✅" : " ⚠️"}
              </p>
            </div>
          ) : (
            ""
          )}
        </div>
      ) : (
        ""
      )}
      {courses.map((course) => {
        const { courseId, seriesId } = course;

        const courseKey = courseId || seriesId;

        const articulation = findArticulation(course, articulations);

        return (
          <CourseItem
            key={courseKey}
            course={course}
            requirementFulfilled={groupFulfilled}
            articulation={articulation}
            planCourses={planCourses}
            onArticulationSelect={onArticulationSelect}
            onSearchDecline={onSearchDecline}
            majorId={majorId}
            createArticulationParams={createArticulationParams}
            wholeReqFinished={wholeReqFinished}
          />
        );
      })}
    </div>
  );
}

CourseItemGroup.propTypes = {
  courseGroup: CourseGroup.isRequired,
  reqLength: PropTypes.number.isRequired,
  groupIndex: PropTypes.number.isRequired,
  articulations: PropTypes.arrayOf(ArticulationObj).isRequired,
  planCourses: PropTypes.array.isRequired,
  onArticulationSelect: PropTypes.func.isRequired,
  onSearchDecline: PropTypes.func.isRequired,
  excludedCourses: PropTypes.arrayOf(Course).isRequired,
  createArticulationParams: PropTypes.func.isRequired,
  majorId: PropTypes.string.isRequired,
  wholeReqFinished: PropTypes.bool.isRequired,
};

function RequirementItem({
  requirement,
  articulations,
  planCourses,
  onArticulationSelect,
  onSearchDecline,
  excludedCourses,
  createArticulationParams,
  majorId,
}) {
  const { conjunction, requiredCourses } = requirement;

  const instructions = createInstructions(requiredCourses, conjunction);

  const completed = requirementCompleted(
    requirement,
    articulations,
    planCourses,
    excludedCourses
  );

  if (!requiredCourses.some((group) => group.courses.length > 0)) {
    return null;
  }

  return (
    <div className="requirement">
      {instructions ? (
        <p className="instructions">
          {instructions} {completed ? " ✅" : " ⚠️"}
        </p>
      ) : (
        ""
      )}
      {requiredCourses.map((courseGroup, index) => (
        <CourseItemGroup
          key={index}
          courseGroup={courseGroup}
          reqLength={requiredCourses.length}
          groupIndex={index}
          articulations={articulations}
          planCourses={planCourses}
          onArticulationSelect={onArticulationSelect}
          onSearchDecline={onSearchDecline}
          excludedCourses={excludedCourses}
          createArticulationParams={createArticulationParams}
          majorId={majorId}
          wholeReqFinished={completed}
        />
      ))}
    </div>
  );
}

RequirementItem.propTypes = {
  requirement: Requirement.isRequired,
  articulations: PropTypes.arrayOf(ArticulationObj).isRequired,
  planCourses: PropTypes.array.isRequired,
  onArticulationSelect: PropTypes.func.isRequired,
  onSearchDecline: PropTypes.func.isRequired,
  excludedCourses: PropTypes.arrayOf(Course).isRequired,
  createArticulationParams: PropTypes.func.isRequired,
  majorId: PropTypes.string.isRequired,
};

function RequirementItemGroup({
  majorName,
  requirements,
  articulations,
  planCourses,
  onArticulationSelect,
  onSearchDecline,
  excludedCourses,
  createArticulationParams,
  majorId,
}) {
  return (
    <div className="requirement-group">
      <div className="major-name">{majorName}</div>
      {requirements.map((requirement, index) => (
        <RequirementItem
          key={index}
          requirement={requirement}
          articulations={articulations}
          planCourses={planCourses}
          onArticulationSelect={onArticulationSelect}
          onSearchDecline={onSearchDecline}
          excludedCourses={excludedCourses}
          createArticulationParams={createArticulationParams}
          majorId={majorId}
        />
      ))}
    </div>
  );
}

RequirementItemGroup.propTypes = {
  majorName: PropTypes.string.isRequired,
  requirements: PropTypes.arrayOf(Requirement).isRequired,
  articulations: PropTypes.arrayOf(ArticulationObj).isRequired,
  planCourses: PropTypes.array.isRequired,
  onArticulationSelect: PropTypes.func.isRequired,
  onSearchDecline: PropTypes.func.isRequired,
  excludedCourses: PropTypes.arrayOf(Course).isRequired,
  createArticulationParams: PropTypes.func.isRequired,
  majorId: PropTypes.string.isRequired,
};

function UniversityGroup({
  uniGroup,
  majorList,
  articulations,
  planCourses,
  onArticulationSelect,
  onSearchDecline,
  excludedCourses,
  createArticulationParams,
}) {
  const { fyId } = uniGroup[0].inputs;

  return (
    <div className="uni-group">
      <p className="uni-title">{getUniName(fyId)}</p>
      {uniGroup.map(({ inputs, requirements }) => {
        const separated = inputs.majorId.split("/");
        const extractedKey = separated[separated.length - 1];

        const majorName = majorList.find(
          (major) => major.key === extractedKey
        ).major;

        return (
          <RequirementItemGroup
            key={`${fyId}-${extractedKey}`}
            majorName={majorName}
            requirements={requirements}
            articulations={articulations}
            planCourses={planCourses}
            onArticulationSelect={onArticulationSelect}
            onSearchDecline={onSearchDecline}
            excludedCourses={excludedCourses}
            createArticulationParams={createArticulationParams}
            majorId={inputs.majorId}
          />
        );
      })}
    </div>
  );
}

UniversityGroup.propTypes = {
  uniGroup: PropTypes.arrayOf(RequirementGroup),
  majorList: PropTypes.arrayOf(Major).isRequired,
  articulations: PropTypes.arrayOf(ArticulationObj).isRequired,
  planCourses: PropTypes.array.isRequired,
  onArticulationSelect: PropTypes.func.isRequired,
  onSearchDecline: PropTypes.func.isRequired,
  excludedCourses: PropTypes.arrayOf(Course).isRequired,
  createArticulationParams: PropTypes.func.isRequired,
};

function Plan({
  reqsList,
  majorList,
  articulations,
  createArticulationParams,
  onFinish,
}) {
  const [planCourses, setPlanCourses] = useState(
    populatePlan(reqsList, articulations, [])
  );
  const [excludedCourses, setExcludedCourses] = useState([]);

  const uniGroups = groupByUni(reqsList);

  const allCompleted = reqsList.every(({ requirements }) =>
    requirements.every((req) =>
      requirementCompleted(req, articulations, planCourses, excludedCourses)
    )
  );

  useEffect(() => {
    if (allCompleted) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      onFinish();
    }
  }, [allCompleted, onFinish]);

  return (
    <>
      <div className="plan">
        <p className="title">Plan</p>
        {planCourses.length > 0 ? (
          <div className="plan-courses">
            {planCourses.map((course) => {
              const {
                courseTitle,
                seriesTitle,
                courseNumber,
                coursePrefix,
                courseId,
                articulatesTo,
                cccInfo,
              } = course;

              const identifier =
                seriesTitle ||
                `${coursePrefix} ${courseNumber} - ${courseTitle}`;

              return (
                <ArticulationItem
                  key={courseId}
                  identifier={identifier}
                  articulatesTo={articulatesTo}
                  cccInfo={cccInfo}
                />
              );
            })}
          </div>
        ) : (
          <p>Courses will appear when choices are made below.</p>
        )}
      </div>
      <div className="university-requirements">
        <p className="title">Requirements</p>
        {uniGroups.map((uniGroup) => (
          <UniversityGroup
            key={uniGroup[0].inputs.fyId}
            uniGroup={uniGroup}
            majorList={majorList}
            articulations={articulations}
            planCourses={planCourses}
            onArticulationSelect={(
              planCoursesCopy,
              option,
              articulation,
              fyCourse,
              searchArticulations,
              cachedSearch,
              searchOpt
            ) => {
              updatePlanCourses(
                planCoursesCopy,
                option,
                articulation,
                fyCourse
              );

              populatePlan(reqsList, articulations, planCoursesCopy);

              if (searchArticulations && cachedSearch) {
                createArticulatesTo(searchArticulations, planCoursesCopy);

                filterSearchArtInPlan(cachedSearch, planCoursesCopy, searchOpt);
              }

              minimizeCourses(planCoursesCopy);

              setPlanCourses(planCoursesCopy);
            }}
            onSearchDecline={(fyCourse) => {
              setExcludedCourses([...excludedCourses, fyCourse]);
            }}
            excludedCourses={excludedCourses}
            createArticulationParams={createArticulationParams}
          />
        ))}
      </div>
    </>
  );
}

Plan.propTypes = {
  reqsList: PropTypes.arrayOf(RequirementGroup).isRequired,
  majorList: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      major: PropTypes.string.isRequired,
    }).isRequired
  ).isRequired,
  articulations: PropTypes.arrayOf(ArticulationObj).isRequired,
  createArticulationParams: PropTypes.func.isRequired,
  onFinish: PropTypes.func.isRequired,
};

export default Plan;
