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
      const progressiveLetter = String.fromCharCode(65 + i);

      if (i !== requiredCourses.length - 1) {
        instructions += `${progressiveLetter}, `;
      } else {
        instructions += `${lowerConj} ${progressiveLetter}`;
      }
    }

    return `Complete ${instructions}`;
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

export function minimizeCourses(planCourses) {
  // MUTATES PLANCOURSES

  const articulationIds = planCourses.map(({ articulatesTo }) =>
    articulatesTo.map(({ fyCourse }) => fyCourse.courseId || fyCourse.seriesId)
  );

  for (let i = 0; i < articulationIds.length; i++) {
    for (let j = i + 1; j < articulationIds.length; j++) {
      let subset;

      if (
        articulationIds[i].length !== articulationIds[j].length &&
        articulationIds[i].every((id) => articulationIds[j].includes(id))
      ) {
        if (articulationIds[i].length < articulationIds[j].length) {
          subset = articulationIds[i];
        } else {
          subset = articulationIds[j];
        }
      }

      for (let k = 0; k < planCourses.length; k++) {
        if (!subset) continue;

        const planCourse = planCourses[k];

        const subsetMapping = planCourse.articulatesTo.every(
          (infoObj) =>
            subset.includes(infoObj.fyCourse.courseId) ||
            subset.includes(infoObj.fyCourse.seriesId)
        );

        if (subsetMapping) {
          planCourses.splice(k, 1);
        }
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

export function createArticulatesTo(articulations, planCourses) {
  // mutates planCourses

  for (const planCourse of planCourses) {
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
}

export function populatePlan(reqsList, articulations, planCourses) {
  for (const reqs of reqsList) {
    for (const req of reqs.requirements) {
      const { conjunction, requiredCourses } = req;
      if (conjunction === "Or") continue;

      for (const courseGroup of requiredCourses) {
        selectArticulations(courseGroup, planCourses, articulations);
      }
    }
  }

  // update articulatesTo arrays
  createArticulatesTo(articulations, planCourses);

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

    if (excludedGroup) {
      courseGroupsFinished += 1;
      continue;
    }

    for (let j = 0; j < courses.length; j++) {
      const course = courses[j];

      const articulation = findArticulation(course, articulations);

      const searchInPlan = planCourses.filter(({ articulatesTo }) =>
        articulatesTo.some(
          ({ fyCourse }) =>
            Number(fyCourse.courseId) ===
            Number(
              course.courseId.split("_")[0] ||
                fyCourse.seriesId === course.seriesId.split("_")[0]
            )
        )
      );

      const excluded = excludedCourses.some(
        (excluded) => JSON.stringify(excluded) === JSON.stringify(course)
      );

      if (!excluded) {
        if (!articulation && searchInPlan.length === 0) {
          continue;
        }

        if (articulation) {
          const articulationFulfilled = articulation.articulationOptions.some(
            (option) =>
              option.every((cccCourse) =>
                planCourses.some((planCourse) =>
                  matchArticulation(planCourse, cccCourse)
                )
              )
          );

          if (articulationFulfilled) {
            fulfilled +=
              type === "NCourses" || type === "AllCourses" ? 1 : course.credits;
          }
        } else if (searchInPlan.length > 0) {
          fulfilled +=
            type === "NCourses" || type === "AllCourses" ? 1 : course.credits;
        }
      }
    }

    if (type === "AllCourses") {
      if (fulfilled === courses.length) {
        courseGroupsFinished += 1;
      }
    } else if (type === "NCourses" || type === "NCredits") {
      if (fulfilled >= amount) {
        courseGroupsFinished += 1;
      }
    }
  }

  if (conjunction === "Or") {
    return courseGroupsFinished >= 1;
  } else {
    return courseGroupsFinished >= requiredCourses.length;
  }
}

export function getEquivalentArtInfo(searchArt, prajArt) {
  for (const articulationObj of prajArt) {
    const { articulationInfo, universityInfo, cccInfo } = articulationObj;

    for (const articulation of articulationObj.articulatedCourses) {
      for (const option of articulation.articulationOptions) {
        if (Array.isArray(searchArt)) {
          const noStr = searchArt.filter((item) => typeof item !== "string");

          const equivalentSeries = option.every(
            (optCourse, index) =>
              noStr[index].prefix === optCourse.coursePrefix &&
              Number(noStr[index].courseNumber) ===
                Number(optCourse.courseNumber) &&
              noStr[index].courseTitle === optCourse.courseTitle
          );

          if (equivalentSeries) {
            return {
              articulationInfo,
              universityInfo,
              cccInfo,
              ...articulation,
              option,
            };
          }
        }

        if (
          searchArt.courseNumber &&
          searchArt.courseTitle &&
          searchArt.prefix &&
          option.length === 1
        ) {
          if (
            Number(option[0].courseNumber) === Number(searchArt.courseNumber) &&
            option[0].courseTitle === searchArt.courseTitle &&
            option[0].coursePrefix === searchArt.prefix
          ) {
            return {
              articulationInfo,
              universityInfo,
              cccInfo,
              ...articulation,
              option,
            };
          }
        }
      }
    }
  }

  return null;
}

export function myArtInPlan(subitem, planCourses) {
  if (Array.isArray(subitem)) {
    const noStr = subitem.filter((item) => typeof item !== "string");

    const equivalentSeries = noStr.every((course) =>
      planCourses.some(
        (planCourse) =>
          course.prefix === planCourse.coursePrefix &&
          Number(course.courseNumber) === Number(planCourse.courseNumber) &&
          course.courseTitle === planCourse.courseTitle
      )
    );

    return equivalentSeries;
  } else if (subitem.courseNumber && subitem.courseTitle && subitem.prefix) {
    const equivalentCccCourse = planCourses.some(
      (planCourse) =>
        subitem.prefix === planCourse.coursePrefix &&
        Number(subitem.courseNumber) === Number(planCourse.courseNumber) &&
        subitem.courseTitle === planCourse.courseTitle
    );

    return equivalentCccCourse;
  }
}

export function filterSearchArtInPlan(
  cachedSearch,
  planCoursesCopy,
  preserveItem
) {
  for (let i = 0; i < cachedSearch.length; i++) {
    const currentSearchArt = cachedSearch[i];

    if (preserveItem && currentSearchArt.result[0] === preserveItem) {
      continue;
    }

    if (Array.isArray(currentSearchArt.result[0])) {
      const noStr = currentSearchArt.result[0].filter(
        (item) => typeof item !== "string"
      );

      for (let j = 0; j < noStr.length; j++) {
        const currentArt = noStr[j];

        const indexInPlan = planCoursesCopy.findIndex(
          (planCourse) =>
            currentArt.prefix === planCourse.coursePrefix &&
            Number(currentArt.courseNumber) ===
              Number(planCourse.courseNumber) &&
            currentArt.courseTitle === planCourse.courseTitle
        );

        if (indexInPlan !== -1) {
          planCoursesCopy.splice(indexInPlan, 1);
        }
      }
    } else if (
      currentSearchArt.result[0].courseNumber &&
      currentSearchArt.result[0].courseTitle &&
      currentSearchArt.result[0].prefix
    ) {
      const currentArt = currentSearchArt.result[0];

      if (preserveItem && currentArt === preserveItem) {
        continue;
      }

      const indexInPlan = planCoursesCopy.findIndex(
        (planCourse) =>
          currentArt.prefix === planCourse.coursePrefix &&
          Number(currentArt.courseNumber) === Number(planCourse.courseNumber) &&
          currentArt.courseTitle === planCourse.courseTitle
      );

      if (indexInPlan !== -1) {
        planCoursesCopy.splice(indexInPlan, 1);
      }
    }
  }
}
