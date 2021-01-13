import passport from "passport";
import routes from "../routes";
import User from "../models/User";

// Join
export const getJoin = (req, res) => {
  res.render("join", { pageTitle: "Join" });
};

export const postJoin = async (req, res, next) => {
  const {
    body: { name, email, password, password2 },
  } = req;
  if (password !== password2) {
    req.flash("error", "Passwords don't match");
    res.status(400);
    res.render("join", { pageTitle: "Join" });
  } else {
    try {
      const user = await User({
        name,
        email,
      });
      await User.register(user, password);
      next();
    } catch (error) {
      console.log(error);
      res.redirect(routes.home);
    }
  }
};

// Github Login
export const githubLogin = passport.authenticate("github", {
  successFlash: "Welcome",
  failureFlash: "Can't login with Github",
});

export const githubLoginCallback = async (_, __, profile, cb) => {
  const {
    _json: { id, avatar_url: avatarUrl, name, email },
  } = profile;
  try {
    const user = await User.findOne({ email });
    if (user) {
      user.githubId = id;
      user.save();
      return cb(null, user);
    }
    const newUser = await User.create({
      name,
      email,
      githubId: id,
      avatarUrl,
    });
    return cb(null, newUser);
  } catch (error) {
    return cb(error);
  }
};

export const postGithubLogin = (req, res) => {
  res.redirect(routes.home);
};

// Naver Login
export const naverLogin = passport.authenticate("naver", {
  successFlash: "Welcome",
  failureFlash: "Can't login with Naver",
});

export const naverLoginCallback = async (_, __, profile, cb) => {
  const {
    _json: { id, profile_image: avatarUrl, nickname: name, email },
  } = profile;
  try {
    const user = await User.findOne({ email });
    if (user) {
      user.naverId = id;
      user.save();
      return cb(null, user);
    }
    const newUser = await User.create({
      name,
      email,
      naverId: id,
      avatarUrl,
    });
    return cb(null, newUser);
  } catch (error) {
    return cb(error);
  }
};

export const postNaverLogin = (req, res) => {
  res.redirect(routes.home);
};

// Facebook Login
// export const facebookLogin = passport.authenticate("facebook");

// export const facebookLoginCallback = async (_, __, profile, cb) => {
//   const {
//     _json: { id, name, email },
//   } = profile;
//   try {
//     const user = await User.findOne({ email });
//     if (user) {
//       user.facebookId = id;
//       user.avatarUrl = `https://graph.facebook.com/${id}/picture?type=large`;
//       user.save();
//       return cb(null, user);
//     }
//     const newUser = await User.create({
//       name,
//       email,
//       facebookId: id,
//       avatarUrl: `https://graph.facebook.com/${id}/picture?type=large`,
//     });
//     return cb(null, newUser);
//   } catch (error) {
//     return cb(error);
//   }
// };

// export const postFacebookLogin = (req, res) => {
//   res.redirect(routes.home);
// };

// Local Login & Logout
export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "Login" });

export const postLogin = passport.authenticate("local", {
  failureRedirect: routes.login,
  successRedirect: routes.home,
  successFlash: "Welcome",
  failureFlash: "Can't login. Check email or Password",
});

export const logout = (req, res) => {
  req.flash("info", "Logged out, See you next time");
  req.logout();
  res.redirect(routes.home);
};

// Profile
export const getMe = async (req, res) => {
  const {
    user: { id },
  } = req;
  try {
    const user = await User.findById(id).populate("videos");
    res.render("userDetail", { pageTitle: "User Detail", user });
  } catch (error) {
    res.redirect(routes.home);
  }
};

export const userDetail = async (req, res) => {
  const {
    params: { id },
  } = req;
  try {
    const user = await User.findById(id).populate("videos");
    if (user.avatarUrl.search(/[upload]/) === 0) {
      user.avatarUrl = `${routes.base}${user.avatarUrl}`;
    }
    res.render("userDetail", { pageTitle: "User Detail", user });
  } catch (error) {
    req.flash("error", "User not found");
    res.redirect(routes.home);
  }
};
export const getEditProfile = (req, res) =>
  res.render("editProfile", { pageTitle: "Edit Profile" });

export const postEditProfile = async (req, res) => {
  const {
    body: { name, email },
    file,
  } = req;
  try {
    await User.findByIdAndUpdate(req.user.id, {
      name,
      email,
      avatarUrl: file ? file.location : req.user.avatarUrl,
    });
    req.flash("success", "Profile updated");
    res.redirect(routes.me);
  } catch (error) {
    req.flash("error", "Can't update profile");
    res.redirect(routes.editProfile);
  }
};

export const getChangePassword = (req, res) =>
  res.render("changePassword", { pageTitle: "Change Password" });

export const postChangePassword = async (req, res) => {
  const {
    body: { oldPassword, newPassword, newPassword1 },
  } = req;
  try {
    if (newPassword !== newPassword1) {
      req.flash("error", "Passwords don't match");
      res.status(400);
      res.redirect(`/users/${routes.changePassword}`);
      return;
    }
    await req.user.changePassword(oldPassword, newPassword);
    res.redirect(routes.me);
  } catch (error) {
    req.flash("error", "Can't change password");
    res.status(400);
    res.redirect(`/users/${routes.changePassword}`);
  }
};
