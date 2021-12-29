const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/User");

// userRoute 의 기본경로:/api/users
//params 는 주소창에 입력하는 입력값
//body.req 는 postman body에 입력하는 입력값

//update user
router.put("/:id", async (req, res) => {
  //관리자이거나 파라미터ID 와 body에 입력한 Id가 같으면
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    //비밀번호 변경 시도시...
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      res.status(200).json("Acount has been updated");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can update only youre acount");
  }
});

//delete user
router.delete("/:id", async (req, res) => {
  //관리자이거나 파라미터ID 와 body에 입력한 Id가 같으면
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json("Acount has been deleted succesfully");
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("You can delete only youre acount");
  }
});
//get a user
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    //password, updatedAt 의 정보를 제외한 프로퍼티들을 response
    const { password, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//follow user   주소창 id를 갖는 유저를 body id를 갖는 유저가 follow 하는 구조
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    // 자기자신을 follow한게 아니면...
    try {
      const user = await User.findById(req.params.id); //(주소창)파라미터id 유저
      const currentUser = await User.findById(req.body.userId); //(postman)body id 유저
      if (!user.followers.includes(req.body.userId)) {
        //이미 follow한 유저가 아니라면
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("user has been followed");
      } else {
        //이미 follow 했다면...
        res.status(403).json("you allready follow this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    //자기 자신을 follow 한거면...
    res.status(403).json("you cant follow youre self");
  }
});

//unfollow user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    // 자기자신을 unfollow한게 아니면...
    try {
      const user = await User.findById(req.params.id); //(주소창)파라미터id 유저
      const currentUser = await User.findById(req.body.userId); //(postman)body id 유저
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).json("user has been unfollowed");
      } else {
        //이미 follow 했다면...
        res.status(403).json("you allready unfollowed this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    //자기 자신을 follow 한거면...
    res.status(403).json("you cant unfollow youre self");
  }
});

module.exports = router;
