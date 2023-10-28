import { client } from './config/prismicConfig.js'
import * as prismic from '@prismicio/client'
import dotenv from 'dotenv'
import express from 'express'
import * as path from 'path'

dotenv.config()
const app = express()
const port = process.env.PORT
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


app.get('*', async (req, res, next) => {
  const meta = await client.getSingle('meta')
  res.locals.meta = { ...meta }
  next()
})

app.get('/', async (req, res) => {
  res.render('pages/home')
})

app.get('/about', async (req, res) => {
  const about = await client.getSingle('about')
  res.render('pages/about', { about })
})

app.get('/collections', (req, res) => {
  res.render('pages/collections')
})

app.get('/detail/:uid', async (req, res) => {
  const uid = req.params.uid
  const product = await client.getByUID('product', uid, {
    fetchLinks: 'collection.title'
  })
  console.log("product:", product.data.informations)
  res.render('pages/detail', { product })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
