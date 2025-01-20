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

export function createInstructions(requiredCourses, conjunction) {
  const lowerConj = conjunction ? conjunction.toLowerCase() : "and";

  if (requiredCourses.length < 2) {
    return "";
  } else if (requiredCourses.length === 2) {
    return `Complete A ${lowerConj} B`;
  } else if (requiredCourses.length > 2) {
    let instructions = "";

    for (let i = 0; i < requiredCourses.length; i++) {
      const currentReq = requiredCourses[i];

      if (currentReq.courses.length === 1) {
        break;
      } else if (currentReq.courses.length > 1) {
        const progressiveLetter = String.fromCharCode(i + 1 + 64);

        if (i === 0) {
          instructions = "Complete A,";
        } else if (i !== requiredCourses.length - 1) {
          instructions += ` ${progressiveLetter}, `;
        } else {
          instructions += ` ${lowerConj} ${progressiveLetter}`;
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
      )
    ) {
      return true;
    }
  }

  return false;
}

function minimizeCourses(planCourses) {
  // MUTATES PLANCOURSES

  const getArticulationIds = (articulations) =>
    articulations
      .map((art) => Number(art.fyCourse.courseId) || art.fyCourse.seriesId)
      .sort();

  for (const course of planCourses) {
    const ids = getArticulationIds(course.articulatesTo);

    const inferiorIndex = planCourses.findIndex((bestCourse) => {
      const existingIds = getArticulationIds(bestCourse.articulatesTo);

      return (
        existingIds.length === ids.length &&
        existingIds.every((id, index) => id === ids[index])
      );
    });

    if (inferiorIndex !== -1) {
      const existingCourse = planCourses[inferiorIndex];
      const existingIds = getArticulationIds(existingCourse.articulatesTo);

      if (
        ids.length > existingIds.length &&
        existingIds.every((id) => ids.includes(id))
      ) {
        planCourses[inferiorIndex] = course;
      }
    }
  }
}

export function updatePlanCourses(planCourses, option, articulation, fyCourse) {
  // MUTATES PLANCOURSES

  for (const cccCourse of option) {
    const dupeIndex = planCourses.findIndex((course) =>
      matchArticulation(course, cccCourse)
    );

    if (dupeIndex === -1) {
      planCourses.push({
        ...cccCourse,
        articulatesTo: [
          {
            ...articulation.articulationInfo,
            fyCourse,
          },
        ],
        cccInfo: articulation.cccInfo,
      });
    } else {
      const existingCourse = planCourses[dupeIndex];

      const alreadyArticulated = existingCourse.articulatesTo.some(
        (entry) =>
          Number(entry.fyCourse.courseId) === Number(fyCourse.courseId) ||
          String(entry.fyCourse.seriesId) === String(fyCourse.seriesId)
      );

      if (!alreadyArticulated) {
        existingCourse.articulatesTo.push({
          ...articulation.articulationInfo,
          fyCourse,
        });
      }
    }
  }

  minimizeCourses(planCourses);
}

function selectArticulations(courseGroup, planCourses, articulations) {
  const { courses, type, amount } = courseGroup;

  let fulfilled = 0;

  for (const course of courses) {
    if (amount && fulfilled >= amount) break;

    const articulation = findArticulation(course, articulations);

    if (!articulation) continue;

    const fyCourse =
      articulation.articulationType === "Course"
        ? {
            courseTitle: articulation.courseTitle,
            coursePrefix: articulation.coursePrefix,
            courseNumber: articulation.courseNumber,
            courseId: articulation.courseId,
          }
        : {
            seriesTitle: articulation.seriesTitle,
            seriesId: articulation.seriesId,
          };

    for (const option of articulation.articulationOptions) {
      if (amount && fulfilled >= amount) break;

      if (!amount && articulation.articulationOptions.length === 1) {
        updatePlanCourses(planCourses, option, articulation, fyCourse);
      } else {
        const allCoursesInPlan = option.every((cccCourse) =>
          planCourses.some((planCourse) =>
            matchArticulation(planCourse, cccCourse)
          )
        );

        if (allCoursesInPlan) {
          updatePlanCourses(planCourses, option, articulation, fyCourse);

          fulfilled += type === "NCourses" ? 1 : course.credits;
        }
      }
    }
  }
}

export function populatePlan(reqsList, articulations, planCourses) {
  for (const reqs of reqsList) {
    for (const req of reqs.requirements) {
      const { conjunction, requiredCourses } = req;

      if (conjunction === "Or") {
        const shortestGroup = requiredCourses.reduce((shortest, group) =>
          group.courses.length < shortest.courses.length ? group : shortest
        );

        selectArticulations(shortestGroup, planCourses, articulations);

        continue;
      } else {
        for (const courseGroup of requiredCourses) {
          selectArticulations(courseGroup, planCourses, articulations);
        }
      }
    }
  }

  // update articulatesTo arrays
  for (const planCourse of planCourses) {
    planCourse.articulatesTo = [];

    for (const articulation of articulations) {
      for (const artCourse of articulation.articulatedCourses) {
        for (const opt of artCourse.articulationOptions) {
          if (!opt.some((course) => matchArticulation(course, planCourse))) {
            continue;
          }

          if (
            !opt.every((course) =>
              planCourses.some((planCourse) =>
                matchArticulation(course, planCourse)
              )
            )
          ) {
            continue;
          }

          const fyCourse =
            artCourse.articulationType === "Course"
              ? {
                  courseTitle: artCourse.courseTitle,
                  coursePrefix: artCourse.coursePrefix,
                  courseNumber: artCourse.courseNumber,
                  courseId: artCourse.courseId,
                }
              : {
                  seriesTitle: artCourse.seriesTitle,
                  seriesId: artCourse.seriesId,
                };

          const alreadyArticulated = planCourse.articulatesTo.some(
            (articulated) =>
              (articulated.fyCourse.courseId &&
                Number(articulated.fyCourse.courseId) ===
                  Number(fyCourse.courseId)) ||
              (articulated.fyCourse.seriesId &&
                String(articulated.fyCourse.seriesId) ===
                  String(fyCourse.seriesId))
          );

          if (!alreadyArticulated) {
            planCourse.articulatesTo.push({
              ...articulation.articulationInfo,
              fyCourse,
            });
          }
        }
      }
    }
  }

  return planCourses;
}

export function requirementCompleted(
  requirement,
  articulations,
  planCourses,
  excludedCourses
) {
  const { conjunction, requiredCourses } = requirement;

  let courseGroupsFinished = 0;

  for (let i = 0; i < requiredCourses.length; i++) {
    const { courses, amount, type } = requiredCourses[i];

    let fulfilled = 0;

    const excludedGroup = courses.every((course) =>
      excludedCourses.some(
        (excluded) => JSON.stringify(excluded) === JSON.stringify(course)
      )
    );

    for (let j = 0; j < courses.length; j++) {
      const course = courses[j];

      const articulation = findArticulation(course, articulations);

      const excluded = excludedCourses.some(
        (excluded) => JSON.stringify(excluded) === JSON.stringify(course)
      );

      if (!articulation && excluded) {
        fulfilled +=
          type === "NCourses" || type === "AllCourses" ? 1 : course.credits;
      } else if (articulation) {
        for (const option of articulation.articulationOptions) {
          const inPlan = option.every((cccCourse) =>
            planCourses.some((planCourse) =>
              matchArticulation(planCourse, cccCourse)
            )
          );

          if (inPlan) {
            fulfilled +=
              type === "NCourses" || type === "AllCourses" ? 1 : course.credits;
          }
        }
      }
    }

    if (fulfilled >= amount || fulfilled >= courses.length || excludedGroup) {
      courseGroupsFinished += 1;
    }
  }

  if (conjunction === "Or") {
    return courseGroupsFinished >= 1;
  } else {
    return courseGroupsFinished >= requiredCourses.length;
  }
}

/*

async function getEquivalentPrajArticulation(paramsList) {
  if (!paramsList) return null;
  
   try {
    const endpoint = import.meta.env.VITE_PRAJWAL_ARTICULATIONS;

    const response = await fetch(endpoint, {
      body: JSON.stringify(paramsList),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Connection: "keep-alive",
      },
    });

    if (response.ok) {
      const newArticulations = await response.json();
    }
  } catch (err) {
    console.error("Failed articulations search: ", err);
  }
}

*/
