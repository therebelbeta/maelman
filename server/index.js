// Copyright (c) 2015 Trent Oswald <trentoswald@therebelrobot.com

// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.

// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
// SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
// IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
"use strict"



var restify = require('restify')

var debug = require('./helpers/debug')

debug('setting up server')
var server = restify.createServer()
server.debug = debug

var mongoose = require('./model/mongoose').init()

var secrets = require('./config/secrets')
var routes = require('./routes')

// set up server
server.use(restify.sanitizePath()) // Add this line
server.use(restify.acceptParser(server.acceptable))
server.use(restify.authorizationParser())
server.use(restify.dateParser())
server.use(restify.queryParser())
server.use(restify.jsonp())
server.use(restify.gzipResponse())
server.use(restify.bodyParser({mapParams: false}))

// initiate routes and passport
debug('Setting up Routes');
routes.init(server)

// Start the app by listening on <port>
var port = secrets.port
server.listen(port)
console.log('Stellar started on port ' + port)
