require('dotenv/config')
const express = require('express')
const uuidv4 = require('uuid/v4')
const axios = require('axios')
const cors = require('cors')

const PORT = process.env.PORT || 4000
const app = express()
app.use(cors())

const headers = {
  appid: process.env.COMETCHAT_APP_ID,
  apikey: process.env.COMETCHAT_API_KEY,
  'content-type': 'application/json',
  accept: 'application/json'
}
const adminUID = 'admin'
const baseUrl = 'https://api-eu.cometchat.io/v2.0/users'

app.get('/api/create-user', async (_, res) => {
  const randomUUID = uuidv4()
  const newUser = {
    uid: randomUUID,
    name: randomUUID
  }
  try {
    const response = await axios.post(baseUrl, JSON.stringify(newUser), {
      headers
    })
    const uid = await response.data.data.uid
    const user = await createAuthToken(uid)
    res.status(200).json({ user })
  } catch (err) {
    console.log({ 'create user error': err })
  }
})

async function createAuthToken(uid) {
  try {
    const response = await axios.post(`${baseUrl}/${uid}/auth_tokens`, null, {
      headers
    })
    const authenticatedUser = response.data.data
    return authenticatedUser
  } catch (err) {
    console.log({ 'create auth token error': err })
  }
}

app.get('/api/authenticate-user', async (req, res) => {
  const uid = await req.query.uid
  const user = await createAuthToken(uid)
  res.status(200).json({ user })
})

app.get('/api/get-users', async (_, res) => {
  try {
    const response = await axios.get(baseUrl, {
      headers
    })
    const users = await response.data.data.filter(user => user.uid !== adminUID)
    res.status(200).json({ users })
  } catch (err) {
    console.log({ 'get users error': err })
  }
})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
