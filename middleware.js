module.exports.isLoggedIn = (req, res, next) => {
    if(!isAuthenticared()) {
        return res.redirect("/login");
    }
    next();
}