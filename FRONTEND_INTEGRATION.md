# Tích hợp API tính order_count vào Frontend

## Mục tiêu
Sau khi người dùng nhấn "Báo cáo" trong view `http://localhost:5173/sale-nhap-bao-cao`, tự động gọi API để tính toán `order_count`.

## API Endpoint
```
GET https://lumidataapi.vercel.app/api/calculate-order-count?recordId={recordId}
```

## Cách tích hợp

### Option 1: Gọi API sau khi tạo/sửa record thành công

```javascript
// Sau khi insert/update sales_report thành công
const handleSubmitReport = async (formData) => {
  try {
    // 1. Insert/Update sales_report vào Supabase
    const { data, error } = await supabase
      .from('sales_reports')
      .insert(formData)
      .select()
      .single();
    
    if (error) throw error;
    
    // 2. Gọi API để tính order_count
    const recordId = data.id;
    const response = await fetch(
      `https://lumidataapi.vercel.app/api/calculate-order-count?recordId=${recordId}`
    );
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Order count calculated:', result.data[0].order_count);
      // Có thể show notification hoặc update UI
    } else {
      console.error('❌ Error calculating order_count:', result.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Option 2: Sử dụng React Hook (Ví dụ với React)

```javascript
import { useState } from 'react';

const useCalculateOrderCount = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateOrderCount = async (recordId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `https://lumidataapi.vercel.app/api/calculate-order-count?recordId=${recordId}`
      );
      
      const result = await response.json();
      
      if (result.success) {
        return result.data[0];
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { calculateOrderCount, loading, error };
};

// Sử dụng trong component
const SaleNhapBaoCao = () => {
  const { calculateOrderCount, loading, error } = useCalculateOrderCount();
  
  const handleSubmit = async (formData) => {
    try {
      // Insert vào Supabase
      const { data, error: insertError } = await supabase
        .from('sales_reports')
        .insert(formData)
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      // Tính order_count
      const result = await calculateOrderCount(data.id);
      
      console.log('Order count:', result.order_count);
      // Show success message
      
    } catch (err) {
      console.error('Error:', err);
      // Show error message
    }
  };
  
  return (
    // Your form JSX
  );
};
```

### Option 3: Sử dụng với Vue (Composition API)

```javascript
import { ref } from 'vue';

export const useCalculateOrderCount = () => {
  const loading = ref(false);
  const error = ref(null);

  const calculateOrderCount = async (recordId) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(
        `https://lumidataapi.vercel.app/api/calculate-order-count?recordId=${recordId}`
      );
      
      const result = await response.json();
      
      if (result.success) {
        return result.data[0];
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return { calculateOrderCount, loading, error };
};

// Sử dụng trong component
<script setup>
import { useCalculateOrderCount } from '@/composables/useCalculateOrderCount';

const { calculateOrderCount, loading } = useCalculateOrderCount();

const handleSubmit = async (formData) => {
  try {
    // Insert vào Supabase
    const { data, error: insertError } = await supabase
      .from('sales_reports')
      .insert(formData)
      .select()
      .single();
    
    if (insertError) throw insertError;
    
    // Tính order_count
    const result = await calculateOrderCount(data.id);
    console.log('Order count:', result.order_count);
    
  } catch (err) {
    console.error('Error:', err);
  }
};
</script>
```

### Option 4: Sử dụng với Axios

```javascript
import axios from 'axios';

const calculateOrderCount = async (recordId) => {
  try {
    const response = await axios.get(
      'https://lumidataapi.vercel.app/api/calculate-order-count',
      {
        params: { recordId }
      }
    );
    
    if (response.data.success) {
      return response.data.data[0];
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('Error calculating order_count:', error);
    throw error;
  }
};

// Sử dụng
const handleSubmit = async (formData) => {
  try {
    // Insert vào Supabase
    const { data } = await supabase
      .from('sales_reports')
      .insert(formData)
      .select()
      .single();
    
    // Tính order_count
    const result = await calculateOrderCount(data.id);
    console.log('Order count calculated:', result.order_count);
    
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Ví dụ đầy đủ với React + Supabase

```javascript
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const SaleNhapBaoCao = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    shift: '',
    product: '',
    market: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Insert vào Supabase
      const { data, error: insertError } = await supabase
        .from('sales_reports')
        .insert(formData)
        .select()
        .single();

      if (insertError) throw insertError;

      // 2. Gọi API tính order_count
      const response = await fetch(
        `https://lumidataapi.vercel.app/api/calculate-order-count?recordId=${data.id}`
      );

      const result = await response.json();

      if (result.success) {
        const orderCount = result.data[0].order_count;
        console.log(`✅ Báo cáo đã được tạo với order_count = ${orderCount}`);
        
        // Có thể show notification
        alert(`Báo cáo đã được tạo! Số đơn hàng: ${orderCount}`);
        
        // Reset form hoặc redirect
        setFormData({
          name: '',
          date: '',
          shift: '',
          product: '',
          market: ''
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Tên nhân viên"
      />
      {/* ... other fields ... */}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Đang xử lý...' : 'Báo cáo'}
      </button>
    </form>
  );
};

export default SaleNhapBaoCao;
```

## Xử lý lỗi và Loading state

```javascript
const calculateOrderCount = async (recordId) => {
  try {
    const response = await fetch(
      `https://lumidataapi.vercel.app/api/calculate-order-count?recordId=${recordId}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        data: result.data[0],
        message: result.message
      };
    } else {
      return {
        success: false,
        error: result.message || 'Unknown error'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Network error'
    };
  }
};
```

## Lưu ý

1. **CORS:** API đã được cấu hình CORS, có thể gọi từ bất kỳ domain nào
2. **Error Handling:** Luôn xử lý lỗi và hiển thị thông báo cho người dùng
3. **Loading State:** Hiển thị loading khi đang tính toán
4. **Async/Await:** Sử dụng async/await hoặc Promise để xử lý bất đồng bộ

## Test với record ID cụ thể

```javascript
// Test với record ID: 0000323c-53c0-44c0-a6c1-93d62dd499c0
const testCalculate = async () => {
  const recordId = '0000323c-53c0-44c0-a6c1-93d62dd499c0';
  
  const response = await fetch(
    `https://lumidataapi.vercel.app/api/calculate-order-count?recordId=${recordId}`
  );
  
  const result = await response.json();
  console.log('Result:', result);
};

testCalculate();
```
