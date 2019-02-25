/*jshint esversion: 6 */
const express = require('express');
const _ = require('lodash');
const request = require("request-promise");
var promise = require("bluebird");
const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`listening on port ${port}`));

const companyNames = [];
const userUrls = [];

app.get("/", (req, res) => { // Initial API call for this node.js App server
  var options = {
    url: "https://api.github.com/repos/cla-assistant/cla-assistant/contributors",
    method: 'GET',
    headers: {
      'Authorization': 'token 8ec480a9c0931ddf26b0eac00b1ea29f82b148a2',
      'user-agent': 'AkshayApp'
    }
  };
  request(options).then(function(response) { // first external API call from this App server for getting all the contributors details
    const responseArr = JSON.parse(response);
    getUsersUrl(responseArr); // for getting all the users  profile urls and storing them in an array (userUrls) with header information
  }).catch(function(err) {
    console.log("The API call to get all the contributors failed ", err);
  }).then(function() {
    promise.map(userUrls, function(options) {
      return request(options).then(function(response) { // external API Calls using promise for fetching company names of all the contributors
        const responseObj = JSON.parse(response);
        getCompanyNames(responseObj); // for getting  all the company names from contributors  and storing them  in an Array (companyNames)
      });
    }).catch(function(err) {
      console.log("The API call  to get the company name of the contributor  failed ", err);
    }).then(function() {
      const sortedCompanyInfo = getSortedCompanyList(companyNames); // for counting the number of contributors in each company and sorting based on most contributors at the top
      res.send(sortedCompanyInfo); //the response (output) which is a list with company name and number of contributors and sorted  with most no of contributors on the top  will be displayed in the JSON format
    });

  });


});

function getUsersUrl(responseArr) {
  responseArr.forEach((item, index, array) => {
    const urlObj = {
      url: item.url,
      method: 'GET',
      headers: {
        'Authorization': 'token 8ec480a9c0931ddf26b0eac00b1ea29f82b148a2',
        'user-agent': 'AkshayApp'
      }
    };
    userUrls.push(urlObj);
  });

  return userUrls;
}

function getCompanyNames(responseObj) {
  if (responseObj.company === null) {
    responseObj.company = "Unknown";
  }
  companyNames.push(responseObj);
}

function getSortedCompanyList(companyNames) {
  var companyInfo = _.countBy(companyNames, 'company'); // for counting the frequency / occurrences of  companyNames array elements and returns a object with  company names(keys)  and their  respective number of occurrences(values)
  var sortedCompanyInfo = _.chain(companyInfo). // for  sorting the result of _.countBy (companyInfo) in descending order and storing in an array
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
