import PropTypes from "prop-types";

import "../styles/Plan.css";
import { getUniName } from "../utils/planTools";
import { useState } from "react";

function Plan({ requirements }) {
  const schoolIds = Object.keys(requirements);
  const uniGroups = Object.values(requirements);

  const [userChoices, setUserChoices] = useState();

  function renderCourseGroup(courseGroup) {
    const { courses, type, amount } = courseGroup;
    const connector = type === "AllCourses" ? "And" : "Or";

    // if amount exists, render the corresponding group in a
    // separate place

    return (
      <div className="course-group">
        {amount ? (
          <div className="group-header">
            Select {amount} from the following:
          </div>
        ) : (
          ""
        )}
        {courses.map((course, index) => {
          const { courseTitle, coursePrefix, courseNumber, courseId } = course;
          const courseIdentifier =
            course.type === "Course"
              ? `${coursePrefix} ${courseNumber} - ${courseTitle}`
              : course.seriesTitle;

          return (
            <div key={courseId} className="course-item">
              <p className="identifier">{courseIdentifier}</p>
              {index < courses.length - 1 ? (
                <p className="connector">{connector}</p>
              ) : (
                ""
              )}
            </div>
          );
        })}
      </div>
    );
  }

  function renderRequirement(requirementObj) {
    const { requiredCourses, conjunction } = requirementObj;

    return (
      <div className="requirement">
        {requiredCourses.map((courseGroup, index) => (
          <>
            {renderCourseGroup(courseGroup)}
            {index < requiredCourses.length - 1 ? (
              <p className="group-connector">{conjunction}</p>
            ) : (
              ""
            )}
          </>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="university-requirements">
        <p className="title">University Requirements</p>
        {uniGroups.map((reqGroups, index) => (
          <div key={index} className="uni-group">
            <p className="uni-title">{getUniName(schoolIds[index])}</p>
            {reqGroups.map((group, index) => (
              <div key={index} className="requirement-group">
                {/* major title */}
                {group.map((requirement) => renderRequirement(requirement))}
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
});

const CourseGroup = PropTypes.shape({
  type: PropTypes.oneOf(["AllCourses", "NCourses"]).isRequired,
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
