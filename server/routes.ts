app.post("/api/sales", async (req, res) => {
  if (!req.isAuthenticated()) return res.sendStatus(401);

  try {
    const sale = await storage.createSale({
      ...req.body,
      userId: req.user!.id,
      date: new Date()
    });

    // تمت إزالة تحديث المخزون هنا لأنه يتم في createSale
    res.status(201).json(sale);
  } catch (error) {
    console.error("Error creating sale:", error);
    res.status(500).json({ message: "فشل في إنشاء عملية البيع" });
  }
});