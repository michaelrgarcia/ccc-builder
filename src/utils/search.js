function createAbbreviation(text, wordsToFilter) {
  return text
    .split(/\s+/)
    .filter((word) => wordsToFilter.indexOf(word.toLowerCase()) === -1)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function normalizeString(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim();
}

export function uniSearch(name, query) {
  if (!name || !query) {
    return false;
  }

  const normalizedName = normalizeString(name);
  const normalizedQuery = normalizeString(query);
  const nameAbbreviation = createAbbreviation(name, ["of"]).toLowerCase();
  const queryAbbreviation = createAbbreviation(query, ["of"]).toLowerCase();

  const queryWords = normalizedQuery.split(/\s+/);
  const nameWords = normalizedName.split(/\s+/);

  if (nameAbbreviation === queryAbbreviation) {
    return true;
  }

  if (
    queryAbbreviation.length <= 4 &&
    nameAbbreviation.startsWith(queryAbbreviation)
  ) {
    const match = queryAbbreviation === nameAbbreviation;

    if (match) {
      return true;
    }

    if (
      normalizedName.includes(queryAbbreviation) &&
      !normalizedName.includes("university") &&
      !normalizedName.includes("california")
    ) {
      return true;
    }
  }

  if (normalizedName.includes(normalizedQuery)) {
    return true;
  }

  if (
    queryWords.every((qWord) =>
      nameWords.some(
        (nameWord) =>
          nameWord.includes(qWord) ||
          (qWord.length <= 4 && nameAbbreviation.startsWith(qWord))
      )
    )
  ) {
    return true;
  }

  return false;
}

export function ccAndMajorSearch(name, query) {
  if (!name || !query) {
    return false;
  }

  const normalizedName = normalizeString(name);
  const nameAbbreviation = createAbbreviation(name, ["the"]).toLowerCase();
  const normalizedQuery = normalizeString(query).toLowerCase();

  if (nameAbbreviation === normalizedQuery) {
    return true;
  }

  if (nameAbbreviation.startsWith(normalizedQuery)) {
    return true;
  }

  if (normalizedName.includes(normalizedQuery)) {
    return true;
  }

  return false;
}
