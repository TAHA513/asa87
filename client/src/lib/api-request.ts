export async function apiRequest(method, endpoint, data = null) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // مهم للتعامل مع الكوكيز والجلسات
      body: data ? JSON.stringify(data) : undefined, // استخدام undefined بدلاً من null لمنع إرسال "null" كسلسلة
    };

    // التأكد من أن الرابط يبدأ بـ /api بطريقة صحيحة
    const url = endpoint.startsWith("/api") ? endpoint : `/api${endpoint}`;

    console.log(`Sending ${method} request to ${url}`);
    const response = await fetch(url, options);

    // التعامل مع إعادة التوجيه
    if (response.redirected) {
      console.log(`Redirected to ${response.url}`);
      window.location.href = response.url;
      return;
    }

    // محاولة تحويل البيانات إلى JSON
    let responseData;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      // إذا لم تكن البيانات بتنسيق JSON، احصل على النص
      const text = await response.text();
      responseData = { message: text };
    }

    // التحقق من نجاح الطلب
    if (!response.ok) {
      console.error(`API Error: ${response.status}`, responseData);
      throw { status: response.status, ...responseData };
    }

    return responseData;
  } catch (error) {
    console.error("API Request failed:", error);
    throw error;
  }
}