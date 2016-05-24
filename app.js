'use strict';

const express    = require('express');
const mongoose   = require('mongoose');
const bodyParser = require('body-parser');

const port      = process.env.PORT || 3000;
const mongo_url = process.env.MONGO_URL || 'mongodb://localhost/asaw';

const Answer      = require('./models/answer');
const Combination = require('./models/combination');
const Token       = require('./models/token');

const couples = require('./data/couples');

const checkToken = require('./middlewares/check-token');

const getCombinationId = require('./helpers/get-combination-id');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect(mongo_url);
process.stdout.write(`Mongoose connected to ${mongo_url}\n`);

app.get('/couples', function(request, response) {
  // Get 20 random couples of terms
  const pairs = couples.getRandomSet(20);

  // Pair them into combincations and create a token for each
  let questionPromises = [];
  for(let i = 0; i < pairs.length; i+=2) {
    const combination = getCombinationId(pairs[i].id, pairs[i+1].id);
    const token = new Token({ combination: combination });

    var questionPromise = token.save().then(function(token) { 
      return {couples: [pairs[i], pairs[i+1]], token: token.token };
    });
    questionPromises.push(questionPromise);
  }

  Promise.all(questionPromises).then(function(questions) {
    response.json(questions);
  });
});

app.get('/stats', function(request, response) {
  Combination.find({}, function(err, combinations) {
    if (err) throw err;
    let total = 0;
    for (let i = 0, c = combinations.length; i < c; i++) {
      total += combinations[i].count;
    }
    response.json({ total: total });
  });
});

app.post('/answer', checkToken, function(request, response) {
  const association1  = request.body.association1.split(',').sort().join(',');
  const association2  = request.body.association2.split(',').sort().join(',');
  const answerContent = [association1, association2].sort().join(';');

  Answer.findOne({ answer: answerContent }, function(err, answer) {
    if (err) throw err;

    if (!answer) {
      answer = new Answer({
        answer: answerContent,
        combination: request.combination
      });
    }

    answer.count = answer.count + 1;

    answer.save(function(err) {
      if (err) throw err;

      Combination.findOne({ combination: request.combination }, function(err, combination) {
        if (err) throw err;

        if (!combination) {
          combination = new Combination({
            combination: request.combination
          });
        }

        combination.count = combination.count + 1;

        combination.save(function(err) {
          if (err) throw err;

          response.status(200).json({ count: answer.count, total: combination.count });
        });
      });
    });

  });
});

app.listen(port, function() {
  process.stdout.write(`ASAW server is listening on port ${port}\n`);
})
