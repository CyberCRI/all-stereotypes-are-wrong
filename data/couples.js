'use strict';

const Term = function(en, fr) {
  // Currently only EN is used
  this.en = en;
  this.fr = fr;
};

const Couple = function(id, firstTerm, secondTerm) {
  this.id = id;
  this.firstTerm = firstTerm;
  this.secondTerm = secondTerm;
};

Couple.prototype = {
  hasTerm: function(term, lang) {
    if (this.firstTerm[lang] === term) {
      return true;
    }
    if (this.secondTerm[lang] === term) {
      return true;
    }
    return false;
  }
};

const CoupleManager = function() {
  this.couples = [];
};
CoupleManager.prototype = {
  addCouple: function(couple) {
    this.couples.push(couple);
  },
  getRandom: function(ignoredCouple) {
    let couple = this.couples[Math.floor(Math.random() * this.couples.length)];
    if (ignoredCouple && couple == ignoredCouple) {
      couple = this.getRandom(ignoredCouple);
    }
    return couple;
  },
  termExists: function(term, lang) {
    for (var i = 0, c = this.couples.length; i < c; i++) {
      if (this.couples[i].hasTerm(term, lang)) {
        return true;
      }
    }
    return false;
  }
}

const couples = new CoupleManager();

let pairs = [
  ["dark-skinned", "fair-skinned"],
  ["arts", "science"],
  ["educated", "uneducated"],
  ["vegeterian", "non-vegetarian"],
  ["sari", "shorts and t-shirt"],
  ["disabled", "non-disabled"],
  ["rich", "poor"],
  ["smart", "dumb"],
  ["man", "woman"],
  ["drunk", "sober"],
  ["serious", "fun-loving"],
  ["honest", "corrupt"],
  ["south-indian", "north-indian"],
  ["supersticious", "scientific"],
  ["caring", "hurtful"],
  ["short-tempered", "patient"],
  ["strong", "weak"]
];

for(const pair of pairs) {
  const firstTerm = new Term(pair[0]);
  const secondTerm = new Term(pair[1]);
  const couple = new Couple(`${pair[0]}-${pair[1]}`, firstTerm, secondTerm);
  couples.addCouple(couple);
}

module.exports = couples;
