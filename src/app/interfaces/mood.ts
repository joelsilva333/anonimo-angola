export interface MoodTimelineEntry {
  date: string;
  mood: string;
}

export interface MoodTrackerResponse {
  timeline: MoodTimelineEntry[];
  moodCounts: Record<string, number>;
  summary: string;
  suggestions: string[];
}
