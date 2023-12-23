import React, { useState } from 'react';
import axios from 'axios';
import './MyForm.css'; // Import your CSS file

const YourComponent = () => {
  const [grandTotal, setGrandTotal] = useState(0);
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState('1970-01-01');
  const [endDate, setEndDate] = useState('9999-12-31');
  const [imageDataUrls, setImageDataUrls] = useState([]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`http://localhost:8082/AccountsPayable/data?startDate=${startDate}&endDate=${endDate}`);
      const responseData = response.data;
      setData(responseData);

      // Calculate the grand total
      const total = responseData.reduce((accumulator, item) => accumulator + item.glpaidamount, 0);
      setGrandTotal(total);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatCurrency = (number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(number);
  };

  const formatImage = async (glvoucherno, index) => {
//    var inputNumber = parseInt(glvoucherno, 0);
    try {
      const response1 = await fetch(`http://localhost:8082/AccountsPayable/${glvoucherno}`);
      const imageBlob = await response1.blob();
      const reader = new FileReader();
      reader.onload = () => {
        setImageDataUrls((prevImageUrls) => {
          const newImageUrls = [...prevImageUrls];
          newImageUrls[index] = reader.result;
          return newImageUrls;
        });
      };
      reader.readAsDataURL(imageBlob);
    } catch (error) {
      console.error('Error fetching image:', error);
      setImageDataUrls((prevImageUrls) => {
        const newImageUrls = [...prevImageUrls];
        newImageUrls[index] = '';
        return newImageUrls;
      });
    }
  };

  return (
    <div className="accounts-payables">
      <label><h2>GENERAL LEDGER - DEBIT ENTRIES</h2></label>
      <label>Start Date: <input type="date" onChange={(e) => setStartDate(e.target.value)} /></label>
      <label>End Date: <input type="date" onChange={(e) => setEndDate(e.target.value)} /></label>
      <label><h2> </h2></label>
      <button onClick={fetchData}>Fetch Data</button>
      <label><h2> </h2></label>
      <table>
        <thead>
          <tr>
            <th>Voucher No</th>
            <th>Date</th>
            <th>Expense Type</th>
            <th>Paid To</th>
            <th>Amount</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.glvoucherno}>
              <td><a href="#" onClick={() => formatImage(item.glvoucherno, index)}>{item.glvoucherno}</a></td>
              <td>{formatDate(item.gldate)}</td>
              <td>{item.glexpensetype}</td>
              <td>{item.glpaidto}</td>
              <td>{formatCurrency(item.glpaidamount)}</td>
              <td><img src={imageDataUrls[index]} width="50" height="50" alt="Fetched" /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <label><h2>Grand Total: {formatCurrency(grandTotal)}</h2></label>
    </div>
  );
};

export default YourComponent;
