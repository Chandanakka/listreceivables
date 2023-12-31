import React, { useState } from 'react';
import axios from 'axios';
import './MyForm.css';

const YourComponent = () => {
  // State variables using the useState hook
  const [grandTotal, setGrandTotal] = useState(0);
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState('2017-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [imageDataUrls, setImageDataUrls] = useState([]);

  // Function to fetch data from the server based on start and end dates
  const fetchData = async () => {
    try {
      const response = await axios.get(`http://192.168.0.179:8081/AccountsReceivable/data?startDate=${startDate}&endDate=${endDate}`);
      let responseData = response.data;

      // Sort the data in descending order based on the date
      responseData = responseData.sort((a, b) => new Date(b.gldate) - new Date(a.gldate));

      // Set state with the sorted and fetched data
      setData(responseData);

      // Calculate the grand total from the fetched data
      const total = responseData.reduce((accumulator, item) => accumulator + item.glreceivedamount, 0);
      setGrandTotal(total);

    } catch (error) {
      // Handle errors during data fetching
      console.error('Error fetching data:', error);
    }
  };

  // Helper function to format date in a readable way
  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper function to format currency using Intl.NumberFormat
  const formatCurrency = (number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(number);
  };

  // Function to fetch and display image data based on voucher number
  const formatImage = async (glreceiptchequeno, index) => {
    try {
      const response1 = await fetch(`http://localhost:8081/AccountsReceivable/${glreceiptchequeno}`);
      const imageBlob = await response1.blob();
      const reader = new FileReader();

      // Set the image data URL in the state
      reader.onload = () => {
        setImageDataUrls((prevImageUrls) => {
          const newImageUrls = [...prevImageUrls];
          newImageUrls[index] = reader.result;
          return newImageUrls;
        });
      };

      // Read the image blob as data URL
      reader.readAsDataURL(imageBlob);
    } catch (error) {
      // Handle errors during image fetching
      console.error('Error fetching image:', error);

      // Set an empty URL in case of error
      setImageDataUrls((prevImageUrls) => {
        const newImageUrls = [...prevImageUrls];
        newImageUrls[index] = '';
        return newImageUrls;
      });
    }
  };

  // Component rendering
  return (
    <div className="accounts-payables">
      {/* Section for date inputs and fetch button */}
      <h2>GENERAL LEDGER - CREDIT ENTRIES</h2>
      <label>Start Date: <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>
      <label>End Date: <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></label>
      <button onClick={fetchData}>Fetch Data</button>

      {/* Table to display fetched data */}
      <table>
        <thead>
          <tr>
            <th>Recewipt/Cheque No</th>
            <th>Date</th>
            <th>Receipts Type</th>
            <th>Received From</th>
            <th>Amount</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody>
          {/* Map through the data to render rows */}
          {data.map((item, index) => (
            <tr key={item.glreceiptchequeno}>
              {/* Clickable Voucher No to trigger image fetching */}
              <td><a href="#" onClick={() => formatImage(item.glreceiptchequeno, index)}>{item.glreceiptchequeno}</a></td>
              <td>{formatDate(item.gldate)}</td>
              <td>{item.glreceipttype}</td>
              <td>{item.glreceivedfrom}</td>
              <td>{formatCurrency(item.glreceivedamount)}</td>
              <td><img src={imageDataUrls[index]} width="50" height="50" alt="Fetched" /></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Display the grand total */}
      <h2>Grand Total: {formatCurrency(grandTotal)}</h2>
    </div>
  );
};

export default YourComponent;
