const express = require('express')
const path = require('path')
const { getFilterPreviewFn } = require('./util')
const { DS_PRV_KEY, DS_SINGLE_PRV_KEY } = require('../constants')
const { getPreviewsHandler } = require('./getPreviews')
const { transformPreviews } = require('./transformPreviews')
const { getSinglePreview } = require('./getSinglePreview')

const router = express.Router()

router.use('/data/receptor', express.static(
  path.join(__dirname, '../data/receptor')
))

router.use('/getImagePipe', require('./getImagePipe'))

router.get('/:datasetId/:filename', getPreviewsHandler, transformPreviews, getSinglePreview, (req, res) => {
  const singlePrev = res.locals[DS_SINGLE_PRV_KEY]
  if (!singlePrev) res.status(404).end()
  else res.status(200).json(singlePrev)
})

router.get('/:datasetId', getPreviewsHandler, transformPreviews, (req, res) => {
  const { filterBy } = req.query

  let parsedFilterBy
  try {
    parsedFilterBy = filterBy && JSON.parse(filterBy)
  } catch (e) {
    return res.status(400).send(`filterBy needs to be URL encoded array of strings`)
  }

  const r = res.locals[DS_PRV_KEY]
  if (!r) return res.status(404).end()

  if (!filterBy) return res.status(200).json(r)
  res.status(200).json(
    r.filter(getFilterPreviewFn(parsedFilterBy))
  )
})

router.get('/', (req, res) => {
  res.status(200).json(list)
})

module.exports = router