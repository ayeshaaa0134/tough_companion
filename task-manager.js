// src/task-manager.js

import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { format } from "date-fns";

// Load environment variables
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.REACT_APP_GOOGLE_REDIRECT_URI;

// Initialize OAuth2Client
const oauth2Client = new OAuth2Client(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

// Create a task event in Google Calendar
export const createTaskEvent = async (taskTitle, taskDateTime) => {
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const event = {
    summary: taskTitle,
    start: {
      dateTime: taskDateTime,
      timeZone: "America/New_York",
    },
    end: {
      dateTime: new Date(new Date(taskDateTime).getTime() + 3600000), // 1-hour duration
      timeZone: "America/New_York",
    },
  };

  const res = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event,
  });

  return res.data;
};

// Reschedule a missed task
export const rescheduleTask = async (taskId, newDateTime) => {
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const event = await calendar.events.get({
    calendarId: "primary",
    eventId: taskId,
  });

  event.data.start.dateTime = newDateTime;
  event.data.end.dateTime = new Date(
    new Date(newDateTime).getTime() + 3600000
  );

  const res = await calendar.events.update({
    calendarId: "primary",
    eventId: taskId,
    requestBody: event.data,
  });

  return res.data;
};

// Fetch upcoming tasks
export const fetchTasks = async () => {
  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: "startTime",
  });

  return res.data.items;
};
