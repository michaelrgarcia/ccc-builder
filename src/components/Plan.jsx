import PropTypes from "prop-types";

import {
  createInstructions,
  getUniName,
  groupByUni,
  findArticulation,
  prePopulatePlan,
  matchArticulation,
  articulationInPlan,
  requirementCompleted,
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
  isFulfilled,
  requirementFulfilled,
}) {
  if (!articulation && !requirementFulfilled) {
    // show search menu
    return <p>Search another CCC for an articulation?</p>;
  }

  // include a checkmark icon below the subtitle if isFulfilled

  return (
    <div
      className="articulation-select-dropdown"
      style={{
        opacity:
          (isFulfilled && articulation.articulationOptions.length === 1) ||
          requirementFulfilled
            ? 0.3
            : 1,
      }}
    >
      <p className="subtitle">
        {isFulfilled && articulation.articulationOptions.length === 1
          ? `Cannot deselect required course.`
          : requirementFulfilled
          ? "Requirement fulfilled."
          : "Select 1 option"}
      </p>
      <div className="articulation-select-options">
        {articulation.articulationOptions.map((option, index) => {
          const inPlan = option.every((course) =>
            planCourses.some((planCourse) =>
              matchArticulation(course, planCourse)
            )
          );

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
                readOnly={requirementFulfilled}
                onChange={onArticulationSelect}
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
  isFulfilled: PropTypes.bool.isRequired,
  requirementFulfilled: PropTypes.bool.isRequired,
};

function CourseItem({
  course,
  isFulfilled,
  requirementFulfilled,
  articulation,
  onArticulationSelect,
  planCourses,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const { courseTitle, coursePrefix, courseNumber, credits } = course;

  const courseIdentifier =
    course.type === "Course"
      ? `${coursePrefix} ${courseNumber} - ${courseTitle}`
      : course.seriesTitle;

  return (
    <>
      <div
        className="course-item"
        style={{
          opacity:
            isFulfilled && articulation.articulationOptions.length === 1
              ? 0.3
              : 1,
        }}
      >
        <div className="identifiers">
          <p className="course-identifier">{courseIdentifier}</p>
          <p className="units">{credits} units</p>
        </div>
        <button
          type="button"
          className="articulation-select-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <img src={UpArrow} alt="Toggle Articulation Select" />
          ) : (
            <img src={DownArrow} alt="Toggle Articulation Select" />
          )}
        </button>
      </div>
      {isOpen ? (
        <ArticulationSelectDropdown
          articulation={articulation}
          onArticulationSelect={onArticulationSelect}
          planCourses={planCourses}
          isFulfilled={isFulfilled}
          requirementFulfilled={requirementFulfilled}
        />
      ) : (
        ""
      )}
    </>
  );
}

CourseItem.propTypes = {
  course: Course.isRequired,
  isFulfilled: PropTypes.bool.isRequired,
  requirementFulfilled: PropTypes.bool.isRequired,
  articulation: Articulation,
  onArticulationSelect: PropTypes.func.isRequired,
  planCourses: PropTypes.array.isRequired,
};

function CourseItemGroup({
  courseGroup,
  reqLength,
  groupIndex,
  articulations,
  planCourses,
  onArticulationSelect,
}) {
  const { courses, type, amount } = courseGroup;

  if (courses.length === 0) {
    return null;
  }

  let fulfillmentCount = 0;

  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];

    const articulation = findArticulation(course, articulations);

    if (articulationInPlan(articulation, planCourses)) {
      fulfillmentCount += type === "NCourses" ? 1 : course.credits;
    }
  }

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
              {fulfillmentCount === amount ? " ✅" : " ⚠️"}
            </p>
          ) : type === "NCredits" ? (
            <div className="n-credits-indicator">
              <p className="n-credits">
                Select {amount} units from the following
              </p>
              <p className="credits-selected">
                ({fulfillmentCount} units selected)
                {fulfillmentCount === amount ? " ✅" : " ⚠️"}
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
            isFulfilled={articulationInPlan(articulation, planCourses)}
            requirementFulfilled={fulfillmentCount === amount}
            articulation={articulation}
            planCourses={planCourses}
            onArticulationSelect={onArticulationSelect}
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
};

function RequirementItem({
  requirement,
  articulations,
  planCourses,
  onArticulationSelect,
}) {
  const { conjunction, requiredCourses } = requirement;

  const instructions = createInstructions(requiredCourses, conjunction);
  const completed = requirementCompleted(
    requirement,
    articulations,
    planCourses
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
};

function RequirementItemGroup({
  majorName,
  requirements,
  articulations,
  planCourses,
  onArticulationSelect,
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
};

function UniversityGroup({
  uniGroup,
  majorList,
  articulations,
  planCourses,
  onArticulationSelect,
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
          <p className="subtitle">Articulates To</p>
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

function Plan({ reqsList, majorList, articulations }) {
  const [planCourses, setPlanCourses] = useState(
    prePopulatePlan(reqsList, articulations)
  );

  const uniGroups = groupByUni(reqsList);

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
            onArticulationSelect={(course) => {
              console.log("not yet shooting star");
              // setPlanCourses([...planCourses, course]);
            }}
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
};

export default Plan;
