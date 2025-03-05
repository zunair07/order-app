const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Replace with your actual Lambda Function URL
// const LAMBDA_FUNCTION_URL = "https://gykwbo7bzq7pu4m6alz7e4plja0capkg.lambda-url.us-east-1.on.aws/";
// Retrieve Lambda Function URL from environment variable
const LAMBDA_FUNCTION_URL = process.env.LAMBDA_FUNCTION_URL;
console.log(LAMBDA_FUNCTION_URL)

// if (!LAMBDA_FUNCTION_URL) {
//   console.error("LAMBDA_FUNCTION_URL is not set. Make sure it's available in the environment.");
//   process.exit(1);
// }

// Product List (Dropdown Options)
const products = [
  { name: "Cricket Bat", id: "SPORT123", category: "Sports" },
  { name: "T-Shirt", id: "CLOTH123", category: "Clothing" }
];

app.get('/', (req, res) => {
  let productOptions = products.map(product => 
    `<option value="${product.id},${product.category}">${product.name}</option>`
  ).join('');

  res.send(`
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background-color: #F3F3F3; font-family: Arial, sans-serif;">
      <h2 style="color: #3498DB;">Order Product</h2>
      <form action="/publish" method="POST" style="padding: 20px; border: 1px solid #e0e0e0; background-color: #FFFFFF; border-radius: 5px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); width: 350px;">
        
        <label>Select Product:</label><br>
        <select name="productData" required style="margin-top: 5px; padding: 8px; width: 100%;">
          ${productOptions}
        </select><br><br>

        <label>Quantity Requested:</label><br>
        <input type="number" name="QuantityRequested" required style="margin-top: 5px; padding: 8px; width: 100%;"><br><br>

        <label>Customer Email:</label><br>
        <input type="email" name="CustomerEmail" required style="margin-top: 5px; padding: 8px; width: 100%;"><br><br>

        <input type="submit" value="Send to SNS" style="margin-top: 10px; padding: 10px 20px; background-color: #2ECC71; border: none; color: white; cursor: pointer;">
      </form>
    </div>
  `);
});

app.post('/publish', async (req, res) => {
  const { productData, QuantityRequested, CustomerEmail } = req.body;
  const [ItemID, category] = productData.split(',');

  // Construct query string for GET request
  const queryParams = new URLSearchParams({
    ItemID,
    QuantityRequested,
    CustomerEmail,
    category
  }).toString();

  try {
    const response = await axios.get(`${LAMBDA_FUNCTION_URL}?${queryParams}`);

    res.send(`
      <div style="text-align: center; margin-top: 50px;">
        <h2 style="color: green;">Order sent for processing!</h2>
        <a href="/">Go Back</a>
      </div>
    `);
  } catch (error) {
    console.error("Error publishing message:", error.response ? error.response.data : error.message);
    
    res.send(`
      <div style="text-align: center; margin-top: 50px;">
        <h2 style="color: red;">Error</h2>
        <p>${error.response ? JSON.stringify(error.response.data) : error.message}</p>
        <a href="/">Try Again</a>
      </div>
    `);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
