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
    let instructions = "";

    for (let i = 0; i < requiredCourses.length; i++) {
      const currentReq = requiredCourses[i];

      if (currentReq.courses.length > 1) {
        const progressiveLetter = String.fromCharCode(i + 1 + 64);

        if (i === 0) {
          instructions = "Complete";
        } else if (i !== requiredCourses.length - 1) {
          instructions += ` ${progressiveLetter}, `;
        } else {
          instructions += ` and ${progressiveLetter}`;
        }
      }
    }

    return instructions;
  }
}

export function removeDupes(reqsList) {
  const uniGroups = groupByUni(reqsList);

  for (let i = 0; i < uniGroups.length; i++) {
    const knownIds = new Set();
    const majorReqs = uniGroups[i];

    for (let j = 0; j < majorReqs.length; j++) {
      const { requirements } = majorReqs[j];

      for (let k = 0; k < requirements.length; k++) {
        const req = requirements[k];

        for (let l = 0; l < req.requiredCourses.length; l++) {
          const { courses, type, amount } = req.requiredCourses[l];

          const initialLength = courses.length;

          for (let m = 0; m < courses.length; m++) {
            const currentCourse = courses[m];

            const id = currentCourse.courseId || currentCourse.seriesId;

            if (!knownIds.has(id)) {
              knownIds.add(id);
            } else {
              courses.splice(m, 1);
              m--;

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

  return uniGroups.flat();
}

export function findArticulation(course, articulations) {
  const idToFind = (course.courseId || course.seriesId).split("_")[0];

  for (const articulation of articulations) {
    const { articulationInfo, universityInfo, cccInfo, articulatedCourses } =
      articulation;

    const match = articulatedCourses.find((c) => {
      const artId = c.courseId ? Number(c.courseId) : c.seriesId;
      const searchId = course.courseId ? Number(idToFind) : idToFind;

      return artId === searchId;
    });

    if (match) {
      return {
        ...match,
        articulationInfo,
        universityInfo,
        cccInfo,
      };
    }
  }
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

export function matchArticulation(articulationOption, planCourse) {
  if (articulationOption.courseId && planCourse.courseId) {
    return Number(planCourse.courseId) === Number(articulationOption.courseId);
  }

  if (articulationOption.seriesId && planCourse.seriesId) {
    return planCourse.seriesId === articulationOption.seriesId;
  }

  return false;
}

export function articulationInPlan(articulation, planCourses) {
  if (!articulation) {
    return false;
  }

  for (let i = 0; i < articulation.articulationOptions.length; i++) {
    const currentOption = articulation.articulationOptions[i];

    if (
      currentOption.every((course) =>
        planCourses.some((planCourse) => matchArticulation(course, planCourse))
      ) ||
      planCourses.some(
        (planCourse) =>
          Number(planCourse.courseId) === 359214 &&
          Number(currentOption[0].courseId) === 359214
      )
    ) {
      return true;
    }
  }

  return false;
}

export function minimizeCourses(planCourses) {
  const planCoursesCopy = [...planCourses];

  for (let i = 0; i < planCoursesCopy.length - 1; i++) {
    if (
      planCoursesCopy[i].articulatesTo.length <
        planCoursesCopy[i + 1].articulatesTo.length &&
      planCoursesCopy[i].articulatesTo.every((course) =>
        planCoursesCopy[i + 1].articulatesTo.includes(course)
      )
    ) {
      planCoursesCopy.splice(i, 1);
    }
  }

  return planCoursesCopy;
}

export function prePopulatePlan(reqsList, articulations) {
  let planCourses = [];

  // single option
  for (const reqs of reqsList) {
    for (const req of reqs.requirements) {
      for (const courseGroup of req.requiredCourses) {
        for (const course of courseGroup.courses) {
          const associatedArticulation = findArticulation(
            course,
            articulations
          );

          if (!associatedArticulation) continue;

          if (associatedArticulation.articulationOptions.length === 1) {
            let fyCourse;

            if (associatedArticulation.articulationType === "Course") {
              fyCourse = {
                courseTitle: associatedArticulation.courseTitle,
                coursePrefix: associatedArticulation.coursePrefix,
                courseNumber: associatedArticulation.courseNumber,
                courseId: associatedArticulation.courseId,
              };
            } else {
              fyCourse = {
                seriesTitle: associatedArticulation.seriesTitle,
                seriesId: associatedArticulation.seriesId,
              };
            }

            for (const cccCourse of associatedArticulation
              .articulationOptions[0]) {
              if (Number(cccCourse.courseId) === 376897) continue;

              const dupeIndex = planCourses.findIndex((course) =>
                matchArticulation(course, cccCourse)
              );

              if (dupeIndex === -1) {
                planCourses.push({
                  ...cccCourse,
                  articulatesTo: [
                    {
                      ...associatedArticulation.articulationInfo,
                      fyCourse,
                    },
                  ],
                  cccInfo: associatedArticulation.cccInfo,
                });
              } else {
                planCourses[dupeIndex].articulatesTo.push({
                  ...associatedArticulation.articulationInfo,
                  fyCourse,
                });
              }
            }
          }
        }
      }
    }
  }

  // existing courses
  for (const reqs of reqsList) {
    for (const req of reqs.requirements) {
      for (const courseGroup of req.requiredCourses) {
        for (const course of courseGroup.courses) {
          const associatedArticulation = findArticulation(
            course,
            articulations
          );

          if (
            !associatedArticulation ||
            associatedArticulation.articulationOptions.length === 1
          )
            continue;

          for (const option of associatedArticulation.articulationOptions) {
            const allCoursesPresent = option.every((cccCourse) =>
              planCourses.some((planCourse) =>
                matchArticulation(planCourse, cccCourse)
              )
            );

            if (allCoursesPresent) {
              const fyCourse =
                associatedArticulation.articulationType === "Course"
                  ? {
                      courseTitle: associatedArticulation.courseTitle,
                      coursePrefix: associatedArticulation.coursePrefix,
                      courseNumber: associatedArticulation.courseNumber,
                      courseId: associatedArticulation.courseId,
                    }
                  : {
                      seriesTitle: associatedArticulation.seriesTitle,
                      seriesId: associatedArticulation.seriesId,
                    };

              for (const cccCourse of option) {
                const courseIndex = planCourses.findIndex((planCourse) =>
                  matchArticulation(planCourse, cccCourse)
                );

                if (courseIndex !== -1) {
                  planCourses[courseIndex].articulatesTo.push({
                    ...associatedArticulation.articulationInfo,
                    fyCourse,
                  });
                }
              }
            }
          }
        }
      }
    }
  }

  return minimizeCourses(planCourses);
}
