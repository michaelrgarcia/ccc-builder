import PropTypes from "prop-types";
import { sortCourses } from "../utils/planTools";

import "../styles/Plan.css";

function Plan({ baseArticulations }) {
  function createRequirementsList() {
    const requirements = [];

    for (let i = 0; i < baseArticulations.length; i++) {
      const { articulatedCourses = [], nonArticulatedCourses = [] } =
        baseArticulations[i];

      for (let j = 0; j < articulatedCourses.length; j++) {
        const course = articulatedCourses[j];

        const courseIdentifier =
          course.articulationType === "Course"
            ? `${course.coursePrefix} ${course.courseNumber} - ${course.courseTitle}`
            : course.seriesTitle;

        requirements.push({
          element: (
            <p key={`articulated-${courseIdentifier}`}>{courseIdentifier}</p>
          ),
          prefix:
            course.articulationType === "Course" ? course.coursePrefix : "",
          number:
            course.articulationType === "Course" ? course.courseNumber : "",
          isSeries: course.articulationType === "Series",
        });
      }

      for (let k = 0; k < nonArticulatedCourses.length; k++) {
        const course = nonArticulatedCourses[k];

        const courseIdentifier =
          course.type === "Course"
            ? `${course.coursePrefix} ${course.courseNumber} - ${course.courseTitle}`
            : course.seriesTitle;

        requirements.push({
          element: (
            <p key={`non-articulated-${courseIdentifier}`}>
              {courseIdentifier}
            </p>
          ),
          prefix: course.type === "Course" ? course.coursePrefix : "",
          number: course.type === "Course" ? course.courseNumber : "",
          isSeries: course.type === "Series",
        });
      }
    }

    const sortedRequirements = sortCourses(requirements);

    return sortedRequirements.map((req) => req.element);
  }

  return (
    <>
      <div className="legend"></div>

      <div className="university-requirements">
        <p className="title">University Requirements</p>
        {createRequirementsList()}
      </div>
    </>
  );
}

Plan.propTypes = {
  baseArticulations: PropTypes.arrayOf(
    PropTypes.shape({
      cccInfo: PropTypes.shape({
        code: PropTypes.string,
        id: PropTypes.string,
        name: PropTypes.string.isRequired,
      }).isRequired,
      universityInfo: PropTypes.shape({
        code: PropTypes.string,
        id: PropTypes.string,
        name: PropTypes.string.isRequired,
      }).isRequired,
      articulationInfo: PropTypes.shape({
        major: PropTypes.string.isRequired,
        majorId: PropTypes.string,
        term: PropTypes.string,
        termId: PropTypes.string,
      }).isRequired,
      articulatedCourses: PropTypes.arrayOf(
        PropTypes.shape({
          articulationType: PropTypes.string.isRequired,
          courseTitle: PropTypes.string.isRequired,
          courseNumber: PropTypes.string.isRequired,
          coursePrefix: PropTypes.string.isRequired,
          articulationOptions: PropTypes.arrayOf(
            PropTypes.arrayOf(
              PropTypes.shape({
                courseTitle: PropTypes.string.isRequired,
                courseNumber: PropTypes.string.isRequired,
                coursePrefix: PropTypes.string.isRequired,
                note: PropTypes.string,
              }).isRequired
            ).isRequired
          ).isRequired,
        }).isRequired
      ),
      // will have to search agreements for course titles in here
      nonArticulatedCourses: PropTypes.arrayOf(
        PropTypes.shape({
          type: PropTypes.string.isRequired,
          courseTitle: PropTypes.string,
          seriesTitle: PropTypes.string,
          courseNumber: PropTypes.string.isRequired,
          coursePrefix: PropTypes.string.isRequired,
        }).isRequired
      ),
    }).isRequired
  ).isRequired,
};

export default Plan;
