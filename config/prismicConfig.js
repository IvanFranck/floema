
import fetch from 'node-fetch'
import * as prismic from '@prismicio/client'
import dotenv from 'dotenv'
dotenv.config()

const repoName = 'ivan-floema'
const accessToken = process.env.PRISMIC_ACCESS_TOKEN

// The `routes` property is your route resolver. It defines how you will
// structure URLs in your project. Update the types to match the Custom
// Types in your project, and edit the paths to match the routing in your
// project.
const routes = [
  {
    type: 'preloader',
    path: '/:uid'
  }
]

export const client = prismic.createClient(repoName, {
  fetch,
  accessToken,
  routes
})
