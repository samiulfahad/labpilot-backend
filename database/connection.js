const { MongoClient } = require("mongodb")

const url = "mongodb://127.0.0.1:27017"
const dbName = "labpilot"

let client = null
async function connect() {
  try {
    if (!client) {
      client = new MongoClient(url, {
        connectTimeoutMS: 10000,
        minPoolSize: 5,
        maxPoolSize: 100,
      })
      await client.connect()
      console.log("Database Connection opened")
    }
    return client.db(dbName)
  } catch (err) {
    throw new Error(`Error connecting to the database: ${err}`)
  }
}

function getClient() {
  if (client && client.topology && client.topology.isConnected()) {
    return client.db(dbName)
  } else {
    throw new Error("No active database client. Please connect to the database first.")
  }
}

function close() {
  if (client) {
    client.close()
    console.log("Database Connection Closed")
    client = null
  }
}

module.exports = { connect, getClient, close }
