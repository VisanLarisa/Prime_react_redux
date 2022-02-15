import { combineReducers } from 'redux'
import article from './article-reducer'
import reference from './reference-rerducer'

export default combineReducers({
  article, reference
})