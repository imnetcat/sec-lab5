const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const { refreshTokenGrant, loginPasswordGrant, createUser } = require('./auth0');
const { validateJwt } = require('./jwt');
const port = 3000;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
const AUTHORIZATION_HEADER = 'authorization';

const login = async (req, res) => {
	const { login, password } = req.body;

	const tokens = await loginPasswordGrant(login, password);

	if (tokens) {
		res.cookie('refresh_token', tokens.refresh_token, {
			httpOnly: true,
			secure: false,
		});
		res.status(200).json({ token: tokens.access_token }).send();
	} else {
		res.status(401).send();
	}
};

const asyncHandler = (fn) => (req, res, next) => {
	fn(req, res, next).catch(next);
};


const refreshTokenIfNeeded = async (req, res, expires) => {
	// const dif = (expires - new Date()) / 1000 / 60;
	// if (dif > 5) {
	// 	return;
	// }
	const tokens = refreshTokenGrant(req.cookies.refresh_token);
	res.cookie('refresh_token', tokens.refresh_token, {
		httpOnly: true,
		secure: false,
	});
};

app.use(
	asyncHandler(async (req, res, next) => {
		const token = req.headers[AUTHORIZATION_HEADER];
		if (token?.length) {
			const tokenData = await validateJwt(token);
			req.session = tokenData.principal;
			await refreshTokenIfNeeded(req, res,tokenData.expires);
		}
		next();
	})
);

app.get('/', (req, res) => {
	if (req.session?.username) {
		return res.json({
			username: req.session.username,
			logout: 'http://localhost:3000/logout',
		});
	}

	res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/logout', (req, res) => {
	sessions.destroy(req, res);
	res.clearCookie('refresh_token');
	res.redirect('/');
});

app.post('/api/login', async (req, res) => {
	return await login(req, res);
});

app.post('/api/register', async (req, res) => {
	await createUser(req.body.login, req.body.password);
	return await login(req, res);
});

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`);
});
