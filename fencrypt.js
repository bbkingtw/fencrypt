var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';

var fs = require('fs');
var zlib = require('zlib');
var argv=require('optimist').argv;
var chalk=require('chalk');
var bgRed=chalk.bgRed;

log=console.log;
var param_ok=true;

var errors=[];

function elog(s){
	param_ok=false;
	errors.push(s);
}

if (!argv.i) elog('-i input_file must be provide');
if (!argv.a) elog('-a action (encrypt|decrypt)');
if (!param_ok) {
	log('usage: fencrypt');
	errors.map(function(s){
		log('\t'+s);
	});
	return;
}

// input file
var r = fs.createReadStream(argv.i);//'file.txt');
// zip content
var zip = zlib.createGzip();
// encrypt content
var encrypt = crypto.createCipher(algorithm, password);
// decrypt content
var decrypt = crypto.createDecipher(algorithm, password)
// unzip content
var unzip = zlib.createGunzip();

// write file
var uid=require('uuid')();

if (argv.o)
	var w = fs.createWriteStream(argv.o);

function fbyact(s) {
	switch (s) {
		case 'encrypt':
			return encrypt;
			break;
		case 'decrypt':
			return decrypt;
			break;
		case 'zip':
			return zip;
			break;
		case 'unzip':
			return unzip;
			break;
		default:
			return process.stdout;
			break;
	}
}

fbyname={
	encrypt:encrypt,
	decrypt:decrypt,
	zip:zip,
	unzip:unzip
}

switch( argv.a ) {
	case 'encrypt':
		r.pipe(encrypt).pipe(w);
		break;
	case 'decrypt':
		r.pipe(decrypt).pipe(w);
		break;		
	default:
		var acts=argv.a.split(',')

		for (var i=0; i<acts.length; i++) {
			var act=acts[i];
			log('act',act);
			r=r.pipe(fbyname[act]);	
		}
		if (argv.o)
			r.pipe(w)
		else 
			r.pipe(process.stdout);
		break;
}


// start pipe
//r.pipe(zip).pipe(encrypt).pipe(decrypt).pipe(unzip).pipe(w);
