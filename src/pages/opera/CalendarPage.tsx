import {PageWrapper} from "@/components/layout/PageWrapper";
import {CalendarView} from "@/components/opera/CalendarView";
import {useNavigate} from "react-router-dom";

export default function CalendarPage() {
  const navigate = useNavigate();

  // Mock events - replace with actual data
  const events = [
    {
      id: 1,
      date: new Date(),
      type: "check-in" as const,
      title: "John Doe - Room 205",
      room: "205",
      guest: "John Doe",
    },
    {
      id: 2,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      type: "check-out" as const,
      title: "Jane Smith - Room 301",
      room: "301",
      guest: "Jane Smith",
    },
  ];

  return (
    <PageWrapper
      title="Calendar View"
      subtitle="Reservation calendar and schedule management"
    >
      <CalendarView
        events={events}
        onDateClick={(date) => {
          console.log("Date clicked:", date);
        }}
        onEventClick={(event) => {
          console.log("Event clicked:", event);
        }}
        onCreateReservation={() => {
          // Calendar events are now read-only
          console.log("Create event functionality removed");
        }}
      />
    </PageWrapper>
  );
}

