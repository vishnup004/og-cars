export const isAdminAuth = (req, res, next) => {
    if(req.session.adminAuth){
        return next()
    };
    return res.redirect("/admin/login");
};

export const isAdminLogin = (req, res, next) => {
    if(req.session.adminAuth){
        return res.redirect("/admin/home")
    }
    return next()
}