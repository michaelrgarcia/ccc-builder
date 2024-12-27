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

export function getUniReqs(requirements) {
  const uniReqs = [];

  for (let i = 0; i < requirements.length; i++) {
    const currentReqGroup = requirements[i];
    const reqdCourses = currentReqGroup.requiredCourses;

    for (let j = 0; j < reqdCourses.length; j++) {
      const currentReq = reqdCourses[j];

      if (currentReq.type === "AllCourses") {
        uniReqs.push(currentReqGroup);
      }
    }
  }

  return uniReqs;
}

export function getUserChoices(requirements) {
  const userChoices = [];

  for (let i = 0; i < requirements.length; i++) {
    const currentReqGroup = requirements[i];
    const reqdCourses = currentReqGroup.requiredCourses;

    for (let j = 0; j < reqdCourses.length; j++) {
      const currentReq = reqdCourses[j];

      if (currentReq.type === "NCourses" && currentReq.courses.length > 1) {
        userChoices.push(currentReqGroup);
      }
    }
  }

  return userChoices;
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
