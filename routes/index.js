
/*
 * GET home page.
 */
exports.index = function(Account){
	return function(req, res){
		Account.find({}, function(err, docs){
			var groups = new Array();
			var j = 0;
			for (var i=0; i<docs.length; i++) {
				if (i === 0) {
					groups[j] = docs[i].group;
					j = j + 1
				}else{
					if (docs[i].group !== groups[j-1]) {
						groups[j] = docs[i].group;
						j = j + 1;
					};
				};
			};
			groups.sort();
			console.log('groups : ' + groups);
			res.render('index', { title: 'Bluepush', groups: groups });
		});
	};
};
exports.ppt = function(req, res){
  res.render('ppt');
};