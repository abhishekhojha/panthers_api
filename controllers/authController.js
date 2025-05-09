const jwt = require('jsonwebtoken');

exports.googleCallback = (req, res) => {
  const token = jwt.sign(
    { id: req.user._id, role: req.user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  });

  res.redirect(process.env.CLIENT_URL); // Dashboard or homepage
};

exports.logout = (req, res) => {
  req.logout(() => {
    res.clearCookie('token');
    res.redirect('/');
  });
};
