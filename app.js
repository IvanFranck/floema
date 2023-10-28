import { client } from './config/prismicConfig.js'
import * as prismic from '@prismicio/client'
import dotenv from 'dotenv'
import express from 'express'
import * as path from 'path'
import logger from "morgan"
import errorHandler from 'errorhandler'
import bodyParser from 'body-parser'
import methodOverride from "method-override"

dotenv.config()
const app = express()
const port = process.env.PORT
const currentFilePath = new URL(import.meta.url).pathname;
const currentDirectory = path.dirname(currentFilePath);

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(methodOverride)
app.use(errorHandler())

app.use((req, res, next) => {
  res.locals.ctx = {
    prismic
  }
  res.locals.Numbers = index => {
    return index === 0 ? 'One' : index === 1 ? 'Two' : index === 2 ? 'Three' : index === 3 ? 'Four' : ''
  }
  next()
})

app.set('views', path.join(currentDirectory, 'views'))
app.set('view engine', 'pug')

app.get('/', async (req, res) => {
  const meta = await client.getSingle('meta')
  const preloader = await client.getSingle('preloader')
  res.render('pages/home', { preloader, meta })
})

app.get('/about', async (req, res) => {
  const meta = await client.getSingle('meta')
  const about = await client.getSingle('about')
  const preloader = await client.getSingle('preloader')
  res.render('pages/about', { about, preloader, meta })
})

app.get('/collections', async (req, res) => {
  const home = await client.getSingle('home')
  const preloader = await client.getSingle('preloader')
  const meta = await client.getSingle('meta')

  const collections = await client.getAllByType('collection', {
    fetchLinks: 'product.image'
  })
  // console.log("preloader", preloader)
  // console.log(collections[0].data)
  res.render('pages/collections', { collections, home, preloader, meta })
})

app.get('/detail/:uid', async (req, res) => {
  const uid = req.params.uid
  const product = await client.getByUID('product', uid, {
    fetchLinks: 'collection.title'
  })
  const meta = await client.getSingle('meta')
  const preloader = await client.getSingle('preloader')
  res.render('pages/detail', { product, preloader, meta })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
