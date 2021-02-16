require('dotenv').config()

import axios from 'axios'
import bodyParser from 'body-parser'
import express, { static as serveStatic } from 'express'
import Klasifikasi from 'klasifikasi-js'
import path from 'path'

(async () => {
  const app = express()

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  app.get('/ping', (_, res) => res.send({ pong: true }))

  app.post('/api/send', async (req, res) => {
    const { token, user, tags } = req.body
    let gender: string | undefined = undefined
    if (!token || !user || !tags) {
      return res.status(400).send({ err: 'Bad request' })
    }

    const { data } = await axios.get('https://www.google.com/recaptcha/api/siteverify', {
      params: {
        secret: process.env.GOOGLE_SECRET_RECAPTCHA,
        response: token
      }
    })
    if (!data?.success) {
      return res.status(400).send({ err: 'Robot detected' })
    }

    if (user.gender === 'male') {
      gender = 'pria'
    } else if (user.gender === 'female') {
      gender = 'wanita'
    }
    const query = `${user.name || 'yang'}${gender ? ` ${gender}` : ''}${user.age ? ` usia ${user.age} tahun` : ''} lebih baik pilih?`
    console.log(query, tags)
    try {
      const data = await Klasifikasi.zslClassify(
        process.env.MODEL_ID as string, query, tags, true)
      const sentiment = await Klasifikasi.zslClassify(
        process.env.MODEL_ID as string, data.result[0].label, [
          'positif', 'negatif', 'netral'
        ], true)
      const depression = await Klasifikasi.zslClassify(
        process.env.MODEL_ID as string, data.result[0].label, [
          'depresi', 'normal'
        ], true)
      return res.send({ ...data, sentiment, depression })
    } catch (error) {
      console.error(error)
      return res.status(500).send({ err: error.toString() })
    }
  })

  app.use(serveStatic(path.join(__dirname, '..', 'build')))
  app.use((_, res) => res.sendFile(path.join(__dirname, '..', 'build', 'index.html')))

  app.listen('8999', () => console.log('running at :8999...'))

  if (process.env.CLIENT_ID && process.env.CLIENT_SECRET) {
    try {
      await Klasifikasi.build({
        creds: [
          {
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET
          }
        ]
      })
    } catch (error) {
      console.error(error)
    }
  }
})()