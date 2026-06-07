'use strict'

const db = require('../db/index')

function toMins(t) {
  const p = t.split(':')
  return parseInt(p[0]) * 60 + parseInt(p[1])
}

function toHHMM(m) {
  if (m <= 0) return '0:00'
  return Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0')
}

function addMins(t, add) {
  const total = toMins(t) + add
  return String(Math.floor(total / 60) % 24).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0')
}

function calculate(actualStart, actualFinish, breakMins) {
  const totalBreak = Math.max(30, breakMins || 30)
  const extraBreak = totalBreak - 30

  // White window = 8h work + 30min eating break = 510 mins from actual start
  const WHITE_WINDOW = 510
  const workedMins = toMins(actualFinish) - toMins(actualStart)
  const hasFullWhite = workedMins >= WHITE_WINDOW

  const whiteStart = actualStart
  let whiteFinish, whiteHours, orangeStart, orangeFinish, orangeMins, orangeHours, totalHours

  if (hasFullWhite) {
    whiteFinish = addMins(actualStart, WHITE_WINDOW)
    whiteHours = '8:00'
    orangeStart = whiteFinish
    orangeFinish = actualFinish
    orangeMins = Math.max(0, toMins(actualFinish) - toMins(orangeStart) - extraBreak)
    orangeHours = toHHMM(orangeMins)
    totalHours = toHHMM(480 + orangeMins)
  } else {
    whiteFinish = actualFinish
    whiteHours = toHHMM(Math.max(0, workedMins - totalBreak))
    orangeStart = actualFinish
    orangeFinish = actualFinish
    orangeMins = 0
    orangeHours = '0:00'
    totalHours = whiteHours
  }

  return {
    white_start: whiteStart,
    white_finish: whiteFinish,
    white_hours: whiteHours,
    extra_break: toHHMM(extraBreak),
    orange_start: orangeStart,
    orange_finish: orangeFinish,
    orange_hours: orangeHours,
    orange_break: toHHMM(extraBreak),
    total_hours: totalHours
  }
}

module.exports = async function timesheetRoutes(fastify) {

  fastify.get('/api/timesheet/:month/:year', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { month, year } = request.params
    const result = await db.query(
      `SELECT * FROM timesheet_entries
       WHERE worker_id = $1
       AND EXTRACT(MONTH FROM entry_date) = $2
       AND EXTRACT(YEAR FROM entry_date) = $3
       ORDER BY entry_date ASC`,
      [request.user.id, month, year]
    )
    return reply.send({ entries: result.rows })
  })

  fastify.post('/api/timesheet/entry', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { entry_date, actual_start, actual_finish, what_work, break_mins } = request.body

    if (!entry_date || !actual_start || !actual_finish) {
      return reply.status(400).send({ error: 'Date, start time and finish time are required' })
    }

    const calc = calculate(actual_start, actual_finish, break_mins || 30)

    const result = await db.query(
      `INSERT INTO timesheet_entries
       (worker_id, entry_date, actual_start, actual_finish, what_work, break_mins,
        white_start, white_finish, white_hours,
        orange_start, orange_finish, orange_hours, total_hours)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (worker_id, entry_date)
       DO UPDATE SET
         actual_start = $3, actual_finish = $4, what_work = $5, break_mins = $6,
         white_start = $7, white_finish = $8, white_hours = $9,
         orange_start = $10, orange_finish = $11, orange_hours = $12,
         total_hours = $13, updated_at = now()
       RETURNING *`,
      [
        request.user.id, entry_date, actual_start, actual_finish,
        what_work || '', break_mins || 30,
        calc.white_start, calc.white_finish, calc.white_hours,
        calc.orange_start, calc.orange_finish, calc.orange_hours, calc.total_hours
      ]
    )

    return reply.send({ entry: result.rows[0] })
  })

  fastify.patch('/api/timesheet/entry/:date/field', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    const { field, value } = request.body
    const dateStr = request.params.date.split('T')[0]

    const allowed = [
      'white_start', 'white_finish', 'white_hours',
      'orange_start', 'orange_finish', 'orange_hours',
      'total_hours', 'what_work', 'actual_start', 'actual_finish'
    ]

    if (!allowed.includes(field)) {
      return reply.status(400).send({ error: 'Field not allowed' })
    }

    await db.query(
      `UPDATE timesheet_entries SET ${field} = $1, updated_at = now()
       WHERE worker_id = $2 AND entry_date::date = $3::date`,
      [value, request.user.id, dateStr]
    )

    return reply.send({ success: true })
  })

  fastify.delete('/api/timesheet/entry/:date', {
    onRequest: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const dateStr = request.params.date.split('T')[0]
      console.log('DELETE entry:', { worker_id: request.user.id, dateStr })
      const result = await db.query(
        'DELETE FROM timesheet_entries WHERE worker_id = $1 AND entry_date::date = $2::date',
        [request.user.id, dateStr]
      )
      console.log('DELETE result:', result.rowCount)
      return reply.send({ success: true })
    } catch (err) {
      console.error('DELETE error:', err.message)
      return reply.status(500).send({ error: err.message })
    }
  })

}