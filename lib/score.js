
function processScore(accessFunc, scoreType, amount, done) {
  accessFunc((err, scoreContainer) => {
    if (err) {
      done(err);
      return;
    }

    let finalAmount;

    scoreContainer.p(scoreType) + amount < 0 ? finalAmount = 0 : finalAmount = amount;
    console.log(finalAmount)
    scoreContainer.p(scoreType, scoreContainer.p(scoreType) + finalAmount);
    
    scoreContainer.save((err) => {
      if (!err) {
        done(null);   
      } else {
        done(err);
      }
    });
  });
}

module.exports.processScore = processScore;