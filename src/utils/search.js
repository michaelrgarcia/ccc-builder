export function createAbbreviation(text) {
  return text
    .split(/\s+/)
    .filter((word) => word.toLowerCase() !== "of")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function normalizeString(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .trim();
}

export function matchName(name, query) {
  if (!name || !query) {
    return false;
  }

  const normalizedName = normalizeString(name);
  const normalizedQuery = normalizeString(query);
  const nameAbbreviation = createAbbreviation(name).toLowerCase();
  const queryAbbreviation = createAbbreviation(query).toLowerCase();

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

  /*

  if (nameAbbreviation.includes(queryAbbreviation)) {
    return true;
  }

  */

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
