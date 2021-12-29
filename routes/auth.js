const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
// userRoute 의 기본경로:/api/auth

//REGISTER
router.post("/register", async (req, res) => {
  try {
    //비밀번호 암호화
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //유저 생성
    const newUser = await new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    //유저 저장 + response
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//LOGIN

router.post("/login", async (req, res) => {
  //파라미터로 받은 이메일이 유저모델(데이터베이스)에 있는지 확인 후 처리
  try {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(404).send("user not found"); //실제 데이터베이스에 없으면...

    //req.body에 입력한 password와 실제 user모델에 있는 password 비교
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    !validPassword && res.status(400).json("wrong password"); //실제 데이터베이스에 없으면...

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
