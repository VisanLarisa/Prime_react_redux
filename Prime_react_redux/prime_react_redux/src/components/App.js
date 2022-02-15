import ArticleList from './ArticleList'
import ReferenceList from './ReferenceList';
import {BrowserRouter, Routes, Route, Switch} from 'react-router-dom';


function App () {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<ArticleList />} />
          <Route path="articles" element={<ArticleList />} />
          <Route path="articles/:id" element={<ReferenceList />} />
        </Routes>
      </BrowserRouter>
  
    </div>
  )
}

export default App