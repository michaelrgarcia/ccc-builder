export function createAbbreviation(text) {
  return text
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function normalizeString(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove punctuation
    .trim();
}

export function matchName(name, query) {
  if (!name || !query) {
    return false;
  }

  const normalizedName = normalizeString(name);
  const normalizedQuery = normalizeString(query);
  const nameAbbreviation = createAbbreviation(name);
  const queryAbbreviation = createAbbreviation(query);

  if (normalizedName.includes(normalizedQuery)) {
    return true;
  }

  if (nameAbbreviation.includes(queryAbbreviation)) {
    return true;
  }

  if (nameAbbreviation.startsWith(queryAbbreviation)) {
    return true;
  }

  const nameWords = normalizedName.split(/\s+/);
  const queryWords = normalizedQuery.split(/\s+/);

  if (
    queryWords.every((qWord) =>
      nameWords.some((nameWord) => nameWord.includes(qWord))
    )
  ) {
    return true;
  }

  return false;
}
