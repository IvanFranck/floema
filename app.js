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
  console.log(doc)


  return '/'
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
  const meta = await client.getSingle('meta')
  const preloader = await client.getSingle('preloader')
  const home = await client.getSingle('home')
  const collections = await client.getAllByType('collection')
  res.render('pages/home', { preloader, meta, home, collections })
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
