import { VoiceProfile } from "./types";

export const voiceProfiles: VoiceProfile[] = [
  {
    id: "v1",
    name: "Alex",
    gender: "male",
    age: "young",
    style: "excited",
    pitch: 55,
    stability: 70,
  },
  {
    id: "v2",
    name: "Sarah",
    gender: "female",
    age: "adult",
    style: "professional",
    pitch: 60,
    stability: 80,
  },
  {
    id: "v3",
    name: "Jordan",
    gender: "neutral",
    age: "adult",
    style: "calm",
    pitch: 50,
    stability: 85,
  },
  {
    id: "v4",
    name: "Maya",
    gender: "female",
    age: "young",
    style: "friendly",
    pitch: 65,
    stability: 75,
  },
  {
    id: "v5",
    name: "Marcus",
    gender: "male",
    age: "mature",
    style: "educational",
    pitch: 40,
    stability: 90,
  },
  {
    id: "v6",
    name: "Priya",
    gender: "female",
    age: "adult",
    style: "excited",
    pitch: 58,
    stability: 72,
  },
];

export function suggestVoices(
  perceivedGender?: "male" | "female" | "neutral",
  perceivedAge?: "young" | "adult" | "mature"
): VoiceProfile[] {
  let filtered = voiceProfiles;

  if (perceivedGender) {
    const genderMatch = filtered.filter((v) => v.gender === perceivedGender);
    if (genderMatch.length >= 3) filtered = genderMatch;
  }

  if (perceivedAge) {
    const ageMatch = filtered.filter((v) => v.age === perceivedAge);
    if (ageMatch.length >= 3) filtered = ageMatch;
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

  // Fill remaining slots if needed
  for (const v of filtered) {
    if (result.length >= 3) break;
    if (!result.includes(v)) result.push(v);
  }

  return result.slice(0, 3);
}
