import { universities } from "./staticAssistData";

export function sortCourses(courseArray) {
  const copy = [...courseArray];

  copy.sort((a, b) => {
    // put series at end
    if (a.isSeries && !b.isSeries) return 1;
    if (!a.isSeries && b.isSeries) return -1;
    if (a.isSeries && b.isSeries) return 0;

    if (a.prefix < b.prefix) return -1;
    if (a.prefix > b.prefix) return 1;

    return a.number.localeCompare(b.number, undefined, { numeric: true });
  });

  return copy;
}

export function getUniName(fyId) {
  const university = universities.find((uni) => uni.id === Number(fyId));

  if (university) {
    return university.name;
  } else {
    return null;
  }
}

export function createInstructions(requiredCourses) {
  if (requiredCourses.length < 2) {
    return "";
  } else if (requiredCourses.length === 2) {
    return "Complete A and B";
  } else if (requiredCourses.length > 2) {
    let instructions = "Complete";

    for (let i = 0; i < requiredCourses.length; i++) {
      const progressiveLetter = String.fromCharCode(i + 1 + 64);

      if (i !== requiredCourses.length - 1) {
        instructions += ` ${progressiveLetter}, `;
      } else {
        instructions += ` and ${progressiveLetter}`;
      }
    }

    return instructions;
  }
}

export function removeDupes(requirements) {
  const reqsCopy = structuredClone(requirements);

  for (const uni in reqsCopy) {
    const knownIds = new Set();

    const majorsForEachUni = reqsCopy[uni];

    for (let i = 0; i < majorsForEachUni.length; i++) {
      const majorReqs = majorsForEachUni[i];

      for (let j = 0; j < majorReqs.length; j++) {
        const requirement = majorReqs[j];

        for (let k = 0; k < requirement.requiredCourses.length; k++) {
          const { courses, type, amount } = requirement.requiredCourses[k];

          const initialLength = courses.length;

          for (let l = 0; l < courses.length; l++) {
            const currentCourse = courses[l];
            const id = currentCourse.courseId || currentCourse.seriesId;

            if (!knownIds.has(id)) {
              knownIds.add(id);
            } else {
              courses.splice(l, 1);
              l--;

              if (
                type === "NCourses" &&
                courses.length === initialLength - amount
              ) {
                courses.splice(0, courses.length);
              }
            }
          }
        }
      }
    }
  }

  return reqsCopy;
}

export function generateCourseGroupKey(courseGroup, groupIndex) {
  const coursesKey = courseGroup.courses
    .map((course) => course.courseId || course.seriesTitle)
    .join("-");

  return `group-${coursesKey}-${groupIndex}`;
}

export function generateRequirementKey(requirementObj, index) {
  const courseIds = requirementObj.requiredCourses
    .flatMap((group) => group.courses)
    .map((course) => course.courseId || course.seriesTitle)
    .join("-");

  return `req-${courseIds}-${index}`;
}

export function findArticulation(course, articulations) {
  const { courseId } = course;

  const articulationId = courseId.split("_")[0];

  /*

  for (const uni in articulations) {
    const articsForEachUni = articulations[uni];

    for (let i = 0; i < articsForEachUni.length; i++) {
      const majorReqs = majorsForEachUni[i];

      for (let j = 0; j < majorReqs.length; j++) {
        const requirement = majorReqs[j];

        for (let k = 0; k < requirement.requiredCourses.length; k++) {
          const { courses, type, amount } = requirement.requiredCourses[k];

          const initialLength = courses.length;

          for (let l = 0; l < courses.length; l++) {
            const currentCourse = courses[l];
            const id = currentCourse.courseId || currentCourse.seriesId;

            if (!knownIds.has(id)) {
              knownIds.add(id);
            } else {
              courses.splice(l, 1);
              l--;

              if (
                type === "NCourses" &&
                courses.length === initialLength - amount
              ) {
                courses.splice(0, courses.length);
              }
            }
          }
        }
      }
    }
  }

  */
}

export function groupByUni(reqsList) {
  const newReqsList = [];
  const fyIds = new Set();

  for (let i = 0; i < reqsList.length; i++) {
    const { inputs } = reqsList[i];

    fyIds.add(inputs.fyId);
  }

  for (const id of fyIds) {
    const filtered = reqsList.filter((req) => req.inputs.fyId === id);

    newReqsList.push(filtered);
  }

  return newReqsList;
}
