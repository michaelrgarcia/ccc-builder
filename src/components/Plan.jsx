import PropTypes from "prop-types";
import { sortCourses } from "../utils/planTools";

import "../styles/Plan.css";

function renderCourseGroup(courseGroup) {
  const { courses, type, amount } = courseGroup;
  const connector = type === "AllCourses" ? "And" : "Or";

  return (
    <div className="course-group">
      {amount ? (
        <div className="group-header">Select {amount} from the following:</div>
      ) : (
        ""
      )}
      {courses.map((course, index) => {
        const { courseTitle, coursePrefix, courseNumber } = course;
        const courseIdentifier = `${coursePrefix} ${courseNumber} - ${courseTitle}`;

        <div className="course-item">
          <p className="identifier">{courseIdentifier}</p>
          {index < courses.length - 1 ? (
            <p className="connector">{connector}</p>
          ) : (
            ""
          )}
        </div>;
      })}
    </div>
  );
}

function renderRequirement(requirementObj) {
  const { requiredCourses, conjunction } = requirementObj;

  return (
    <div className="requirement">
      {requiredCourses.map((courseGroup, index) => {
        <>
          {renderCourseGroup(courseGroup)}
          {index < requiredCourses.length - 1 ? (
            <p className="group-connector">{conjunction}</p>
          ) : (
            ""
          )}
        </>;
      })}
    </div>
  );
}

function Plan({ requirements }) {
  return (
    <>
      <div className="legend"></div>

      <div className="university-requirements">
        <p className="title">University Requirements</p>

        {requirements.map((requirementObj, index) => {
          <div key={index} className="requirement">
            {renderRequirement(requirementObj)}
          </div>;
        })}
      </div>
    </>
  );
}

const Course = PropTypes.shape({
  type: PropTypes.string.isRequired,
  courseTitle: PropTypes.string.isRequired,
  coursePrefix: PropTypes.string.isRequired,
  courseNumber: PropTypes.string.isRequired,
});

const CourseGroup = PropTypes.shape({
  type: PropTypes.string.isRequired,
  amount: PropTypes.number,
  courses: PropTypes.arrayOf(Course).isRequired,
});

Plan.propTypes = {
  requirements: PropTypes.arrayOf(
    PropTypes.shape({
      requiredCourses: PropTypes.arrayOf(CourseGroup).isRequired,
      conjunction: PropTypes.string,
    })
  ).isRequired,
};

export default Plan;
