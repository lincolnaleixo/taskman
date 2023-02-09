import dotenv from 'dotenv'
import { OAuth2Client } from 'google-auth-library'
import { google } from 'googleapis'
import fs from 'node:fs'

dotenv.config()

const clientSecret = await JSON.parse(fs.readFileSync(process.env.GOOGLE_OAUTH_KEYS))
const googleToken = await JSON.parse(fs.readFileSync(process.env.GOOGLE_TOKEN))

const oauth2Client = new OAuth2Client(
  clientSecret.web.client_id,
  clientSecret.web.client_secret,
  clientSecret.web.redirect_uris[0]
)

oauth2Client.setCredentials({
  access_token: googleToken.access_token,
  refresh_token: googleToken.refresh_token
})

const calendar = google.calendar({
  version: 'v3',
  auth: oauth2Client
})

async function getCalendarEvents (
  calendarId, date
) {
  const calendarEvents = await calendar.events.list({
    calendarId,
    timeMin: `${date}T00:00:00Z`,
    timeMax: `${date}T23:59:59Z`,
    maxResults: 1000,
    singleEvents: true,
    orderBy: 'startTime',
    creator: process.env.GOOGLE_EVENTS_EMAIL_CREATOR
  })
  return calendarEvents
    .data
    .items
    .filter(event => event.creator.email === process.env.GOOGLE_EVENTS_EMAIL_CREATOR)
}

export default { getCalendarEvents }
