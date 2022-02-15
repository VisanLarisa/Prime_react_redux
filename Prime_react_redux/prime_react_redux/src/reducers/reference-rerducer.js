//needed for store; singura chestie e ca daca nu am case-urile astea, nu se conecteaza la baza de date, ele fiind implementate in redux-promise-middleware - importat in store

const INITIAL_STATE = {
    referenceList: [],
    count: 0,
    error: null,
    fetching: false,
    fetched: false
  }
  
  export default function reducer (state = INITIAL_STATE, action) {
    switch (action.type) {
      case 'GET_REFERENCES_PENDING':
      case 'ADD_REFERENCE_PENDING':
      case 'SAVE_REFERENCE_PENDING':
      case 'DELETE_REFERENCE_PENDING':
        return { ...state, error: null, fetching: true, fetched: false }
      case 'GET_REFERENCES_FULFILLED':
      case 'ADD_REFERENCE_FULFILLED':
      case 'SAVE_REFERENCE_FULFILLED':
      case 'DELETE_REFERENCE_FULFILLED':
        return { ...state, referenceList: action.payload.records, count: action.payload.count, error: null, fetching: false, fetched: true }
      case 'GET_REFERENCES_REJECTED':
      case 'ADD_REFERENCE_REJECTED':
      case 'SAVE_REFERENCE_REJECTED':
      case 'DELETE_REFERENCE_REJECTED':
        return { ...state, referenceList: [], error: action.payload, fetching: false, fetched: true }
      default:
        return state
    }
  }