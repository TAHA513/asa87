// أجب بإيجاز وبشكل ودي وطبيعي على هذا السؤال باللغة العربية: نعم نفذها كلها في النضام

// واجهة React لـ أجب بإيجاز وبشكل ودي وطبيعي على هذا السؤال باللغة العربية: نعم نفذها كلها في النضام
import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { styled } from '@mui/system';

const StyledBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[3],
  marginBottom: theme.spacing(4),
}));

export default function () {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // جلب البيانات من الخادم
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/data');
      const result = await response.json();
      setData(result);
      setLoading(false);
    } catch (err) {
      setError('حدث خطأ أثناء جلب البيانات');
      setLoading(false);
      console.error(err);
    }
  };

  return (
    <div dir="rtl">
      <Typography variant="h4" gutterBottom>
        أجب بإيجاز وبشكل ودي وطبيعي على هذا السؤال باللغة العربية: نعم نفذها كلها في النضام
      </Typography>

      <StyledBox>
        {loading ? (
          <Typography>جاري التحميل...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>الاسم</TableCell>
                  <TableCell>الوصف</TableCell>
                  <TableCell>السعر</TableCell>
                  <TableCell>الإجراءات</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.price}</TableCell>
                    <TableCell>
                      <Button variant="contained" size="small" color="primary">
                        تعديل
                      </Button>
                      <Button variant="contained" size="small" color="error" sx={{ mr: 1 }}>
                        حذف
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </StyledBox>

      <Button variant="contained" color="primary" onClick={fetchData}>
        تحديث البيانات
      </Button>
    </div>
  );
}