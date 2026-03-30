module.exports = (req, res, next) => {
  const userDept = req.user.department;
  const requestedDept = req.params.department;

  if (req.user.role !== "admin" && userDept !== requestedDept) {
    return res.status(403).json({
      message: "Unauthorized department access"
    });
  }

  next();
};