import PropTypes from "prop-types";

function Plan({ baseArticulations }) {
  function createRequirementsList() {
    const requirements = [];

    baseArticulations.map(
      ({ articulatedCourses, nonArticulatedCourses, articulationInfo }) => {
        articulatedCourses.map(
          ({ courseTitle, courseNumber, coursePrefix }) => {
            const courseIdentifier = `${coursePrefix} ${courseNumber} - ${courseTitle}`;

            requirements.push(
              <p key={`${articulationInfo.majorId}/${courseIdentifier}`}>
                {courseIdentifier}
              </p>
            );
          }
        );

        nonArticulatedCourses.map((course) => {
          const courseIdentifier =
            course.type === "Course"
              ? `${course.coursePrefix} ${course.courseNumber} - ${course.courseTitle}`
              : course.seriesTitle;

          requirements.push(
            <p key={`${articulationInfo.majorId}/${courseIdentifier}`}>
              {courseIdentifier}
            </p>
          );
        });
      }
    );

    return requirements;
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
