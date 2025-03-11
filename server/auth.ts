// تسجيل الخروج
  app.post("/api/auth/logout", (req, res) => {
    req.logout(err => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({
          message: "فشل في تسجيل الخروج",
        });
      }

      // تدمير الجلسة بشكل كامل
      req.session.destroy(err => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).json({
            message: "فشل في إنهاء الجلسة",
          });
        }

        // مسح ملفات تعريف الارتباط
        res.clearCookie('app.session');
        res.json({ message: "تم تسجيل الخروج بنجاح" });
      });
    });
  });

  // إضافة نقطة نهاية للتحقق من حالة الجلسة
  app.get("/api/auth/status", (req, res) => {
    if (req.isAuthenticated()) {
      // عدم إرجاع كلمة المرور
      const { password, ...userInfo } = req.user as User;
      res.json({
        authenticated: true,
        user: userInfo
      });
    } else {
      res.json({
        authenticated: false
      });
    }
  });