import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import User from './components/user'
import Admin from './components/admin'

function App() {
  return (
    <div style={{ height: '100%' }}>
      <Router>
        <Route exact path='/'>
          <User />
        </Route>
        <Route exact path='/admin'>
          <Admin />
        </Route>
        <Route exact path='/admin/:uid'>
          <Admin />
        </Route>
      </Router>
    </div>
  )
}

export default App
