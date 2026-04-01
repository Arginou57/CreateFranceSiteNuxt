import { defineEventHandler } from 'h3'
import { getPlayerHistory } from '../utils/playerHistory'

export default defineEventHandler(() => {
  return getPlayerHistory()
})
