var CronJob = require('cron').CronJob;
var mongoose = require('mongoose');
var job = new CronJob('0/10 * * * * *', function() {
  var dbConnUtils=require("../utils/dbConn");
  dbConnUtils(mongoose).dropCollections(function(){ console.log("deleted")});
  /*
   * Runs every weekday (Monday through Friday)
   * at 11:30:00 AM. It does not run on Saturday
   * or Sunday.
   */
  }, function () {
    /* This function is executed when the job stops */
  },
  false /* Start the job right now */
)

module.exports = job;