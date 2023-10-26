import { client } from './config/prismicConfig.js'
import * as prismic from '@prismicio/client'
import dotenv from 'dotenv'
import express from 'express'
import * as path from 'path'

dotenv.config()
const app = express()
const port = 3000
const currentFilePath = new URL(import.meta.url).pathname;
const currentDirectory = path.dirname(currentFilePath);

app.use((req, res, next) => {
  res.locals.ctx = {
    prismic
  }
  next()
})

app.set('views', path.join(currentDirectory, 'views'))
app.set('view engine', 'pug')

app.get('/', async (req, res) => {
  const document = await client.getFirst()
  res.render('pages/home', { document })
})

app.get('/about', (req, res) => {
  res.render('pages/about')
})

app.get('/collections', (req, res) => {
  res.render('pages/collections')
})

app.get('/detail/:uid', (req, res) => {
  res.render('pages/detail')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
