const express = require('express')
const Octokit = require('@octokit/rest')
const octokit = new Octokit({'user-agent': 'companies-contributed-cla-app'/*, auth: `token <token>`*/})

const app = express()
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`listening on port ${port}`))

// register new express route to return companies contributed to cla-assistant
app.get('/companies-contributed-cla', (req, res) => {

  // get all contributors (ignore pagination for now)
  octokit.repos.listContributors({owner: 'cla-assistant', repo: 'cla-assistant'}).then(({ data, status, headers }) => {
      
    // get details for each user
    const users = data.map(user => { return {login: user.login, url: user.url} })
    Promise.all(users.map(user => octokit.users.getByUsername({username: user.login}))).then((data) => {
      
      const contributors = data.map(response => { return { login: response.data.login, company: response.data.company} })
      const companies = [...new Set(contributors.map( contributor => contributor.company ))]

      // get all company contributors and order list descending 
      let companyContributors = []
      companies.map(company => companyContributors.push({company: company, contributors: contributors.filter(contributor => contributor.company === company).length}))
      companyContributors = companyContributors.sort((first, second) => { return first.contributors <= second.contributors ? 1 : -1})
      res.send(JSON.stringify(companyContributors, 2))
    })
  })
})
