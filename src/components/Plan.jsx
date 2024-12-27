import PropTypes from "prop-types";

import "../styles/Plan.css";
import { getUniName, getUniReqs, getUserChoices } from "../utils/planTools";

function generateCourseGroupKey(courseGroup, groupIndex) {
  const coursesKey = courseGroup.courses
    .map((course) => course.courseId || course.seriesTitle)
    .join("-");

  return `group-${coursesKey}-${groupIndex}`;
}

function renderCourseGroup(courseGroup, groupIndex) {
  const { courses, type, amount } = courseGroup;
  const connector = type === "AllCourses" ? "And" : "Or";

  return (
    <div
      className="course-group"
      key={generateCourseGroupKey(courseGroup, groupIndex)}
    >
      {courses.length > 1 && amount ? (
        <div className="group-header">Select {amount} from the following:</div>
      ) : (
        ""
      )}
      {courses.map((course, index) => {
        const { courseTitle, coursePrefix, courseNumber, courseId } = course;
        const courseIdentifier =
          course.type === "Course"
            ? `${coursePrefix} ${courseNumber} - ${courseTitle}`
            : course.seriesTitle;

        const courseKey = courseId || courseIdentifier;

        return (
          <div key={courseKey} className="course-item">
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

function generateRequirementKey(requirementObj, index) {
  const courseIds = requirementObj.requiredCourses
    .flatMap((group) => group.courses)
    .map((course) => course.courseId || course.seriesTitle)
    .join("-");

  return `req-${courseIds}-${index}`;
}

function renderRequirement(requirementObj, reqIndex) {
  const { requiredCourses, conjunction } = requirementObj;

  return (
    <div
      className="requirement"
      key={generateRequirementKey(requirementObj, reqIndex)}
    >
      {requiredCourses.map((courseGroup, groupIndex) => (
        <div
          key={generateCourseGroupKey(courseGroup, groupIndex)}
          className="course-group-wrapper"
        >
          {renderCourseGroup(courseGroup, groupIndex)}
          {groupIndex < requiredCourses.length - 1 ? (
            <p className="group-connector">{conjunction}</p>
          ) : (
            ""
          )}
        </div>
      ))}
    </div>
  );
}

function Plan({ requirements }) {
  const schoolIds = Object.keys(requirements);
  const uniGroups = Object.values(requirements);

  return (
    <>
      <div className="university-requirements">
        <p className="title">University Requirements</p>
        {uniGroups.map((reqGroups, schoolIndex) => (
          <div key={`uni-${schoolIds[schoolIndex]}`} className="uni-group">
            <p className="uni-title">{getUniName(schoolIds[schoolIndex])}</p>
            {reqGroups.map((group, groupIndex) => {
              const uniReqs = getUniReqs(group);
              const groupKey = `uni-${schoolIds[schoolIndex]}-group-${groupIndex}`;

              return (
                <div key={groupKey} className="requirement-group">
                  {/* major title */}
                  {uniReqs.map((requirement, reqIndex) =>
                    renderRequirement(requirement, reqIndex)
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="user-choices">
        <p className="title">User Choices</p>
        {uniGroups.map((reqGroups, schoolIndex) => (
          <div key={`choice-${schoolIds[schoolIndex]}`} className="uni-group">
            <p className="uni-title">{getUniName(schoolIds[schoolIndex])}</p>
            {reqGroups.map((group, groupIndex) => {
              const userChoices = getUserChoices(group);
              const groupKey = `choice-${schoolIds[schoolIndex]}-group-${groupIndex}`;

              return (
                <div key={groupKey} className="requirement-group">
                  {/* major title */}
                  {userChoices.map((requirement, reqIndex) =>
                    renderRequirement(requirement, reqIndex)
                  )}
                </div>
              );
            })}
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
