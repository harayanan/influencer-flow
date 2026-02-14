export interface MusicTrack {
  id: string;
  name: string;
  mood: string;
  duration: number;
  bpm: number;
}

export const musicTracks: MusicTrack[] = [
  { id: "m1", name: "Upbeat Energy", mood: "excited", duration: 90, bpm: 128 },
  { id: "m2", name: "Calm Focus", mood: "calm", duration: 90, bpm: 80 },
  { id: "m3", name: "Corporate Clean", mood: "professional", duration: 90, bpm: 100 },
  { id: "m4", name: "Warm & Friendly", mood: "friendly", duration: 90, bpm: 96 },
  { id: "m5", name: "Inspiring Rise", mood: "educational", duration: 90, bpm: 110 },
  { id: "m6", name: "Lo-Fi Chill", mood: "calm", duration: 90, bpm: 72 },
];

export function suggestMusic(sentiment: string): MusicTrack {
  const match = musicTracks.find((t) => t.mood === sentiment);
  return match || musicTracks[0];
}
