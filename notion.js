import { Client } from '@notionhq/client'
import dotenv from 'dotenv'
import fs from 'node:fs'

dotenv.config()

const notionToken = await JSON.parse(fs.readFileSync(process.env.NOTION_TOKEN))
const notion = new Client({ auth: notionToken.token })

async function getTasks (databaseId) {
  const dbItems = await notion.databases.query({ database_id: databaseId })

  const tasks = dbItems.results.map((item) => {
    return {
      id: item.id,
      title: item.properties.Name.title[0].plain_text,
      notes: item.properties.Notes.rich_text[0].plain_text,
      start: item.properties.Date.date.start,
      end: item.properties.Date.date.end,
      eventId: item.properties.eventId.rich_text[0].plain_text
    }
  })

  return tasks
}

async function createTask (params) {
  const filterTask = await notion.databases.query({
    database_id: params.databaseId,
    filter: { and: [{
      property: 'eventId',
      rich_text: { equals: params.eventId }
    }] }
  })
  const taskExists = filterTask.results.length > 0
  if (taskExists) {
    const title = params
      .title
      .substr(
        0,
        25
      )
    console.log(`task ${title}... already exists`)
    return
  }

  console.log(`new task will be created: ${params}`)
  const response = await notion.pages.create({
    parent: { database_id: params.databaseId },
    properties: {
      Name: { title: [
        { text: { content: params.title } }
      ] },
      Notes: { rich_text: [
        { text: { content: params.notes } }
      ] },
      Date: { date: {
        start: params.start,
        end: params.end
      } },
      eventId: { rich_text: [
        { text: { content: params.eventId } }
      ] }
    }
  })
  if (response.url) console.log(`task ${params.title} created at ${response.url}`)
}

async function createTasks (
  tasks, databaseId
) {
  for (let index = 0; index < tasks.length; index++) {
    const task = tasks[index]

    const params = {
      databaseId,
      title: task.summary,
      notes: task.description || '',
      start: task.start.dateTime,
      end: task.end.dateTime,
      eventId: task.id
    }

    await createTask(params)
  }
}

export default {
  getTasks, createTask, createTasks
}
