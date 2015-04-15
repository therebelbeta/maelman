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

var session = require('../helpers/session')
var accountCtrl = require('../controllers/account')

module.exports = function accountRoutesInit(server) {
  server.get(
    '/api/account/logout',
    session.checkToken,
    accountCtrl.logout)
  server.get(
    '/api/account/user',
    session.checkToken,
    accountCtrl.getAccount)
  server.put(
    '/api/account/user',
    session.checkToken,
    accountCtrl.updateAccount,
    accountCtrl.getAccount)
  server.del(
    '/api/account/user',
    session.checkToken,
    accountCtrl.deleteAccount)
  server.post(
    '/api/account/auth',
    accountCtrl.localAuth,
    accountCtrl.authComplete
  )
}
