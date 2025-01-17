import { caliCCs } from "./staticAssistData";

export function createProgressTracker(linksLength) {
  let totalProcessed = 0;

  const updateProgress = (processed) => {
    totalProcessed += processed;
    // this used to set the textcontent of something
    // updateProgressTracker(totalProcessed, linksLength);
  };

  return updateProgress;
}

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

export async function getArticulationParams(receivingId, majorKey, year) {
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

async function processStream(stream, updateProgress) {
  const reader = stream.getReader();
  const decoder = new TextDecoder("utf-8");

  const streamArticulations = [];
  let accumulatedData = "";

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    const decodedChunk = decoder.decode(value, { stream: true });
    accumulatedData += decodedChunk;

    let end = accumulatedData.indexOf("\n");

    while (end !== -1) {
      const jsonString = accumulatedData.slice(0, end);
      accumulatedData = accumulatedData.slice(end + 1);

      try {
        const articulation = JSON.parse(jsonString);

        if (articulation.result) {
          createClassLists(articulation);
          streamArticulations.push(articulation);
        }

        updateProgress(1);
      } catch (error) {
        console.error(`error parsing articulation: ${error}`);
      }

      end = accumulatedData.indexOf("\n");
    }
  }

  return streamArticulations;
}

async function requestArticulations(
  links,
  signal,
  courseId,
  year,
  updateProgress
) {
  let streamArticulations;

  try {
    const linksList = JSON.stringify(links);

    const endpoint = `${
      import.meta.env.VITE_NEW_ARTICULATION_FETCHER
    }/?courseId=${courseId}&year=${year}`;

    const response = await fetch(endpoint, {
      body: linksList,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Connection: "keep-alive",
      },
      signal,
    });

    streamArticulations = await processStream(response.body, updateProgress);
  } catch (error) {
    console.error(`error processing stream: ${error}`);
  }

  return streamArticulations;
}

async function processChunks(
  processingQueue,
  signal,
  courseId,
  updateProgress,
  year,
  assistArticulations
) {
  const concurrencyLimit = 29;

  let linksChunk;

  if (processingQueue.length === 0) return assistArticulations;

  if (processingQueue.length < concurrencyLimit) {
    linksChunk = processingQueue.splice(0, processingQueue.length - 1);
  } else {
    linksChunk = processingQueue.splice(0, concurrencyLimit);
  }

  try {
    const streamArticulations = await requestArticulations(
      linksChunk,
      signal,
      courseId,
      year,
      updateProgress
    );

    assistArticulations.push(...streamArticulations);

    return await processChunks(
      processingQueue,
      signal,
      courseId,
      updateProgress,
      year,
      assistArticulations
    ); // recursive call
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("aborted request");
    } else {
      console.error("error processing chunk:", error);
    }
  }
}

export function createListFromDb(articulations, linksLength, updateProgress) {
  for (let i = 0; i < articulations.length; i++) {
    const articulation = articulations[i];

    if (articulation) {
      createClassLists(articulation);
    }
  }

  updateProgress(linksLength);
  // hideLoadingContainer();
}

async function getClassFromDb(fullCourseId, linksLength, updateProgress) {
  const courseGrabber = import.meta.env.VITE_COURSE_GRABBER;

  try {
    const response = await fetch(`${courseGrabber}/${fullCourseId}`);

    if (response.status === 200) {
      const articulations = await response.json();

      createListFromDb(articulations, linksLength, updateProgress);

      return articulations;
    }

    if (response.status === 204) {
      console.log("restarting incomplete caching job...");

      return false;
    }

    if (response.status === 206) {
      // hideLoadingContainer();
      // processingPrompt();

      return true;
    }
  } catch (err) {
    console.error("error getting class from db", err);
  }

  return false;
}

async function finalizeSearch(fullCourseId, articulations) {
  const cacheFinalizer = import.meta.env.VITE_CACHE_COMPLETER;

  if (articulations) {
    // organizeArticulations();

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

export async function getArticulationData(links, courseId, year) {
  const fullCourseId = `${courseId}_${year}`;
  const processingQueue = links.slice();

  const abortController = new AbortController();
  const { signal, isAborted } = abortHandler(abortController);

  const updateProgress = createProgressTracker(links.length);

  let articulations;

  window.addEventListener("beforeunload", () => abortController.abort());

  updateProgress(0);

  try {
    articulations = await getClassFromDb(
      fullCourseId,
      links.length,
      updateProgress
    );

    if (!articulations) {
      articulations = await processChunks(
        processingQueue,
        signal,
        courseId,
        updateProgress,
        year
      );

      // hideLoadingContainer();

      if (!isAborted) {
        await finalizeSearch(fullCourseId, articulations);
      }
    }
  } catch (error) {
    if (error.name === "AbortError") {
      console.log("requests aborted due to page unload");
    } else {
      console.error("error processing requests", error);
    }
  } finally {
    window.removeEventListener("beforeunload", () => abortController.abort());
  }

  return { articulations, updateProgress };
}
