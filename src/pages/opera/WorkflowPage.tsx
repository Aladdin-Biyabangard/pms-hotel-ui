import {PageWrapper} from "@/components/layout/PageWrapper";
import {WorkflowQueue} from "@/components/opera/WorkflowQueue";
import {useNavigate} from "react-router-dom";

export default function WorkflowPage() {
  const navigate = useNavigate();

  // Mock tasks - replace with actual data
  const tasks = [
    {
      id: 1,
      type: "check-in" as const,
      title: "Check-in: Room 205",
      description: "Guest: John Doe - Arrival 14:00",
      priority: "high" as const,
      status: "pending" as const,
      room: "205",
      guest: "John Doe",
      dueTime: "14:00",
    },
    {
      id: 2,
      type: "housekeeping" as const,
      title: "Housekeeping: Room 301",
      description: "Room cleaning required",
      priority: "medium" as const,
      status: "in-progress" as const,
      room: "301",
      assignedTo: "Staff Member",
      dueTime: "15:00",
    },
    {
      id: 3,
      type: "check-out" as const,
      title: "Check-out: Room 102",
      description: "Guest: Jane Smith - Departure 11:00",
      priority: "urgent" as const,
      status: "pending" as const,
      room: "102",
      guest: "Jane Smith",
      dueTime: "11:00",
    },
  ];

  return (
    <PageWrapper
      title="Workflow Queue"
      subtitle="Manage tasks and operational workflows"
    >
      <WorkflowQueue
        tasks={tasks}
        onTaskClick={(task) => {
          if (task.type === "check-in" || task.type === "check-out") {
            navigate("/check-in-out");
          } else if (task.room) {
            navigate(`/rooms?room=${task.room}`);
          }
        }}
        onTaskComplete={(taskId) => {
          console.log("Task completed:", taskId);
        }}
      />
    </PageWrapper>
  );
}

