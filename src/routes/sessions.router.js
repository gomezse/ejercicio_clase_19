import { Router } from "express";
import { usersManager } from "../managers/usersManager.js";
const router = Router();


//create user
router.post("/signup", async (req, res) => {
  const { first_name, last_name, email, password } = req.body;
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const createdUser = await usersManager.createOne(req.body);
    res.status(200).json({ message: "User created", user: createdUser });
  } catch (error) {
    res.status(500).json({ error });
  }
});


//login user
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const user = await usersManager.findByEmail(email);
    
    if (!user) {
      return res.redirect("/signup");
    }
    
    const isPasswordValid = password === user.password;
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: "I can't authenticate you" });
    }

    //user con permisos de admin
    const sessionInfo =
      email === "adminCoder@coder.com" && password === "adminCod3r123"
        ? { email, first_name: user.first_name,last_name:user.last_name, isAdmin: true }
        : { email, first_name: user.first_name,last_name:user.last_name, isAdmin: false };
    
    req.session.user = sessionInfo;
    res.redirect("/profile");
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get("/signout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});
export default router;