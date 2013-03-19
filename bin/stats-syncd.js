var express = require('express')
  , app = express()
  , db = require('../db').connect()
  ,statisticsSynchronizer = require('./../services/statistics-synchronizer.js');

app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.set('redisdb', 1);
});

app.configure('production', function(){
  app.set('redisdb', 0);
});

app.configure('test', function(){
  app.set('redisdb', 2);
});
db.select(app.get('redisdb'), function(err, res) {
  statisticsSynchronizer.startSynchronization();
})