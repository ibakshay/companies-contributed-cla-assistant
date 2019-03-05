const express = require('express');
const _ = require('lodash');
const request = require('request-promise');
const Promise = require('bluebird');
const app = express();
const port = process.env.PORT || 3000;
const Octokit = require('@octokit/rest')
const octokit = new Octokit()
app.listen(port, () => console.log(`listening on port ${port}`));


/*Initial API call for this  App server*/
app.get('/companies-contributed-cla', (req, res) => {
  var contributors = {
    url: 'https://api.github.com/repos/cla-assistant/cla-assistant/contributors',
    method: 'GET',
    headers: {
      'user-agent': 'companies-contributed-cla-App',
    }
  };
  /* first external API call from this App server for getting all the contributors details */
  octokit.paginate(contributors, response => response.data.map(item => item.url))
    .then(function(response) {
      var userUrls = getUsersUrl(response);
      return userUrls;
    }).catch(function(err) {
      console.log('The API call to get all the contributors failed', err);
      throw err ;
    }).then(function(userUrls) {
      /* API calls to all the user profile endpoints to get the company information
        for each contributor by grouping it by promises using Promise.map provided by the bluebird module .*/
      var companyNames = Promise.map(userUrls, function(userUrl) {
        return request(userUrl).then(function(response) {
          var responseObj = JSON.parse(response);
          /*for getting  all the company names from response  and storing them  in an Array (companyNames) */
          var companyNames = responseObj.company === null ? responseObj.company = "Unknown": responseObj.company ;
          return companyNames ;
        });
      }, {concurrency: 100})
      .catch(function(err) {
        console.log('The API call  to user profile for getting company details is failed', err);
        throw err;
      });
      return companyNames;
    }).then(function(companyNames) {
      /*for counting the number of contributors in each company and sorting based on most contributors at the top*/
      var sortedCompanyInfo = getSortedCompanyList(companyNames);
      /* the final response (output)  is a list with companies   and number of contributors to each company is displayed in JSON format
        and is also sorted in such a way that the company with most number  of contributors will be displayed on the top */
      res.send(JSON.stringify(sortedCompanyInfo));
    });
});


function getUsersUrl(response) {
  var userUrls = response.map((item, index, array) => {
    var urlObj = {
      url: item,
      method: 'GET',
      headers: {
        'user-agent': 'companies-contributed-cla-App',
      }
    };
    return urlObj;
  });
  return userUrls;
}

function getSortedCompanyList(companyNames) {
  /*for counting the frequency / occurrences of  companyNames array elements and returns a single
   object with  company names(keys)  and their  respective number of occurrences(values)*/
  var companyInfo = _.countBy(companyNames);
  /* for  sorting the result of _.countBy (companyInfo) in descending order and storing in an array (sortedCompanyInfo)*/
  var sortedCompanyInfo = _.chain(companyInfo). //
  map((currentValue, index) => {
      return {
        company: index,
        contributors: currentValue
      }
    }).sortBy('contributors')
    .reverse()
    .value();
  return sortedCompanyInfo;
}
