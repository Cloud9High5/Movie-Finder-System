import React from 'react';
import Container from '@material-ui/core/Container';
import Header from "../components/header";


function Dashboard () {
  return (
    <Container maxWidth="lg">
      <Header/>
      <div style={{ fontSize: 40 }}>Dashboard Page</div>
    </Container>
  )
}

export default Dashboard;