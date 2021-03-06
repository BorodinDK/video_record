var express = require('express');
var fs = require('fs');
var exec = require('child_process').exec;
var app = express();

app.use('/', express.static(__dirname + '/static'));
app.get('/video/:name', function (req, res, next) {
	res.sendFile(__dirname +'/upload/'+req.params.name+'.webm')
});

app.post('/upload', function (req, res) {

    var files = '';

    req.setEncoding('utf8');
    req.addListener('data', function(postDataChunk) {
        files += postDataChunk;
    });
    req.addListener('end', function() {
        console.log('done uploading');
        files = JSON.parse(files);

        var fileName = Math.random().toString(16).split('.')[1];

    	var videofile = upload(files.video, fileName);
    	var audiofile = upload(files.audio, fileName);

    	exec('ffmpeg -itsoffset -00:00:00 -i '+audiofile+' -itsoffset -00:00:00 -i '+videofile+' '+__dirname +'/upload/'+fileName+'.webm', function(){;  
            console.log('done merge');
            res.send(JSON.stringify({name:fileName}));
    	}, function(){
            console.log('err');
    	});
    });
});

var server = app.listen(1337, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});

function upload(file, fileName) {
    var fileBuffer = new Buffer(file.contents, "base64");
    var name = __dirname + '/upload/_'+fileName+'.'+file.type.split('/')[1];
    fs.writeFileSync(name, fileBuffer);
    return name;
}
