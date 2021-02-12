var express    = require('express')
var server     = express()  // create http server
server.listen(3636)
var ejs        = require('ejs')
server.engine('html', ejs.renderFile)
var mysql      = require('mysql')
var pool       = mysql.createPool('mysql://john:walker@localhost/initial')
var valid      = [ ]
var cookie     = require('cookie-parser')
var readCookie = cookie()
var readBody   = express.urlencoded({extended:false})

server.get ('/', showHome)
server.get ('/member-register', readCookie, showRegisterPage)
server.post('/member-register', readBody,   saveNewMember)
server.get ('/member-login',    readCookie, showLogInPage)
server.post('/member-login',    readBody,   checkPassword)
server.get ('/member-profile',  readCookie, showProfile)
server.get ('/member-logout',   readCookie, deleteSession)

server.get ('/post-add',        readCookie, showPostAdd)
server.post('/post-add',        readCookie, readBody, savePost)
server.get ('/post-detail',     showPostDetail)
server.get ('/post-list',       showAllPost)
// server.get ('/post-delete', readCookie, deletePost)
server.get ('/not-found',       showError)
server.use (express.static('public'))
server.use (showError)

function showHome(request, response) {
	response.render('home.html')
}

function showRegisterPage(request, response) {
	var card = request.cookies ? request.cookies.card : null
	if (valid[card]) {
		response.redirect('/member-profile')
	} else {
		response.render('member-register.html')
	}
}

function saveNewMember(request, response) {
	var e = request.body.email         || ''
	var p = request.body.password      || ''
	var f = request.body['first-name'] || ''
	var g = request.body['last-name']  || ''
	// TODO: Check data with regular expression
	if (e == '' || p == '' || f == '' || g == '') {
		response.redirect('/member-register')
	} else {
		var sql = "insert into member(email,password, " +
				  "first_name,last_name)              " +
				  "values(?,sha2(?,512),?,?)          "
		var data = [e, p, f, g]
		pool.query(sql, data, function show(error, resutl) {
			if (error == null) {
				response.redirect('/member-login')
			} else {
				console.log(error)
				response.redirect('/member-register')
			}
		})
	}
}

function showLogInPage(request, response) {
	var card = request.cookies ? request.cookies.card : null
	if (valid[card]) {
		response.redirect('/member-profile')
	} else {
		response.render('member-login.html')
	}
}

function checkPassword(request, response) {
	var e = request.body.email    || ''
	var p = request.body.password || ''
	if (e == '' || p == '') {
		response.redirect('/member-login')
	} else {
		var sql =   "select * from member where email = ? "
					"and password = sha2(?, 512)          "
		var data = [e, p]
		pool.query(sql, data, function show(error, result) {
			if (result.length > 0) {
				var card = randomCard()
				valid[card] = result[0]
				response.header('Set-Cookie', 'card=' + card)
				response.redirect('/member-profile')
			} else {
				response.redirect('/member-login')
			}
		})
	}
}

function showProfile(request, response) {
	var card = request.cookies ? request.cookies.card : null
	if (valid[card]) {
		var model = { }
		model.member = valid[card]
		response.render('member-profile.html', model)
	} else {
		response.redirect('/member-login')
	}
}

function deleteSession(request, response) {
	var card = request.cookies ? request.cookies.card : nulls
	delete valid[card]
	response.render('member-logout.html')
}

function randomCard() {
	var s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
	var b = [ ]
	for (var i = 0; i < 8; i++) {
		var item = ''
		for (var j = 0; j < 4; j++) {
			var r = parseInt(Math.random() * s.length)
			item += s[r]
		}
		b.push(item)
	}
	return b.join('-')
}

function showError(request, response) {
	response.render('error.html')
}

function showPostAdd(request, response) {
	var card = request.cookies ? request.cookies.card : null
	if (valid[card]) {
		response.render('post-add.html')
	} else {
		response.redirect('/member-login')
	}
}

function savePost(request, response) {
	var card = request.cookies ? request.cookies.card : null
	if (valid[card]) {
		var sql = "   insert into post(topic, detail, owner)  " +
					" values(?, ?, ?)"
		var t = request.body.topic  || ''
		var d = request.body.detail || ''
		var o = valid[card].code
		if (t == '' || d == '') {
			response.redirect('/post-add')
		} else {
			pool.query(sql, [t,d,o], function show(error, result) {
				response.redirect('/post-list')
			})
		}
	} else {
		response.redirect('/member-login')
	}
}

function showPostDetail(request, response) {
	var sql = 'select * from post where code = ?'
	var code = +request.query.post || 1
	var data = [ code ]
	pool.query(sql, data, function show(error, result) {
		if (error == null) {
			var model = { }
			model.post = result[0]
			response.render('post-display.html', model)
		} else {
			response.redirect('/not-found')
		}
	})
}

function showAllPost(request, response) {
	pool.query('select * from post', function show(error, result) {
		var model = { }
		model.data = result
		response.render('post-list.html', model)
	})
}


























//
