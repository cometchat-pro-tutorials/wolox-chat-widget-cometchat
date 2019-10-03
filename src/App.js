import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import Client from './components/client'
import Admin from './components/admin'

function App() {
  return (
    <div className='container' style={{ height: '100%' }}>
      <Router>
        <Route exact path='/'>
          <Client />
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
