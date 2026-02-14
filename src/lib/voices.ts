import { VoiceProfile, IndianLanguage } from "./types";

export const voiceProfiles: VoiceProfile[] = [
  {
    id: "v1",
    name: "Arjun",
    gender: "male",
    age: "young",
    style: "excited",
    language: "Hindi",
    pitch: 55,
    stability: 70,
  },
  {
    id: "v2",
    name: "Meera",
    gender: "female",
    age: "adult",
    style: "professional",
    language: "Hindi",
    pitch: 60,
    stability: 80,
  },
  {
    id: "v3",
    name: "Karthik",
    gender: "male",
    age: "adult",
    style: "educational",
    language: "Tamil",
    pitch: 48,
    stability: 88,
  },
  {
    id: "v4",
    name: "Ananya",
    gender: "female",
    age: "young",
    style: "friendly",
    language: "Telugu",
    pitch: 62,
    stability: 75,
  },
  {
    id: "v5",
    name: "Debashish",
    gender: "male",
    age: "mature",
    style: "calm",
    language: "Bengali",
    pitch: 40,
    stability: 90,
  },
  {
    id: "v6",
    name: "Priya",
    gender: "female",
    age: "adult",
    style: "excited",
    language: "Marathi",
    pitch: 58,
    stability: 72,
  },
  {
    id: "v7",
    name: "Naveen",
    gender: "male",
    age: "young",
    style: "professional",
    language: "Kannada",
    pitch: 52,
    stability: 82,
  },
  {
    id: "v8",
    name: "Lakshmi",
    gender: "female",
    age: "mature",
    style: "educational",
    language: "Malayalam",
    pitch: 55,
    stability: 86,
  },
  {
    id: "v9",
    name: "Riya",
    gender: "female",
    age: "young",
    style: "excited",
    language: "Gujarati",
    pitch: 64,
    stability: 68,
  },
  {
    id: "v10",
    name: "Vikram",
    gender: "male",
    age: "adult",
    style: "calm",
    language: "Hindi",
    pitch: 45,
    stability: 92,
  },
  {
    id: "v11",
    name: "Divya",
    gender: "female",
    age: "adult",
    style: "friendly",
    language: "Tamil",
    pitch: 58,
    stability: 78,
  },
  {
    id: "v12",
    name: "Suresh",
    gender: "male",
    age: "mature",
    style: "professional",
    language: "Telugu",
    pitch: 42,
    stability: 88,
  },
];

export const indianLanguages: IndianLanguage[] = [
  "Hindi",
  "Tamil",
  "Telugu",
  "Bengali",
  "Marathi",
  "Kannada",
  "Malayalam",
  "Gujarati",
];

export function suggestVoices(
  perceivedGender?: "male" | "female" | "neutral",
  perceivedAge?: "young" | "adult" | "mature",
  language?: IndianLanguage
): VoiceProfile[] {
  let filtered = voiceProfiles;

  if (language) {
    const langMatch = filtered.filter((v) => v.language === language);
    if (langMatch.length >= 1) filtered = langMatch;
  }

  if (perceivedGender) {
    const genderMatch = filtered.filter((v) => v.gender === perceivedGender);
    if (genderMatch.length >= 2) filtered = genderMatch;
  }

  if (perceivedAge) {
    const ageMatch = filtered.filter((v) => v.age === perceivedAge);
    if (ageMatch.length >= 2) filtered = ageMatch;
  }

  // Return top 3 with diverse styles
  const styles = new Set<string>();
  const result: VoiceProfile[] = [];
  for (const v of filtered) {
    if (!styles.has(v.style) && result.length < 3) {
      styles.add(v.style);
      result.push(v);
    }
  }

  // Fill remaining slots
  for (const v of filtered) {
    if (result.length >= 3) break;
    if (!result.includes(v)) result.push(v);
  }

  return result.slice(0, 3);
}
