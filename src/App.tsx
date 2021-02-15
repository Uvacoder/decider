import { Layout } from 'antd'
import 'antd/dist/antd.css'
import React from 'react'
import { Route, Switch } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import Start from './pages/Start'

function App(): any {
  return (
    <Layout className="App">
      <Switch>
        <Route path="/start" exact component={Start} />
        <Route path="/" exact component={Home} />
      </Switch>
    </Layout>
  )
}

export default App