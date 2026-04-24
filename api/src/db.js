const sql = require('mssql')

async function getPool() {
  return sql.connect(process.env.SQL_CONNECTION_STRING)
}

function parseChampion(row) {
  if (!row) return null
  return {
    ...row,
    workload_ids: row.workload_ids ? JSON.parse(row.workload_ids) : [],
    submitted_at: row.submitted_at instanceof Date
      ? row.submitted_at.toISOString()
      : row.submitted_at,
  }
}

module.exports = { getPool, sql, parseChampion }
