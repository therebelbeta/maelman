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

var _ = require('lodash')
var moment = require('moment')
var jwt = require('jwt-simple')
var secrets = require('../config/secrets')
var User = require('../model/User')

var debug = require('./debug')

module.exports = {
  createToken: function(req, user) {
    var payload = {
      user: user,
      ua: req.headers['user-agent'],
      location: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      expiration: moment().add(12, 'hours').format('X')
    }
    var token = jwt.encode(payload, secrets.jwt)
    return token
  },
  checkToken: function(req, res, next) {
    debug('Running check token')
    var ua = req.headers['user-agent']
    var location = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    var now = moment().format('X')
    var token = req.headers['authorization'].split('Bearer ')[1]
    var decoded = jwt.decode(token, secrets.jwt)
    if (
      decoded.location !== location ||
      decoded.ua !== ua
    ) {
      _internal.fail(res)
    }
    else if (parseInt(decoded.expiration) < parseInt(now)) {
      _internal.fail(res, {
        error: 'Session has expired. Please login again.'
      })
    }
    else {
      User.findOne({
        username: decoded.user
      }, function(err, results) {
        if (err) {
          _internal.fail(res)
        }
        else if (results.sessionToken !== token) {
          _internal.fail(res, {
            error: 'User logged in elsewhere. Please login again.'
          })
        }
        else {
          req.user = results
          next()
        }
      })
    }
  }
}
// If this gets too big, split out into a separate helper file
var _internal = {
  fail: function(res, msg) {
    res.send(401, msg)
  }
}
