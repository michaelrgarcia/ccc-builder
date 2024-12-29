import PropTypes from "prop-types";

import { createInstructions, getUniName } from "../utils/planTools";
import { Fragment } from "react";

import "../styles/Plan.css";

// separate code when possible...

function generateCourseGroupKey(courseGroup, groupIndex) {
  const coursesKey = courseGroup.courses
    .map((course) => course.courseId || course.seriesTitle)
    .join("-");

  return `group-${coursesKey}-${groupIndex}`;
}

function renderCourseGroup(courseGroup, groupIndex) {
  const { courses } = courseGroup;

  return (
    <div
      className="course-group"
      key={generateCourseGroupKey(courseGroup, groupIndex)}
    >
      {courses.map((course) => {
        const { courseTitle, coursePrefix, courseNumber, courseId, credits } =
          course;
        const courseIdentifier =
          course.type === "Course"
            ? `${coursePrefix} ${courseNumber} - ${courseTitle}`
            : course.seriesTitle;

        const courseKey = courseId || courseIdentifier;

        return (
          <div key={courseKey} className="course-item">
            <div className="identifiers">
              <p className="course-identifier">{courseIdentifier}</p>
              <p className="units">{credits} units</p>
            </div>
            <button type="button" className="dropdown"></button>
          </div>
        );
      })}
    </div>
  );
}

function generateRequirementKey(requirementObj, index) {
  const courseIds = requirementObj.requiredCourses
    .flatMap((group) => group.courses)
    .map((course) => course.courseId || course.seriesTitle)
    .join("-");

  return `req-${courseIds}-${index}`;
}

function renderRequirement(requirementObj, reqIndex) {
  const { requiredCourses } = requirementObj;

  const instructions = createInstructions(requiredCourses);

  return (
    <div
      className="requirement"
      key={generateRequirementKey(requirementObj, reqIndex)}
    >
      {instructions ? <p className="instructions">{instructions}</p> : ""}
      {requiredCourses.map((courseGroup, groupIndex) => (
        <Fragment key={generateCourseGroupKey(courseGroup, groupIndex)}>
          {requiredCourses.length > 1 ||
          (courseGroup.amount && courseGroup.courses.length > 1) ? (
            <div className="lettered-group">
              <div className="group-header">
                <div className="group-letter">
                  {String.fromCharCode(groupIndex + 1 + 64)}
                </div>
                {courseGroup.type === "NCourses" ? (
                  <p className="n-course-indicator">
                    Select {courseGroup.amount} from the following
                  </p>
                ) : (
                  ""
                )}
                {courseGroup.type === "NCredits" ? (
                  <div className="n-credits-indicator">
                    <p className="n-credits">
                      Select {courseGroup.amount} units from the following
                    </p>
                    <p className="credits-selected">(0 units selected)</p>
                  </div>
                ) : (
                  ""
                )}
              </div>
              {renderCourseGroup(courseGroup, groupIndex)}
            </div>
          ) : (
            renderCourseGroup(courseGroup, groupIndex)
          )}
        </Fragment>
      ))}
    </div>
  );
}

function Plan({ requirements }) {
  // remove dupes from requirements
  // dupes will only appear within the same school
  const schoolIds = Object.keys(requirements);
  const uniGroups = Object.values(requirements);

  return (
    <>
      <div className="plan">
        <p className="title">Plan</p>
      </div>
      <div className="university-requirements">
        <p className="title">Requirements</p>
        {uniGroups.map((reqGroups, schoolIndex) => (
          <div key={`uni-${schoolIds[schoolIndex]}`} className="uni-group">
            <p className="uni-title">{getUniName(schoolIds[schoolIndex])}</p>
            {reqGroups.map((group, groupIndex) => (
              <div
                key={`uni-${schoolIds[schoolIndex]}-group-${groupIndex}`}
                className="requirement-group"
              >
                {/* major title */}
                {group.map((requirement, reqIndex) =>
                  renderRequirement(requirement, reqIndex)
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

const Course = PropTypes.shape({
  type: PropTypes.oneOf(["Course", "Series"]).isRequired,
  courseTitle: PropTypes.string,
  seriesTitle: PropTypes.string,
  coursePrefix: PropTypes.string,
  courseNumber: PropTypes.string,
  courseId: PropTypes.string,
  seriesId: PropTypes.string,
  credits: PropTypes.number,
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

Plan.propTypes = {
  requirements: PropTypes.objectOf(
    PropTypes.arrayOf(PropTypes.arrayOf(Requirement))
  ).isRequired,
};

export default Plan;
