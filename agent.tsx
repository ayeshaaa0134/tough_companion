// src/agent.tsx

import React, { useState, useEffect } from "react";
import { Agent } from "react-agents";
import {
  createTaskEvent,
  fetchTasks,
  rescheduleTask,
} from "./task-manager";

export default function StudyPlannerAgent() {
  const [tasks, setTasks] = useState([]);
  const [response, setResponse] = useState("");

  useEffect(() => {
    const loadTasks = async () => {
      const taskList = await fetchTasks();
      setTasks(taskList);
    };
    loadTasks();
  }, []);

  const handleAction = async (action, taskDetails) => {
    try {
      if (action === "createTask") {
        const { title, dateTime } = taskDetails;
        const newTask = await createTaskEvent(title, dateTime);
        setResponse(`Task created: ${newTask.summary}`);
        setTasks([...tasks, newTask]);
      } else if (action === "rescheduleTask") {
        const { taskId, newDateTime } = taskDetails;
        const updatedTask = await rescheduleTask(taskId, newDateTime);
        setResponse(`Task rescheduled: ${updatedTask.summary}`);
        setTasks(
          tasks.map((task) => (task.id === taskId ? updatedTask : task))
        );
      }
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    }
  };

  return (
    <Agent
      name="Study Planner Agent"
      actions={[
        {
          label: "Create Task",
          action: () =>
            handleAction("createTask", {
              title: "Study Math",
              dateTime: new Date().toISOString(),
            }),
        },
        {
          label: "Reschedule Task",
          action: () =>
            handleAction("rescheduleTask", {
              taskId: "example-task-id",
              newDateTime: new Date().toISOString(),
            }),
        },
      ]}
    >
      <div>
        <h3>Task List:</h3>
        <ul>
          {tasks.map((task, index) => (
            <li key={index}>
              {task.summary} - {task.start.dateTime}
            </li>
          ))}
        </ul>
        <p>{response}</p>
      </div>
    </Agent>
  );
}
