export interface FlyingRecord {
  id: string;
  pigeonId: string;

  date: string; // YYYY-MM-DD

  eventName?: string;

  flightDurationMinutes?: number;

  result?: string;

  weather?: string;
  notes?: string;

  createdAt?: string;
}
