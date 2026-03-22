const PROFANITY_TERMS = [
  "asshole",
  "bitch",
  "damn",
  "fuck",
  "fucker",
  "fucking",
  "gago",
  "gagi",
  "hindot",
  "leche",
  "lintik",
  "pakyu",
  "puta",
  "putang ina",
  "putangina",
  "shit",
  "shitty",
  "tarantado",
  "tanga",
  "ulol",
];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildPattern = (term) =>
  new RegExp(`\\b${escapeRegex(term).replace(/\\ /g, "\\s+")}\\b`, "gi");

const maskMatch = (match) => match.replace(/[A-Za-z]/g, "*");

const sanitizeProfanity = (value = "") => {
  let sanitizedText = value;
  let wasFiltered = false;

  for (const term of PROFANITY_TERMS) {
    sanitizedText = sanitizedText.replace(buildPattern(term), (match) => {
      wasFiltered = true;
      return maskMatch(match);
    });
  }

  return {
    sanitizedText,
    wasFiltered,
  };
};

module.exports = {
  sanitizeProfanity,
};
