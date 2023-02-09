import dotenv from 'dotenv'
import calendar from './calendar.js'
import notion from './notion.js'

dotenv.config()

const date = new Date()
  .toISOString()
  .split('T')[0]

const tasks = await calendar.getCalendarEvents(
  process.env.GOOGLE_CALENDAR_ID,
  date
)
await notion.createTasks(
  tasks,
  process.env.NOTION_DATABASE_ID
)
