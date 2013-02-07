var stubPost =  {id:1, title:'Stub Post', content:'Client not connected to DB.'};


function define() {

}

function scope() {

}

function filter(a,b,cb) {
	if (!cb) cb = b;
	cb({data:function() { return [stubPost]; }});
}

function find_one(a,b,cb) {
	cb({data:function() { return stubPost; }});
}

function create() {

}

function push() {

}

module.exports = {
	define   : define,
	scope    : scope,
	filter   : filter,
	find_one : find_one,
	create   : create,
	push     : push
};