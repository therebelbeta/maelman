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

var crypto = require('crypto')

var session = require('../helpers/session')

var User = require('../model/User')

var debug = require('../helpers/debug')

module.exports = {
  logout: function (req, res, next) {

  },
  getAccount: function (req, res, next) {
    var data = [req.user];
    data = data.map(function userInfoClean(orig) {
      var newObj = {}
      newObj.username = orig.username
      newObj.email = orig.email
      newObj.profile = orig.profile
      return newObj
    })
    res.json({
      data: data,
      totalRecords: 1,
      session: {
        loggedIn: true,
        accessToken: req.user.sessionToken
      }
    })
  },
  updateAccount: function updateAccountCtrl(req, res, next) {
    User.findOne({
        username: req.body.username
      },
      function findUserCB(err, user) {
        if (err) {
          res.send(500, {
            error: 'There was a problem with your request.'
          })
        }
        if (!user) {
          // update user with new session token
          debug(req.body.psToken, existingUser.psToken)
          res.send(500, {
            error: 'There was a problem with your request.'
          })
        }
        user.email = req.body.email || user.email
        user.psToken = req.body.psToken || user.psToken
        user.profile.tags = req.body.tags || user.profile.tags
        user.profile.name = req.body.displayName || user.profile.name
        user.profile.avatar = req.body.avatar_url || user.profile.avatar
        user.profile.location = req.body.location || user.profile.location
        user.profile.website = req.body.website || user.profile.website
        user.profile.gravatar = _toGravatar(req.body.email)
        user.profile.useGravatar = req.body.useGravatar ? req.body.useGravatar : user.profile.useGravatar
        user.profile.emailUpdates = req.body.emailUpdates === false ? req.body.emailUpdates : user.profile.emailUpdates
        user.save(function saveNewUserCB(err) {
          if (err) {
            res.send(500, {
              error: 'There was a problem with your request.'
            })
          }
          req.user = user
          req.user.sessionToken = user.sessionToken
          next()
        })
      }
    )
  },
  deleteAccount: function deleteAccountCtrl(req, res, next) {

  },
  authComplete: function authCompleteCtrl(req, res, next) {
    res.send(200, {
      data: [],
      session: {
        loggedIn: true,
        accessToken: req.user.sessionToken
      }
    })
  },
  localAuth: function localAuthCtrl(req, res, next) {
    debug('local strategy callback')
    User.findOne({
        username: req.body.username
      },
      function findUserCB(err, existingUser) {
        if (err) {
          res.send(500, {
            error: 'There was a problem with your request.'
          })
        }
        if (existingUser) {
          // update user with new session token
          debug(req.body.psToken, existingUser.psToken)
          if (req.body.psToken === existingUser.psToken) {
            debug('tokens Match!')
            var sessionToken = session.createToken(req, req.body.username)
            existingUser.sessionToken = sessionToken
            return existingUser.save(function saveExistingUserCB(err) {
              if (err) {
                res.send(500, {
                  error: 'There was a problem with your request.'
                })
              }
              req.user = existingUser
              return next()
            })
          }
          return res.send(500, {
            error: 'Password Token did not match.'
          })
        }
        var user = new User()
        user.email = req.body.email
        user.username = req.body.username
        user.psToken = req.body.psToken
        var sessionToken = session.createToken(req, req.body.username)
        user.sessionToken = sessionToken
        user.profile.tags = []
        user.profile.name = req.body.displayName
        user.profile.avatar = req.body.avatar_url
        user.profile.location = req.body.location
        user.profile.website = req.body.website
        user.profile.gravatar = _toGravatar(req.body.email)
        user.profile.useGravatar = req.body.useGravatar ? req.body.useGravatar : false
        user.profile.emailUpdates = req.body.emailUpdates === false ? req.body.emailUpdates : true
        user.save(function saveNewUserCB(err) {
          if (err) {
            res.send(500, {
              error: 'There was a problem with your request.'
            })
          }
          req.user = user
          req.user.sessionToken = sessionToken
          next()
        })
      }
    )
  }
}

function _toGravatar(email) {
  var size = 200
  var defaults = 'retro'

  if (!email) {
    return 'https://gravatar.com/avatar/?s=' + size + '&d=' + defaults
  }
  var md5 = crypto.createHash('md5').update(email.toLowerCase())
  return 'https://gravatar.com/avatar/' + md5.digest('hex').toString() +
    '?s=' +
    size + '&d=' + defaults
}
