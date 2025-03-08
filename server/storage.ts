async createSale(sale: {
  productId: number;
  quantity: number;
  priceIqd: string;
  discount: string;
  userId: number;
  isInstallment: boolean;
  date: Date;
  customerName?: string;
}): Promise<Sale> {
  try {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, sale.productId));

    if (!product) {
      throw new Error("المنتج غير موجود");
    }

    if (product.stock < sale.quantity) {
      throw new Error(`المخزون غير كافٍ. المتوفر: ${product.stock}`);
    }

    // تحديث المخزون بشكل ذري
    const [updatedProduct] = await db
      .update(products)
      .set({ stock: product.stock - sale.quantity })
      .where(eq(products.id, sale.productId))
      .returning();

    const [newSale] = await db
      .insert(sales)
      .values({
        productId: sale.productId,
        customerId: customerId,
        quantity: sale.quantity,
        priceIqd: sale.priceIqd,
        discount: sale.discount,
        finalPriceIqd: (Number(sale.priceIqd) - Number(sale.discount)).toString(),
        userId: sale.userId,
        isInstallment: sale.isInstallment,
        date: sale.date
      })
      .returning();

    await db.insert(inventoryTransactions).values({
      productId: sale.productId,
      type: "out",
      quantity: sale.quantity,
      reason: "sale",
      reference: `SALE-${newSale.id}`,
      userId: sale.userId,
      date: new Date()
    });

    return newSale;
  } catch (error) {
    console.error("خطأ في إنشاء عملية البيع:", error);
    throw new Error("فشل في إنشاء عملية البيع. " + (error as Error).message);
  }
}