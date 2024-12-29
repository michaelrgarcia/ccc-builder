import PropTypes from "prop-types";

import {
  createInstructions,
  getUniName,
  generateCourseGroupKey,
  generateRequirementKey,
} from "../utils/planTools";

import { Fragment, useState } from "react";

import "../styles/Plan.css";

// separate code when possible...

function Plan({ requirements, articulations }) {
  const [plan, setPlan] = useState([]); // populate with articulatedCourses from articulations

  const schoolIds = Object.keys(requirements);
  const uniGroups = Object.values(requirements);

  function renderCourseGroup(courseGroup, groupIndex) {
    const { courses, type } = courseGroup;

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

          // check articulation existence in articulations

          if (type === "AllCourses") {
            // if it exists, blur it and add it to the plans state
            // if it doesnt, store it somewhere in the Course component
            // for search
          } else if (type === "NCourses") {
            // if this course exists in articulatedCourses from
            // articulations, store it somewhere in the Course component
            // if it doesnt, store it somewhere in the Course component
            // for search
          } else if (type === "NCredits") {
            // if this course exists in articulatedCourses from
            // articulations, store it somewhere in the Course component
            // if it doesnt, store it somewhere in the Course component
            // for search
          }

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

  function renderRequirement(requirementObj, reqIndex) {
    const { requiredCourses } = requirementObj;

    const hasCourses = requiredCourses.some(
      (courseGroup) => courseGroup.courses.length > 0
    );

    if (!hasCourses) {
      return null;
    }

    const instructions = createInstructions(requiredCourses);

    return (
      <div
        className="requirement"
        key={generateRequirementKey(requirementObj, reqIndex)}
      >
        {instructions ? <p className="instructions">{instructions}</p> : ""}
        {requiredCourses.map((courseGroup, groupIndex) => {
          if (courseGroup.courses.length > 0) {
            return (
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
            );
          }
        })}
      </div>
    );
  }

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

Plan.propTypes = {
  requirements: PropTypes.objectOf(
    PropTypes.arrayOf(PropTypes.arrayOf(Requirement))
  ).isRequired,
  articulations: PropTypes.objectOf(
    PropTypes.arrayOf(
      PropTypes.shape({
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
      }).isRequired
    )
  ).isRequired,
};

export default Plan;
