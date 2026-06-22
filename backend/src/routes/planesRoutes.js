const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const {
  getPlanes,
  createPlan,
  updatePlan,
  deletePlan
} = require('../controllers/planesController')

router.get('/',       auth, getPlanes)
router.post('/',      auth, createPlan)
router.put('/:id',    auth, updatePlan)
router.delete('/:id', auth, deletePlan)

module.exports = router
