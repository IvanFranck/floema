import { client } from './config/prismicConfig.js'
import * as prismic from '@prismicio/client'
import dotenv from 'dotenv'
import express from 'express'
import * as path from 'path'
import logger from 'morgan'
import errorHandler from 'errorhandler'
import bodyParser from 'body-parser'

dotenv.config()
const app = express()
const port = process.env.PORT
const currentFilePath = new URL(import.meta.url).pathname
const currentDirectory = path.dirname(currentFilePath)

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(errorHandler())

const handleLinkResolver = (doc) => {
  if (doc.type === 'product') {
    return `/detail/${doc.slug}`
  }

  if (doc.type === 'about')
    return '/about'

  if (doc.type === 'collections')
    return '/collections'

  return '/'
}

const handleRequest = async () => {
  const meta = await client.getSingle('meta')
  const preloader = await client.getSingle('preloader')
  const navigation = await client.getSingle('navigation')

  return {
    meta,
    preloader,
    navigation
  }
}

app.use((req, res, next) => {
  //register prismic in the locals ctx object
  res.locals.ctx = {
    prismic
  }

  // register the Collection's numbers resolver function in the locals object
  res.locals.Numbers = index => {
    return index === 0 ? 'One' : index === 1 ? 'Two' : index === 2 ? 'Three' : index === 3 ? 'Four' : ''
  }

  // register link resolver function in the locals object
  res.locals.Link = handleLinkResolver
  next()
})

app.set('views', path.join(currentDirectory, 'views'))
app.set('view engine', 'pug')

app.get('/', async (req, res) => {
  const defaults = await handleRequest()
  const home = await client.getSingle('home')
  const collections = await client.getAllByType('collection')

  res.render('pages/home', { ...defaults, home, collections })
})

app.get('/about', async (req, res) => {
  const defaults = await handleRequest()

  const about = await client.getSingle('about')
  res.render('pages/about', { about, ...defaults })
})

app.get('/collections', async (req, res) => {
  const defaults = await handleRequest()

  const home = await client.getSingle('home')
  const collections = await client.getAllByType('collection', {
    fetchLinks: 'product.image'
  })
  res.render('pages/collections', { collections, home, ...defaults })
})

app.get('/detail/:uid', async (req, res) => {
  const uid = req.params.uid
  const defaults = await handleRequest()
  const product = await client.getByUID('product', uid, {
    fetchLinks: 'collection.title'
  })
  res.render('pages/detail', { product, ...defaults })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
