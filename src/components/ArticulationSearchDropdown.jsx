import PropTypes from "prop-types";

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

function ArticulationSearchDropdown({
  articulation,
  planCourses,
  onArticulationSelect,
}) {
  return (
    <div className="articulation-select-dropdown">
      <p className="subtitle">
        Click Search to proceed. This will take some time.
      </p>
    </div>
  );
}

ArticulationSearchDropdown.propTypes = {
  articulation: Articulation,
  planCourses: PropTypes.array.isRequired,
  onArticulationSelect: PropTypes.func.isRequired,
};

export default ArticulationSearchDropdown;
