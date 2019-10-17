require('dotenv/config');
const express = require('express');
const faker = require('faker');
const axios = require('axios');
const cors = require('cors');

const PORT = 4000;
const app = express();
app.use(cors());

const headers = {
  appid: process.env.REACT_APP_COMETCHAT_APP_ID,
  apikey: process.env.REACT_APP_COMETCHAT_API_KEY,
  'content-type': 'application/json',
  accept: 'application/json'
};

async function createClient(newClient) {
  try {
    const response = await axios.post(
      'https://api.cometchat.com/v1.8/users',
      JSON.stringify(newClient),
      { headers }
    );
    const uid = await response.data.data.uid;
    const authClient = await createAuthToken(uid);
    return authClient;
  } catch (err) {
    console.log({ err });
  }
}

async function createAuthToken(uid) {
  try {
    const response = await axios.post(
      `https://api.cometchat.com/v1.8/users/${uid}/auth_tokens`,
      null,
      { headers }
    );
    return response.data.data;
  } catch (err) {
    console.log({ err });
  }
}

app.get('/api/create-client', async (req, res) => {
  const newClient = {
    uid: faker.random.uuid(),
    name: faker.name.firstName()
  };

  const client = await createClient(newClient);
  res.status(200).json({ client });
});

app.get('/api/auth-user', async (req, res) => {
  const uid = req.query.uid;
  const user = await createAuthToken(uid);
  res.status(200).json({ user });
});

app.get('/api/get-clients', async (req, res) => {
  try {
    const response = await axios.get('https://api.cometchat.com/v1.8/users', {
      headers
    });

    const clients = await response.data.data.filter(c => c.uid !== 'admin');
    res.status(200).json({ clients });
  } catch (err) {
    console.log({ err });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
