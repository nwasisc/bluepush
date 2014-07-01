
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Bluepush' });
};
exports.ppt = function(req, res){
  res.render('ppt');
};