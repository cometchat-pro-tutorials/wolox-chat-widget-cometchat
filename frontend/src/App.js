import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import User from './components/user'
import AdminHome from './components/admin-home'

function App() {
  return (
    <div style={{ height: '100%' }}>
      <Router>
        <Route exact path='/'>
          <User />
        </Route>
        <Route exact path='/admin'>
          <AdminHome />
        </Route>
        <Route exact path='/admin/:uid'>
          <AdminHome />
        </Route>
      </Router>
    </div>
  )
}

export default App
