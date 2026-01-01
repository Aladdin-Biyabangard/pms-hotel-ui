import {PageWrapper} from "@/components/layout/PageWrapper";
import {HousekeepingBoard} from "@/components/opera/HousekeepingBoard";

export default function HousekeepingPage() {
  // Mock room statuses - replace with actual data
  const rooms = [
    {
      roomNumber: "101",
      status: "clean" as const,
      housekeeper: "Staff A",
      lastUpdated: "2 hours ago",
    },
    {
      roomNumber: "102",
      status: "dirty" as const,
      priority: "high" as const,
      lastUpdated: "30 minutes ago",
    },
    {
      roomNumber: "205",
      status: "inspected" as const,
      housekeeper: "Staff B",
      lastUpdated: "1 hour ago",
    },
    {
      roomNumber: "301",
      status: "maintenance" as const,
      notes: "AC repair needed",
      priority: "urgent" as const,
    },
  ];

  return (
    <PageWrapper
      title="Housekeeping Board"
      subtitle="Room status and housekeeping management"
    >
      <HousekeepingBoard
        rooms={rooms}
        onStatusChange={(roomNumber, status) => {
          console.log(`Room ${roomNumber} status changed to ${status}`);
        }}
        onRefresh={() => {
          console.log("Refreshing housekeeping board");
        }}
      />
    </PageWrapper>
  );
}

