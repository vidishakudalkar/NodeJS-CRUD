'use strict';

const assert = require('assert');
const mongo = require('mongodb').MongoClient;


//used to build a mapper function for the update op.  Returns a
//function F = arg => body.  Subsequently, the invocation,
//F.call(null, value) can be used to map value to its updated value.
function newMapper(arg, body) {
  return new (Function.prototype.bind.call(Function, Function, arg, body));
}

//print msg on stderr and exit.
function error(msg) {
  console.error(msg);
  process.exit(1);
}

//export error() so that it can be used externally.
module.exports.error = error;


//auxiliary functions; break up your code into small functions with
//well-defined responsibilities.

//perform op on mongo db specified by url.
function dbOp(url, op) {
  
var json = JSON.parse(op);
//console.log(json);
var op_fetch = json.op;
//console.log(op_fetch);
var collection_fetch = json.collection;
//console.log(collection_fetch);
var args_fetch = json.args;
//console.log(args_fetch);

if (op_fetch == 'create'){
mongo.connect(url,function(err, db) {
assert.strictEqual(err,null);
console.log("connected");
db.collection(collection_fetch)
.insertMany(args_fetch)
db.close();
});
}

else if (op_fetch == 'read'){
mongo.connect(url,function(err, db) {
if (err) throw err;
console.log("connected");
db.collection(collection_fetch).find(args_fetch).toArray(function(err,result) {
 if (err) throw err;
 console.log(result);
 db.close();
});
});
}

else if (op_fetch == 'delete'){
mongo.connect(url,function(err, db) {
if (err) throw err;
console.log("connected");
db.collection(collection_fetch).deleteMany(args_fetch,function(err, r) {
if (err) throw err;
 console.log("Deletion Successful");
 db.close();
});
});
}

else if (op_fetch == 'update'){
	mongo.connect(url,function(err, db) {
		if (err) throw err;
		var map,size;
		console.log("connected");
		var fn_fetch = json.fn;
		var mapper = newMapper(fn_fetch[0],fn_fetch[1]);

		db.collection(collection_fetch).find(args_fetch).toArray(function(err,result) {
			if (err) throw err;
			
			result.forEach(row=> {
				map = mapper.call(null,row);
				console.log(map	);
				db.collection(collection_fetch).save(map).then(()=> {
					size++;
					if(size === result.length){
						db.close();
						process.exit();
					}
				}).catch(err=>{console.error(err);
					process.exit();})
			
	
  
			});
	});
});
//your code goes here

};
}
//make main dbOp() function available externally
module.exports.dbOp = dbOp;

