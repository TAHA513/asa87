export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  try {
    const { method = 'GET', data, params } = options;

    const url = new URL(`${API_BASE_URL}${endpoint}`);

    // إضافة المعلمات إلى عنوان URL
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });
    }

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // للسماح بإرسال ملفات تعريف الارتباط للمصادقة
      cache: 'no-cache', // تعطيل التخزين المؤقت للطلبات
      mode: 'cors', // تفعيل وضع CORS
    };

    // إضافة البيانات للطلبات POST و PUT و PATCH
    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      config.body = JSON.stringify(data);
    }

    console.log(`إرسال طلب ${method} إلى ${url.toString()}`);

    const response = await fetch(url.toString(), config);

    // التحقق من حالة الاستجابة
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`خطأ في الطلب: ${response.status} - ${errorData.message || 'خطأ غير معروف'}`);
      throw new ApiError(
        errorData.message || 'حدث خطأ في الطلب',
        response.status,
        errorData
      );
    }

    // تحقق مما إذا كانت الاستجابة تحتوي على محتوى
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const jsonResponse = await response.json();
      return jsonResponse as T;
    } else if (response.status === 204) {
      // استجابة ناجحة بدون محتوى
      return {} as T;
    }

    return {} as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error('خطأ في طلب API:', error);
    throw new ApiError('حدث خطأ أثناء الاتصال بالخادم', 500);
  }
}

// وظيفة مساعدة للتحقق من حالة الاتصال بالخادم
export async function checkServerConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/check`, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-cache',
    });

    return response.ok;
  } catch (error) {
    console.error('فشل الاتصال بالخادم:', error);
    return false;
  }
}