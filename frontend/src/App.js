import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import User from './components/user'
import Admin from './components/admin'

function App() {
  return (
    <Router>
      <Route exact path='/' component={User} />
      <Route exact path='/admin' component={Admin} />
      <Route exact path='/admin/:uid' component={Admin} />
    </Router>
  )
}

export default App
