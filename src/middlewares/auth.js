const adminAuth =(req,res,next) => {
    console.log("Admin auth is getting checked")
    const token = "12345";
    const validToken = token === "12345";
    if(!validToken){
        res.status(401).send("Unauthorized Request");
    }
    else{
        next();
    }
}
module.exports = {adminAuth};