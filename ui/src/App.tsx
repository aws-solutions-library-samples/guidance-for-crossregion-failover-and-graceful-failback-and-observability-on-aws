// Copyright 2022 Amazon.com and its affiliates; all rights reserved.
// This file is Amazon Web Services Content and may not be duplicated or distributed without permission.

import React from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import HomepageView from "./components/home/home-page";
import RemittanceTableView from "./components/remittance/remittance-table.index";
import RemittanceDetailView from "./components/remittance/remittance-detail";
import LoginView from "./components/home/login";
import CreateRemittanceForm from "./components/remittance/create-remittance-form";
import UpdateRemittanceForm from "./components/remittance/update-remittance-form"
import DeleteRemittanceForm from "./components/remittance/delete-remittance-table";

const App = () => {

  return (
      <div>
        <Router>
          <Route exact path='/' component={HomepageView}/>
          <Route exact path='/Login' component={LoginView}/>
          <Route exact path='/Remittances' component={RemittanceTableView}/>
          <Route exact path='/Remittance' component={RemittanceDetailView}/>
          <Route exact path='/CreateRemittance' component={CreateRemittanceForm}/>
          <Route exact path='/UpdateRemittance' component={UpdateRemittanceForm}/>
          <Route exact path='/DeleteRemittance' component={DeleteRemittanceForm}/>
        </Router>
      </div>
  );
}

export default App;
