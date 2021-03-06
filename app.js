const express = require('express');
const _ = require('lodash');
const request = require('request-promise');
const Promise = require('bluebird');
const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}`));

var companyNames = [];
var userUrls = [];

/*Initial API call for this  App server*/
app.get('/companies-contributed-cla', (req, res) => {
  var contributors = {
    url: 'https://api.github.com/repos/cla-assistant/cla-assistant/contributors',
    method: 'GET',
    headers: {
      'user-agent': 'companies-contributed-cla-App'
    }
  };

  /* first external API call from this App server for getting all the contributors details */
  request(contributors).then(function(response) {
    var responseArr = JSON.parse(response);
    /*for getting all the users  profile endpoints  from the response and storing them in an array (userUrls) with header information*/
    getUsersUrl(responseArr);
  }).catch(function(err) {
    console.log('The API call to get all the contributors failed', err);
  }).then(function() {
    /* API calls to all the user profile endpoints to get the company information
      for each contributor by grouping it by promises using Promise.map provided by the bluebird module .*/
    Promise.map(userUrls, function(userUrl) {
      return request(userUrl).then(function(response) { 
        var responseObj = JSON.parse(response);
        /*for getting  all the company names from response  and storing them  in an Array (companyNames) */
        getCompanyNames(responseObj);
      });
    }).catch(function(err) {
      console.log('The API call  to user profile for getting company details is failed', err);
    }).then(function() {
      /*for counting the number of contributors in each company and sorting based on most contributors at the top*/
      var sortedCompanyInfo = getSortedCompanyList(companyNames);

      /* the final response (output)  is a list with companies   and number of contributors to each company is displayed in JSON format
        and is also sorted in such a way that the company with most number  of contributors will be displayed on the top */
      res.send(JSON.stringify(sortedCompanyInfo));
    });

  });


});

function getUsersUrl(responseArr) {
  responseArr.forEach((item, index, array) => {
    var urlObj = {
      url: item.url,
      method: 'GET',
      headers: {
        'user-agent': 'companies-contributed-cla-App'
      }
    };
    userUrls.push(urlObj);
  });

  return userUrls;
}

function getCompanyNames(responseObj) {
  if (responseObj.company === null) {
    responseObj.company = 'Unknown';
  }
  companyNames.push(responseObj);
}

function getSortedCompanyList(companyNames) {
  /*for counting the frequency / occurrences of  companyNames array elements and returns a single
   object with  company names(keys)  and their  respective number of occurrences(values)*/
  var companyInfo = _.countBy(companyNames, 'company');
  /* for  sorting the result of _.countBy (companyInfo) in descending order and storing in an array (sortedCompanyInfo)*/
  var sortedCompanyInfo = _.chain(companyInfo). //
  map(function(currentValue, index) {
      return {
        company: index,
        contributors: currentValue
      }
    }).sortBy('contributors')
    .reverse()
    .value();
  return sortedCompanyInfo;

}
