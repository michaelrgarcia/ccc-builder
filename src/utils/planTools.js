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
  const idToFind = course.courseId || course.seriesId;

  const noYearCourseId = idToFind.split("_")[0];

  for (let i = 0; i < articulations.length; i++) {
    const { articulatedCourses, universityInfo, cccInfo, articulationInfo } =
      articulations[i];

    for (let j = 0; j < articulatedCourses.length; j++) {
      const articulationId =
        articulatedCourses[j].courseId || articulatedCourses[j].seriesId;

      if (Number(noYearCourseId) === Number(articulationId)) {
        return {
          ...articulatedCourses[j],
          articulationInfo,
          universityInfo,
          cccInfo,
        };
      }
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
      planCoursesCopy[i] = planCoursesCopy[i + 1];
    }
  }

  return planCoursesCopy;
}

export function prePopulatePlan(reqsList, articulations) {
  let planCourses = [];

  for (let i = 0; i < reqsList.length; i++) {
    const { requirements } = reqsList[i];

    for (let j = 0; j < requirements.length; j++) {
      const req = requirements[j];

      for (let k = 0; k < req.requiredCourses.length; k++) {
        const { courses } = req.requiredCourses[k];

        for (let l = 0; l < courses.length; l++) {
          const currentCourse = courses[l];
          const associatedArticulation = findArticulation(
            currentCourse,
            articulations
          );

          if (
            associatedArticulation &&
            associatedArticulation.articulationOptions.length === 1
          ) {
            // make into the planCourse adding function?
            // address the one articulationOptions array being more than 1 course long
            // address berkeley "articulation subject to university course here" (dont add courses with that)
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

            for (
              let i = 0;
              i < associatedArticulation.articulationOptions[0].length;
              i++
            ) {
              const cccCourse =
                associatedArticulation.articulationOptions[0][i];

              // 376897: special articulationOptions (length 1) case
              // the courseId of honors discrete math at de anza college

              if (Number(cccCourse.courseId) !== 376897) {
                const dupeIndex = planCourses.findIndex(
                  (course) =>
                    Number(course.courseId) === Number(cccCourse.courseId) ||
                    Number(course.seriesId) === Number(cccCourse.seriesId)
                );

                if (dupeIndex === -1 && Number(cccCourse.courseId) !== 376897) {
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

            planCourses = minimizeCourses(planCourses);
          }
        }
      }
    }
  }

  return planCourses;
}

// rework to handle entire articulationOptions arrays at once

export function existingArticulationMatch(articulation, planCourse, groupInfo) {
  if (articulation) {
    //  REFER TO pseudocode in drawer written on paper
    /*
    if (groupInfo.type === "AllCourses") {

      for (let i = 0; i < articulation.articulationOptions.length; i++) {
        const currentOptions = articulation.articulationOptions[i];

        for (let j = 0; j < currentOptions.length; j++) {
          const currentOption = currentOptions[j];

          if (
            Number(planCourse.courseId) === Number(currentOption.courseId) ||
            planCourse.seriesId === currentOption.seriesId
          ) {
            return true;
          }
        }
      }
    } else if (groupInfo.type === "NCourses" && groupInfo.amount) {
      let reqsSatisfied = 0;

      for (let i = 0; i < articulation.articulationOptions.length; i++) {
        const currentSet = articulation.articulationOptions[i];

        for (let j = 0; j < currentSet.length; j++) {
          const currentOption = currentSet[j];

          if (
            Number(planCourse.courseId) === Number(currentOption.courseId) ||
            planCourse.seriesId === currentOption.seriesId
          ) {
            reqsSatisfied += 1;
          }

          if (reqsSatisfied === groupInfo.amount) {
            return true;
          }
        }
      }
    }

    */
  }

  return false;
}
