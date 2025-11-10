import { MeetingState } from "@/lib/types";
import { create } from "zustand";

export const useMeetingStore = create<MeetingState>((set) => ({
  meetingId: null,
  initialQuestion: null,

  setMeetingDetails: (details) =>
    set({
      meetingId: details.meetingId,
      initialQuestion: details.initialQuestion,
    }),

  clearMeetingDetails: () =>
    set({
      meetingId: null,
      initialQuestion: null,
    }),
}));
