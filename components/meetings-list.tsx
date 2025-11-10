import { Meeting, User } from "@/lib/types";
import { useEffect, useState } from "react";

type MeetingsListProps = {
  user: User;
};

export default function MeetingsList({ user }: MeetingsListProps) {
  const [meetings, setMeetings] = useState<string[]>([]);
  useEffect(() => {
    const fetchMeetings = async () => {
      const response = await fetch(`/api/meetings?userId=${user.id}`).then(
        (res) => res.json()
      );
      const meetingsTitles = response.map(
        (meeting: unknown) => (meeting as Meeting).title
      );
      setMeetings(meetingsTitles);
    };
    fetchMeetings();
  }, [user.id]);

  if (meetings.length === 0) {
    return <div className="h-full">No meetings found for {user.name}</div>;
  }

  return (
    <div className="h-full">
      Meetings List for {user.name ? user.name : "Unknown User"}
      <ul>
        {meetings.map((meetingTitle, index) => (
          <li key={index}>{meetingTitle}</li>
        ))}
      </ul>
    </div>
  );
}
