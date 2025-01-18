import { caliCCs } from "./staticAssistData";

export function createClassLists(articulation) {
  if (articulation && articulation.result) {
    const { result } = articulation;

    const courseCache = [];
    let collegeName = "";
    let agreementLink = "";

    for (let i = 0; i < result.length; i++) {
      const item = result[i];

      if (item) {
        if (typeof item == "object" && "ccName" in item) {
          collegeName = item.ccName;
        } else if (typeof item == "object" && "agreementLink" in item) {
          agreementLink = item.agreementLink;
        } else if (typeof item === "string" /* || isArticulation(item) */) {
          courseCache.push(item);
        }

        if (collegeName && agreementLink) {
          /*

            const classListDiv = classListMainDiv();
            classListHeader(classListDiv, collegeName, agreementLink);
  
            renderItems(courseCache, classListDiv);

            */
        }
      }
    }
  }
}

export function getArticulationParams(receivingId, majorKey, year) {
  const articulationParams = [];

  caliCCs.forEach((college) => {
    if (college.id) {
      const sending = college.id;
      const link = `${
        import.meta.env.VITE_ASSIST_API_PARAMS
      }=${year}/${sending}/to/${receivingId}/Major/${majorKey}`;

      // might remove
      const agreementLink = `${
        import.meta.env.VITE_ASSIST_AGREEMENT_PARAMS
      }=${year}&institution=${sending}&agreement=${receivingId}&agreementType=to&view=agreement&viewBy=major&viewSendingAgreements=false&viewByKey=${year}/${sending}/to/${receivingId}/Major/${majorKey}`;

      articulationParams.push({ link, agreementLink });
    }
  });

  return articulationParams;
}

export async function finalizeSearch(fullCourseId, articulations) {
  const cacheFinalizer = import.meta.env.VITE_CACHE_COMPLETER;

  if (articulations) {
    try {
      await fetch(cacheFinalizer, {
        body: JSON.stringify({
          fullCourseId,
        }),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.error(`error finalizing cache job: ${err}`);
      // cacheFinalizeError();
    }
  }
}

export async function getClassFromDb(fullCourseId) {
  const courseGrabber = import.meta.env.VITE_COURSE_GRABBER;

  try {
    const response = await fetch(`${courseGrabber}/${fullCourseId}`);

    if (response.status === 200) {
      const articulations = await response.json();

      return articulations;
    }

    if (response.status === 204) {
      console.log("restarting incomplete caching job...");

      return false;
    }

    if (response.status === 206) {
      return true;
    }
  } catch (err) {
    console.error("error getting class from db", err);
  }

  return false;
}
