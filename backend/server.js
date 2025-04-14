// server.js (Optimized for MS SQL Server, Azure Hosting)

const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet'); // <<< Security headers
const winston = require('winston'); // <<< Logging library
const { Joi, celebrate, Segments, errors } = require('celebrate'); // <<< Input validation
require('dotenv').config();

// --- Logger Setup ---
const logger = winston.createLogger({
    level: 'info', // Log info and above (warn, error)
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }), // Log stack traces
        winston.format.json() // Log in JSON format (good for Azure Monitor)
    ),
    transports: [
        // In production, you'd likely remove the console transport
        // or configure it differently, and rely on Azure Monitor.
        new winston.transports.Console({
             format: winston.format.simple(), // Easier to read in dev console
             level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info' // Show more in dev
        }),
        // Add file transport or Azure Monitor transport here if needed
    ],
    exceptionHandlers: [
         // Log unhandled exceptions (but ideally catch them sooner)
        new winston.transports.Console()
    ],
    rejectionHandlers: [
        // Log unhandled promise rejections
         new winston.transports.Console()
    ]
});

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(helmet()); // Apply security headers
app.use(cors()); // Configure CORS options properly for production if needed
app.use(bodyParser.json());

// --- MS SQL Connection Configuration (Azure SQL Database) ---
const sqlConfig = {
    user: process.env.DB_USER || 'n2klogistics2024',
    password: process.env.DB_PASSWORD || 'n2k$4logistics',
    database: process.env.DB_NAME || 'db_main',
    server: process.env.DB_SERVER || 'n2k.database.windows.net',
    port: 1433,
    pool: {
        // <<< Tune max based on Azure SQL tier limits & expected load
        max: parseInt(process.env.DB_POOL_MAX || '10', 10),
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true, // Required for Azure SQL
        trustServerCertificate: false, // Recommended for security
        // connectTimeout: 30000 // Optional
    }
};

// Global variable to hold the connection pool
let pool = null;
let server = null; // To hold the HTTP server instance for graceful shutdown

// --- Database Setup & Helpers ---

// <<< CRITICAL CHANGE: Use Database Identity/Sequence for IDs >>>
// --- Remove initializeOrderIdCounter and generateOrderId ---
// Assume your 'orders' table's 'id' column is now an IDENTITY column in SQL Server
// CREATE TABLE orders (
//    id INT IDENTITY(1,1) PRIMARY KEY, -- <<< Use IDENTITY or a SEQUENCE
//    lr_number VARCHAR(50) UNIQUE NOT NULL, -- Ensure LR Number is unique
//    ... other columns
// );

// Function to get a connection from the pool (optional, but can add specific logic)
async function getConnection() {
    if (!pool) {
        throw new Error("Connection pool not available");
    }
    // pool.request() gets a connection implicitly, but this pattern is fine too
    return pool.connect();
}

// LR Number Generation (Now needs the generated ID)
const generateLRNumber = (fromDistrict, orderId) => {
    const districtCode = typeof fromDistrict === 'string' && fromDistrict.length > 0
                         ? fromDistrict.charAt(0).toUpperCase()
                         : 'X';
    // <<< Ensure ID is part of the format
    return `N2K${districtCode}${orderId}`;
};

// --- Reference Data Fetching (Mostly unchanged, added logging) ---
async function getReferenceDataInternal(tableName) { // Renamed to avoid conflict
     if (!pool) throw new Error('Database pool not ready');
     const safeTableName = tableName.replace(/[^a-zA-Z0-9_]/g, ''); // Basic sanitization
     const result = await pool.request().query(`SELECT id, name FROM ${safeTableName}`);
     return result.recordset;
}
async function getReferenceDataWithColorInternal(tableName) {
     if (!pool) throw new Error('Database pool not ready');
     const safeTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '');
     const result = await pool.request().query(`SELECT id, name, color FROM ${safeTableName}`);
     return result.recordset;
}

// Wrappers for routes with error handling
async function handleRefDataRequest(fetchFunc, tableName, res, next) {
    try {
        const data = await fetchFunc(tableName);
        res.json(data);
    } catch (error) {
        logger.error(`Error fetching ${tableName}: ${error.message}`, { error });
        // Pass error to centralized handler
        next(new Error(`Failed to fetch ${tableName}`));
    }
}

app.get('/api/routes', (req, res, next) => handleRefDataRequest(getReferenceDataInternal, 'routes', res, next));
app.get('/api/payment-methods', (req, res, next) => handleRefDataRequest(getReferenceDataInternal, 'payment_methods', res, next));
app.get('/api/terms-of-delivery', (req, res, next) => handleRefDataRequest(getReferenceDataInternal, 'terms_of_delivery', res, next));
app.get('/api/item-types', (req, res, next) => handleRefDataRequest(getReferenceDataInternal, 'item_types', res, next));
app.get('/api/order-status', (req, res, next) => handleRefDataRequest(getReferenceDataWithColorInternal, 'order_status', res, next));


// --- Route Performance & Stats (Optimized Date Query Note, Added Validation) ---

// Validation Schema for date ranges
const dateRangeSchema = {
    [Segments.QUERY]: Joi.object({
        // <<< Validate input dates
        startDate: Joi.date().iso().required(),
        endDate: Joi.date().iso().required(),
    })
};

app.get('/api/route-performance', celebrate(dateRangeSchema), async (req, res, next) => {
    if (!pool) return next(new Error('Database pool not ready')); // Use next for consistency
    const { startDate, endDate } = req.query;

    try {
        const routeResult = await pool.request().query(`SELECT id, name FROM routes`);
        const routeMap = new Map(routeResult.recordset.map(r => [r.id, r.name]));

        // <<< Note: Using o.created_at >= @startDate AND o.created_at < DATEADD(day, 1, @endDate)
        // might be more index-friendly if @endDate represents the end of the day.
        // Keeping CAST for now, but monitor performance.
        const performanceResult = await pool.request()
            .input('startDate', sql.Date, startDate)
            .input('endDate', sql.Date, endDate)
            .query(`
              SELECT
                CAST(o.created_at AS DATE) as date,
                o.route_id,
                COUNT(o.id) as deliveries,
                AVG(CAST(CASE /* ... efficiency logic ... */
                      WHEN os.name = 'Delivered' THEN 100.0
                      WHEN os.name = 'In Transit' THEN 75.0
                      WHEN os.name IN ('Pending', 'Processing') THEN 50.0
                      ELSE 25.0
                    END AS DECIMAL(5,1))) as efficiency
              FROM orders o
              JOIN order_status os ON o.status_id = os.id
              WHERE CAST(o.created_at AS DATE) BETWEEN @startDate AND @endDate
              GROUP BY CAST(o.created_at AS DATE), o.route_id
              ORDER BY date, o.route_id
            `);

        // ... (JavaScript processing logic remains largely the same) ...
        const performanceData = performanceResult.recordset;
        const resultsByDate = {};
        performanceData.forEach(row => {
            const dateStr = row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date;
            if (!resultsByDate[dateStr]) resultsByDate[dateStr] = {};
            resultsByDate[dateStr][row.route_id] = {
                route: routeMap.get(row.route_id) || `Unknown Route ID: ${row.route_id}`,
                deliveries: row.deliveries,
                efficiency: parseFloat((row.efficiency || 0).toFixed(1))
            };
        });
        const finalResult = [];
        const uniqueDates = [...new Set(performanceData.map(row => row.date instanceof Date ? row.date.toISOString().split('T')[0] : row.date))].sort();
        uniqueDates.forEach(date => {
            const routesForDate = [];
            routeResult.recordset.forEach(route => {
                const performance = resultsByDate[date]?.[route.id];
                routesForDate.push(performance || { route: route.name, deliveries: 0, efficiency: 0 });
            });
            routesForDate.sort((a, b) => a.route.localeCompare(b.route));
            finalResult.push({ date: date, routes: routesForDate });
        });

        res.json(finalResult);
    } catch (error) {
        logger.error('Error fetching route performance data:', { error: error.message, stack: error.stack, query: req.query });
        next(error); // Pass to centralized handler
    }
});

// Validation Schema for trends endpoint
const trendsSchema = {
    [Segments.QUERY]: Joi.object({
        route: Joi.string().required(),
        startDate: Joi.date().iso().required(),
        endDate: Joi.date().iso().required(),
    })
};

app.get('/api/route-performance/trends', celebrate(trendsSchema), async (req, res, next) => {
    if (!pool) return next(new Error('Database pool not ready'));
    const { route, startDate, endDate } = req.query;

    try {
        const result = await pool.request()
            .input('routeName', sql.NVarChar, route) // Use NVarChar for Unicode safety
            .input('startDate', sql.Date, startDate)
            .input('endDate', sql.Date, endDate)
            .query(`
              SELECT
                CAST(o.created_at AS DATE) as date,
                COUNT(o.id) as deliveries,
                AVG(CAST(CASE /* ... efficiency logic ... */
                      WHEN os.name = 'Delivered' THEN 100.0
                      WHEN os.name = 'In Transit' THEN 75.0
                      WHEN os.name IN ('Pending', 'Processing') THEN 50.0
                      ELSE 25.0
                    END AS DECIMAL(5,1))) as efficiency
              FROM orders o
              JOIN routes r ON o.route_id = r.id
              JOIN order_status os ON o.status_id = os.id
              WHERE r.name = @routeName AND CAST(o.created_at AS DATE) BETWEEN @startDate AND @endDate
              GROUP BY CAST(o.created_at AS DATE)
              ORDER BY date
            `);

        res.json(result.recordset.map(day => ({
            date: day.date instanceof Date ? day.date.toISOString().split('T')[0] : day.date,
            deliveries: day.deliveries,
            efficiency: parseFloat((day.efficiency || 0).toFixed(1))
        })));
    } catch (error) {
        logger.error('Error fetching route performance trends:', { error: error.message, stack: error.stack, query: req.query });
        next(error);
    }
});

app.get('/api/routes/stats', async (req, res, next) => {
     if (!pool) return next(new Error('Database pool not ready'));
    try {
        const result = await pool.request().query(`
          SELECT /* ... stats query largely unchanged ... */
            r.id, r.name,
            COUNT(o.id) as total_orders,
            SUM(CASE WHEN os.name = 'Delivered' THEN 1 ELSE 0 END) as delivered_orders,
            SUM(CASE WHEN os.name = 'In Transit' THEN 1 ELSE 0 END) as in_transit_orders,
            SUM(CASE WHEN os.name IN ('Pending', 'Processing') THEN 1 ELSE 0 END) as pending_orders,
            AVG(CAST(CASE /* ... efficiency logic ... */
                      WHEN os.name = 'Delivered' THEN 100.0
                      WHEN os.name = 'In Transit' THEN 75.0
                      WHEN os.name IN ('Pending', 'Processing') THEN 50.0
                      ELSE 25.0
                    END AS DECIMAL(5,1))) as avg_efficiency
          FROM routes r
          LEFT JOIN orders o ON r.id = o.route_id
          LEFT JOIN order_status os ON o.status_id = os.id
          GROUP BY r.id, r.name
          ORDER BY ISNULL(avg_efficiency, 0) DESC -- Handle NULL avg if route has no orders
        `);

        res.json(result.recordset.map(route => ({
            id: route.id,
            name: route.name,
            totalOrders: route.total_orders || 0,
            deliveredOrders: route.delivered_orders || 0,
            inTransitOrders: route.in_transit_orders || 0,
            pendingOrders: route.pending_orders || 0,
            efficiency: parseFloat((route.avg_efficiency || 0).toFixed(1))
        })));
    } catch (error) {
        logger.error('Error fetching route statistics:', { error: error.message, stack: error.stack });
        next(error);
    }
});


// --- Orders CRUD Operations ---

// Helper function to get IDs from names (Parallelized Lookups)
async function getIdsFromNames(names) {
    if (!pool) throw new Error("DB Pool not available in getIdsFromNames");

    const { routeName, paymentMethodName, termsDeliveryName, itemTypeName, statusName } = names;

    const getId = async (tableName, name) => {
        if (!name) return null;
        try {
            const safeTableName = tableName.replace(/[^a-zA-Z0-9_]/g, '');
            const result = await pool.request()
                .input('nameParam', sql.NVarChar, name) // Use NVarChar
                .query(`SELECT TOP 1 id FROM ${safeTableName} WHERE name = @nameParam`);
            return result.recordset.length > 0 ? result.recordset[0].id : null;
        } catch (err) {
            logger.error(`Error fetching ID from ${tableName} for name ${name}: ${err.message}`);
            // Throw or return null - throwing might be better to signal failure clearly
            throw new Error(`Failed lookup for ${tableName} with name ${name}`);
            // return null;
        }
    };

    // <<< Run lookups in parallel
    const [routeId, paymentMethodId, termsDeliveryId, itemTypeId, statusId] = await Promise.all([
        getId('routes', routeName),
        getId('payment_methods', paymentMethodName),
        getId('terms_of_delivery', termsDeliveryName),
        getId('item_types', itemTypeName),
        getId('order_status', statusName) // Ensure statusName is always passed when needed
    ]);

    return { routeId, paymentMethodId, termsDeliveryId, itemTypeId, statusId };
}

// Validation Schema for creating an order
const createOrderSchema = {
    [Segments.BODY]: Joi.object({
        fromName: Joi.string().required(),
        fromAddress: Joi.string().allow('').optional(),
        fromDistrict: Joi.string().allow('').optional(),
        fromPhone: Joi.string().allow('').optional(),
        toName: Joi.string().required(),
        toAddress: Joi.string().allow('').optional(),
        toDistrict: Joi.string().allow('').optional(),
        toPhone: Joi.string().allow('').optional(),
        quantity: Joi.number().integer().min(0).optional().allow(null),
        weight: Joi.number().precision(2).min(0).optional().allow(null),
        itemType: Joi.string().required(), // Name lookup
        invoiceNumber: Joi.string().allow('').optional(),
        invoiceDate: Joi.date().iso().optional().allow(null),
        invoiceValue: Joi.number().precision(2).min(0).optional().allow(null),
        lrCharge: Joi.number().precision(2).min(0).optional().allow(null).default(0),
        frightCharge: Joi.number().precision(2).min(0).optional().allow(null).default(0),
        fuelSurcharge: Joi.number().precision(2).min(0).optional().allow(null).default(0),
        ieCharge: Joi.number().precision(2).min(0).optional().allow(null).default(0),
        doorDeliveryCharge: Joi.number().precision(2).min(0).optional().allow(null).default(0),
        hamali: Joi.number().precision(2).min(0).optional().allow(null).default(0),
        route: Joi.string().required(), // Name lookup
        paymentMethod: Joi.string().required(), // Name lookup
        termsDelivery: Joi.string().required(), // Name lookup
        eWayBill: Joi.string().allow('').optional(),
        // status is usually set server-side on create
    })
};


// Get all orders
app.get('/api/orders', async (req, res, next) => {
    if (!pool) return next(new Error('Database pool not ready'));
    try {
        const result = await pool.request().query(`
          SELECT o.id, o.lr_number, /* ... all required fields ... */
                 o.from_name, o.from_address, o.from_district, o.from_phone,
                 o.to_name, o.to_address, o.to_district, o.to_phone,
                 o.quantity, o.weight, it.name as item_type,
                 o.invoice_number, o.invoice_date, o.invoice_value,
                 o.lr_charge, o.fright_charge, o.fuel_surcharge, o.ie_charge, o.door_delivery_charge, o.hamali,
                 o.eway_bill,
                 r.name as route, pm.name as payment_method, tod.name as terms_of_delivery,
                 os.name as status, os.color as status_color,
                 o.created_at, o.updated_at
          FROM orders o
          LEFT JOIN routes r ON o.route_id = r.id
          LEFT JOIN payment_methods pm ON o.payment_method_id = pm.id
          LEFT JOIN terms_of_delivery tod ON o.terms_of_delivery_id = tod.id
          LEFT JOIN item_types it ON o.item_type_id = it.id
          LEFT JOIN order_status os ON o.status_id = os.id
          ORDER BY o.created_at DESC
        `);
        res.json(result.recordset);
    } catch (error) {
        logger.error('Error fetching orders:', { error: error.message, stack: error.stack });
        next(error);
    }
});

// Get a single order by ID
const orderIdSchema = {
    [Segments.PARAMS]: Joi.object({
        id: Joi.number().integer().positive().required() // Validate ID is positive integer
    })
};
app.get('/api/orders/:id', celebrate(orderIdSchema), async (req, res, next) => {
    if (!pool) return next(new Error('Database pool not ready'));
    const orderId = req.params.id; // Already validated by celebrate

    try {
        const result = await pool.request()
            .input('orderId', sql.Int, orderId)
            .query(`
              SELECT o.id, o.lr_number, /* ... all fields ... */
                     o.from_name, o.from_address, o.from_district, o.from_phone,
                     o.to_name, o.to_address, o.to_district, o.to_phone,
                     o.quantity, o.weight, it.name as item_type,
                     o.invoice_number, o.invoice_date, o.invoice_value,
                     o.lr_charge, o.fright_charge, o.fuel_surcharge, o.ie_charge, o.door_delivery_charge, o.hamali,
                     o.eway_bill,
                     r.name as route, pm.name as payment_method, tod.name as terms_of_delivery,
                     os.name as status, os.color as status_color,
                     o.created_at, o.updated_at
              FROM orders o
              LEFT JOIN routes r ON o.route_id = r.id
              LEFT JOIN payment_methods pm ON o.payment_method_id = pm.id
              LEFT JOIN terms_of_delivery tod ON o.terms_of_delivery_id = tod.id
              LEFT JOIN item_types it ON o.item_type_id = it.id
              LEFT JOIN order_status os ON o.status_id = os.id
              WHERE o.id = @orderId
            `);

        if (result.recordset.length === 0) {
            // Use a specific error type or status for not found
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
         logger.error(`Error fetching order ${orderId}:`, { error: error.message, stack: error.stack, orderId });
        next(error);
    }
});


// Create a new order
// ========================================================================
// WARNING: This version includes a WORKAROUND for the lr_number INSERT issue.
// It inserts a temporary placeholder to bypass the NOT NULL constraint error,
// then updates it with the real value. This masks the root cause.
// Use only if final diagnostics failed and you understand the risks.
// ========================================================================
app.post('/api/orders', celebrate(createOrderSchema), async (req, res, next) => {
  if (!pool) return next(new Error('Database pool not ready'));

  // Data already validated by celebrate middleware
  const orderData = req.body;

  let transaction; // For rolling back if errors occur after transaction start
  try {
      // --- Lookup Foreign Key IDs ---
      const ids = await getIdsFromNames({
          routeName: orderData.route,
          paymentMethodName: orderData.paymentMethod,
          termsDeliveryName: orderData.termsDelivery,
          itemTypeName: orderData.itemType,
          statusName: 'Pending' // Default status
      });

      // Check if all required lookups succeeded
      if (!ids.routeId || !ids.paymentMethodId || !ids.termsDeliveryId || !ids.itemTypeId || !ids.statusId) {
           // This check might be redundant if getIdsFromNames throws, but good defense
           return res.status(400).json({ error: 'Invalid reference data provided.' });
      }

      // <<< Start SQL Transaction >>>
      transaction = new sql.Transaction(pool);
      await transaction.begin();
      const request = new sql.Request(transaction); // Use transaction request

      // --- Prepare Insert Data Inputs ---
      request.input('from_name', sql.NVarChar, orderData.fromName);
      request.input('from_address', sql.NVarChar, orderData.fromAddress);
      request.input('from_district', sql.NVarChar, orderData.fromDistrict);
      request.input('from_phone', sql.VarChar, orderData.fromPhone);
      request.input('to_name', sql.NVarChar, orderData.toName);
      request.input('to_address', sql.NVarChar, orderData.toAddress);
      request.input('to_district', sql.NVarChar, orderData.toDistrict);
      request.input('to_phone', sql.VarChar, orderData.toPhone);
      request.input('quantity', sql.Int, orderData.quantity);
      request.input('weight', sql.Decimal(10, 2), orderData.weight);
      request.input('item_type_id', sql.Int, ids.itemTypeId);
      request.input('invoice_number', sql.VarChar, orderData.invoiceNumber);
      request.input('invoice_date', sql.Date, orderData.invoiceDate);
      request.input('invoice_value', sql.Decimal(18, 2), orderData.invoiceValue);
      request.input('lr_charge', sql.Decimal(10, 2), orderData.lrCharge);
      request.input('fright_charge', sql.Decimal(10, 2), orderData.frightCharge);
      request.input('fuel_surcharge', sql.Decimal(10, 2), orderData.fuelSurcharge);
      request.input('ie_charge', sql.Decimal(10, 2), orderData.ieCharge);
      request.input('door_delivery_charge', sql.Decimal(10, 2), orderData.doorDeliveryCharge);
      request.input('hamali', sql.Decimal(10, 2), orderData.hamali);
      request.input('route_id', sql.Int, ids.routeId);
      request.input('eway_bill', sql.VarChar, orderData.eWayBill);
      request.input('payment_method_id', sql.Int, ids.paymentMethodId);
      request.input('terms_of_delivery_id', sql.Int, ids.termsDeliveryId);
      request.input('status_id', sql.Int, ids.statusId);
      // created_at/updated_at use DB defaults (e.g., DEFAULT GETDATE())

      // <<< START WORKAROUND: Add Placeholder for LR Number >>>
      const placeholderLR = `TEMP-${Date.now()}-${Math.random().toString(16).substring(2, 8)}`;
      request.input('lr_number_placeholder', sql.VarChar(50), placeholderLR); // Define input for the placeholder
      // <<< END WORKAROUND >>>

      // <<< MODIFIED Insert Query (Includes lr_number with placeholder) >>>
      const insertQuery = `
        INSERT INTO orders (
          lr_number, -- <<< ADDED lr_number column
          from_name, from_address, from_district, from_phone, to_name, to_address, to_district, to_phone, quantity,
          weight, item_type_id, invoice_number, invoice_date, invoice_value,
          lr_charge, fright_charge, fuel_surcharge, ie_charge, door_delivery_charge, hamali, route_id, eway_bill, payment_method_id, terms_of_delivery_id, status_id
        )
        OUTPUT INSERTED.id -- <<< Get the generated ID back
        VALUES (
           @lr_number_placeholder, -- <<< ADDED placeholder value
           @from_name, @from_address, @from_district, @from_phone, @to_name, @to_address, @to_district, @to_phone, @quantity,
          @weight, @item_type_id, @invoice_number, @invoice_date, @invoice_value,
          @lr_charge, @fright_charge, @fuel_surcharge, @ie_charge, @door_delivery_charge, @hamali, @route_id, @eway_bill, @payment_method_id, @terms_of_delivery_id, @status_id
        );
      `;
      // <<< END MODIFIED Insert Query >>>

      // Optional: Log before executing
      // logger.info('Executing Insert Query with Placeholder:', { query: insertQuery });

      const result = await request.query(insertQuery);

      // --- Check if Insert Succeeded and Get ID ---
      if (!result.recordset || result.recordset.length === 0 || !result.recordset[0].id) {
           // If OUTPUT clause failed or returned no rows
           throw new Error('Failed to retrieve generated order ID after insert.');
      }
      const generatedOrderId = result.recordset[0].id;

      // --- Generate the REAL LR Number ---
      const lrNumber = generateLRNumber(orderData.fromDistrict, generatedOrderId);
      logger.info(`Order ID ${generatedOrderId} inserted with placeholder, Generated REAL LR Number: ${lrNumber}`);


      // --- Update the order with the REAL generated LR Number ---
      // This overwrites the placeholder value inserted earlier
      const updateRequest = new sql.Request(transaction); // New request within the same transaction
      updateRequest.input('lr_number', sql.VarChar(50), lrNumber); // Use the real LR number
      updateRequest.input('id', sql.Int, generatedOrderId);
      await updateRequest.query('UPDATE orders SET lr_number = @lr_number WHERE id = @id');

      // <<< Commit Transaction >>>
      await transaction.commit();

      logger.info(`Order created successfully: ID=${generatedOrderId}, LR=${lrNumber} (placeholder updated)`);
      // --- Send Success Response ---
      res.status(201).json({
          id: generatedOrderId,
          lr_number: lrNumber, // Return the final, correct LR number
          message: 'Order created successfully'
      });

  } catch (error) {
       // --- Handle Errors ---
       if (transaction && transaction.rolledBack === false) { // Check if already rolled back
          try {
              logger.warn('Rolling back transaction due to error during order creation.');
              await transaction.rollback();
          } catch (rbErr) {
              logger.error('CRITICAL: Error rolling back transaction:', rbErr);
          }
       }
       // Log detailed error information
      logger.error('Error creating order:', {
           error: error.message,
           stack: error.stack,
           body: req.body, // Be cautious logging sensitive data in production
           number: error.number // SQL Server error number
       });

      // Check for specific SQL Server error codes
      if (error.number === 2627 || error.number === 2601) {
           // Unique constraint violation (could be placeholder collision OR real LR number collision now)
           logger.error('Unique constraint violation detected during order creation.', { details: error.message });
           return res.status(409).json({ error: 'Failed to create order. Possible duplicate entry (e.g., LR Number).', details: error.message });
      }

      // Pass other errors to the centralized error handler
      next(error);
  }
}); // End of app.post('/api/orders')


// Validation schema for updating an order (more lenient, allows partial updates)
const updateOrderSchema = {
    [Segments.PARAMS]: Joi.object({
        id: Joi.number().integer().positive().required()
    }),
    [Segments.BODY]: Joi.object({ // Fields are optional for update
        fromName: Joi.string(),
        fromAddress: Joi.string().allow(''),
        fromDistrict: Joi.string().allow(''),
        fromPhone: Joi.string().allow(''),
        toName: Joi.string(),
        toAddress: Joi.string().allow(''),
        toDistrict: Joi.string().allow(''),
        toPhone: Joi.string().allow(''),
        quantity: Joi.number().integer().min(0).allow(null),
        weight: Joi.number().precision(2).min(0).allow(null),
        itemType: Joi.string(), // Name lookup
        invoiceNumber: Joi.string().allow(''),
        invoiceDate: Joi.date().iso().allow(null),
        invoiceValue: Joi.number().precision(2).min(0).allow(null),
        lrCharge: Joi.number().precision(2).min(0).allow(null),
        frightCharge: Joi.number().precision(2).min(0).allow(null),
        fuelSurcharge: Joi.number().precision(2).min(0).allow(null),
        ieCharge: Joi.number().precision(2).min(0).allow(null),
        doorDeliveryCharge: Joi.number().precision(2).min(0).allow(null),
        hamali: Joi.number().precision(2).min(0).allow(null),
        route: Joi.string(), // Name lookup
        paymentMethod: Joi.string(), // Name lookup
        termsDelivery: Joi.string(), // Name lookup
        status: Joi.string(), // Name lookup
        eWayBill: Joi.string().allow(''),
    }).min(1) // Require at least one field to be updated
};

// Update an order
app.put('/api/orders/:id', celebrate(updateOrderSchema), async (req, res, next) => {
    if (!pool) return next(new Error('Database pool not ready'));
    const orderId = req.params.id; // Validated
    const updateData = req.body; // Validated

    try {
        // 1. Check if order exists and get current from_district for LR number check
        const checkResult = await pool.request()
                                .input('id', sql.Int, orderId)
                                .query('SELECT from_district FROM orders WHERE id = @id');

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        const existingOrder = checkResult.recordset[0];

        // 2. Get IDs for any names provided in the update request
        const ids = await getIdsFromNames({ // Pass only the names present in updateData
            routeName: updateData.route,
            paymentMethodName: updateData.paymentMethod,
            termsDeliveryName: updateData.termsDelivery,
            itemTypeName: updateData.itemType,
            statusName: updateData.status
        });

        // 3. Check for invalid lookups *only* if the corresponding name was provided
        let invalidLookups = [];
        if (updateData.route && !ids.routeId) invalidLookups.push(`Route ('${updateData.route}')`);
        if (updateData.paymentMethod && !ids.paymentMethodId) invalidLookups.push(`Payment Method ('${updateData.paymentMethod}')`);
        if (updateData.termsDelivery && !ids.termsDeliveryId) invalidLookups.push(`Terms of Delivery ('${updateData.termsDelivery}')`);
        if (updateData.itemType && !ids.itemTypeId) invalidLookups.push(`Item Type ('${updateData.itemType}')`);
        if (updateData.status && !ids.statusId) invalidLookups.push(`Status ('${updateData.status}')`);

        if (invalidLookups.length > 0) {
             return res.status(400).json({ error: `Invalid reference data: ${invalidLookups.join(', ')} not found.` });
        }

        // 4. Construct the UPDATE query dynamically
        const updateFields = [];
        const request = pool.request();
        request.input('id_where', sql.Int, orderId); // Input for the WHERE clause

        // Helper to add fields/parameters to the request
        function addUpdate(fieldName, sqlDbColumn, value, dataType) {
             // Check if the field exists in the updateData (value !== undefined)
            if (Object.prototype.hasOwnProperty.call(updateData, fieldName)) {
                updateFields.push(`${sqlDbColumn} = @${fieldName}`);
                // Use appropriate SQL type, NVarChar for potentially unicode strings
                const type = dataType === sql.VarChar ? (sqlDbColumn.includes('phone') || sqlDbColumn.includes('bill') ? sql.VarChar : sql.NVarChar) : dataType;
                request.input(fieldName, type, value);
            }
        }
        function addIdUpdate(fieldName, sqlDbColumn, lookupName, lookupId, dataType = sql.Int) {
             // Check if the lookup name exists in updateData
             if (Object.prototype.hasOwnProperty.call(updateData, lookupName)) {
                // ID must be valid (checked earlier)
                updateFields.push(`${sqlDbColumn} = @${fieldName}`);
                request.input(fieldName, dataType, lookupId);
             }
        }

        // Add fields to update list
        addUpdate('fromName', 'from_name', updateData.fromName, sql.VarChar); // Using VarChar helper now maps to NVarChar
        addUpdate('fromAddress', 'from_address', updateData.fromAddress, sql.VarChar);
        addUpdate('fromDistrict', 'from_district', updateData.fromDistrict, sql.VarChar);
        addUpdate('fromPhone', 'from_phone', updateData.fromPhone, sql.VarChar);
        addUpdate('toName', 'to_name', updateData.toName, sql.VarChar);
        addUpdate('toAddress', 'to_address', updateData.toAddress, sql.VarChar);
        addUpdate('toDistrict', 'to_district', updateData.toDistrict, sql.VarChar);
        addUpdate('toPhone', 'to_phone', updateData.toPhone, sql.VarChar);
        addUpdate('quantity', 'quantity', updateData.quantity, sql.Int);
        addUpdate('weight', 'weight', updateData.weight, sql.Decimal(10, 2));
        addUpdate('invoiceNumber', 'invoice_number', updateData.invoiceNumber, sql.VarChar);
        addUpdate('invoiceDate', 'invoice_date', updateData.invoiceDate, sql.Date);
        addUpdate('invoiceValue', 'invoice_value', updateData.invoiceValue, sql.Decimal(18, 2));
        addUpdate('lrCharge', 'lr_charge', updateData.lrCharge, sql.Decimal(10, 2));
        addUpdate('frightCharge', 'fright_charge', updateData.frightCharge, sql.Decimal(10, 2));
        addUpdate('fuelSurcharge', 'fuel_surcharge', updateData.fuelSurcharge, sql.Decimal(10, 2));
        addUpdate('ieCharge', 'ie_charge', updateData.ieCharge, sql.Decimal(10, 2));
        addUpdate('doorDeliveryCharge', 'door_delivery_charge', updateData.doorDeliveryCharge, sql.Decimal(10, 2));
        addUpdate('hamali', 'hamali', updateData.hamali, sql.Decimal(10, 2));
        addUpdate('eWayBill', 'eway_bill', updateData.eWayBill, sql.VarChar);

        // Add ID fields based on successful lookups *if* the name was provided
        addIdUpdate('routeId', 'route_id', 'route', ids.routeId);
        addIdUpdate('paymentMethodId', 'payment_method_id', 'paymentMethod', ids.paymentMethodId);
        addIdUpdate('termsDeliveryId', 'terms_of_delivery_id', 'termsDelivery', ids.termsDeliveryId);
        addIdUpdate('itemTypeId', 'item_type_id', 'itemType', ids.itemTypeId);
        addIdUpdate('statusId', 'status_id', 'status', ids.statusId);

        // Handle LR Number update ONLY if fromDistrict changes
        const newFromDistrict = updateData.fromDistrict !== undefined ? updateData.fromDistrict : existingOrder.from_district;
        const potentialNewLRNumber = generateLRNumber(newFromDistrict, orderId);

        // Need the *current* LR number to compare. Let's re-fetch it or assume it follows the pattern.
        // Safer: Re-generate what the *current* LR should be based on existing data.
        const currentLRNumber = generateLRNumber(existingOrder.from_district, orderId);

        if (updateData.fromDistrict !== undefined && potentialNewLRNumber !== currentLRNumber) {
             // Ensure lr_number column allows updates and handle potential unique constraint errors
            logger.warn(`Updating LR Number for Order ID ${orderId} due to district change.`);
            addUpdate('lrNumber', 'lr_number', potentialNewLRNumber, sql.VarChar);
        }

        if (updateFields.length === 0) {
             // celebrate ensures at least one field is present, so this shouldn't be hit
             return res.json({ message: 'No fields provided to update.' });
        }

        // Add updated_at timestamp
        updateFields.push('updated_at = GETDATE()');

        const sqlQuery = `UPDATE orders SET ${updateFields.join(', ')} WHERE id = @id_where`;

        const result = await request.query(sqlQuery);

        if (result.rowsAffected[0] === 0) {
             // Should have been caught by the 404 check earlier, but safeguard
            logger.warn(`Update query affected 0 rows for Order ID ${orderId}.`);
             return res.status(404).json({ error: 'Order not found or no changes applied.' });
        }

        logger.info(`Order updated successfully: ID=${orderId}`);
        res.json({ message: 'Order updated successfully' });

    } catch (error) {
        logger.error(`Error updating order ${orderId}:`, { error: error.message, stack: error.stack, body: req.body, orderId, number: error.number });
        // Handle potential unique constraint errors if LR number is updated
         if (error.number === 2627 || error.number === 2601) {
             return res.status(409).json({ error: 'Failed to update order. Possible duplicate entry (e.g., LR Number).', details: error.message });
        }
        next(error);
    }
});


// Delete an order
app.delete('/api/orders/:id', celebrate(orderIdSchema), async (req, res, next) => {
    if (!pool) return next(new Error('Database pool not ready'));
    const orderId = req.params.id; // Validated

    try {
        const result = await pool.request()
            .input('orderId', sql.Int, orderId)
            .query('DELETE FROM orders WHERE id = @orderId');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        logger.info(`Order deleted successfully: ID=${orderId}`);
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        // Check for foreign key constraint errors if applicable (e.g., error number 547)
        if (error.number === 547) {
            logger.error(`Error deleting order ${orderId} due to foreign key constraint:`, { error: error.message, orderId });
            return res.status(409).json({ error: 'Cannot delete order. It might be referenced by other records.', details: error.message });
        }
        logger.error(`Error deleting order ${orderId}:`, { error: error.message, stack: error.stack, orderId });
        next(error);
    }
});


// --- Vehicle Allocation (Added Validation) ---
const vehicleAllocationSchema = {
    [Segments.QUERY]: Joi.object({
        weight: Joi.number().min(0).required(),
        quantity: Joi.number().integer().min(0).required(),
    })
};
app.get('/api/vehicle-allocation', celebrate(vehicleAllocationSchema), async (req, res, next) => {
     if (!pool) return next(new Error('Database pool not ready'));
     // Validated by celebrate
     const { weight, quantity } = req.query;

     try {
        const result = await pool.request()
            .input('weight', sql.Decimal(10, 2), weight) // Use validated number
            .input('quantity', sql.Int, quantity)       // Use validated number
            .query(`
              SELECT TOP 1 id, name, max_weight, max_quantity
              FROM vehicles
              WHERE max_weight >= @weight AND max_quantity >= @quantity
              ORDER BY max_weight ASC, max_quantity ASC
            `);

        if (result.recordset.length === 0) {
            logger.warn(`No suitable vehicle found for weight=${weight}, quantity=${quantity}. Finding largest.`);
            const largestResult = await pool.request()
                .query(`
                  SELECT TOP 1 id, name, max_weight, max_quantity
                  FROM vehicles ORDER BY max_weight DESC, max_quantity DESC
                `);

            if (largestResult.recordset.length === 0) {
               logger.error('No vehicles found in the database at all.');
               return res.status(404).json({ error: 'No vehicles found in the database.' });
            }

            return res.json({
                vehicle: largestResult.recordset[0],
                message: 'Warning: Order may exceed capacity of the largest available vehicle.'
            });
        }

        res.json({ vehicle: result.recordset[0] });
     } catch (error) {
        logger.error('Error determining vehicle:', { error: error.message, stack: error.stack, query: req.query });
        next(error);
     }
});

// --- Health Check Endpoint ---
app.get('/health', async (req, res) => {
    try {
        // Optional: Perform a quick DB check
        if (pool) {
            await pool.request().query('SELECT 1 AS db_status');
        } else {
           // Pool not ready yet during startup?
           return res.status(503).json({ status: 'initializing', message: 'Database pool not ready' });
        }
        res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    } catch (dbError) {
        logger.error('Health check failed - DB query error:', { error: dbError.message });
        res.status(503).json({ status: 'unhealthy', reason: 'Database connection failed', error: dbError.message });
    }
});


// --- Centralized Error Handling Middleware ---
// This MUST be defined *after* all other app.use() and routes
app.use(errors()); // Let Celebrate handle its validation errors first

app.use((err, req, res, next) => { // Standard Express error handler signature
    // Log the error internally
    logger.error('Unhandled Error:', {
        error: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method,
        body: req.body, // Be cautious logging sensitive body data
        query: req.query,
        params: req.params,
    });

    // Don't leak stack traces or sensitive details to the client in production
    const statusCode = err.status || err.statusCode || 500; // Use specific status if available
    const message = (process.env.NODE_ENV === 'production' && statusCode === 500)
                    ? 'Internal Server Error'
                    : err.message || 'An unexpected error occurred';

    res.status(statusCode).json({
        error: message,
        // Optionally add an error code or identifier for tracking
        // errorId: generateSomeErrorId()
    });
});


// --- Server Startup and Shutdown ---
async function startServer() {
    try {
        logger.info('Attempting to connect to SQL Server...');
        pool = await sql.connect(sqlConfig);
        logger.info('SQL Server connected successfully.');

        pool.on('error', (err) => {
            // Handle pool errors that might occur after initial connection
            logger.error('SQL Pool Error:', { error: err.message, stack: err.stack });
            // Depending on the error, might need to attempt reconnection or shutdown
        });

        // <<< No need to initialize order counter from DB anymore >>>

        server = app.listen(PORT, () => { // Store server instance
            logger.info(`Server running on port ${PORT}`);
        });

    } catch (err) {
        logger.error('FATAL: Failed to connect to SQL Server on startup:', { error: err.message, stack: err.stack });
        // Optionally: logger.error('DB Config used:', { user: sqlConfig.user, server: sqlConfig.server, database: sqlConfig.database }); // Avoid logging password
        logger.error('Server shutting down due to database connection failure.');
        process.exit(1); // Exit if DB connection fails on startup
    }
}

async function shutdown(signal) {
    logger.warn(`Received ${signal}. Shutting down gracefully...`);

    // 1. Stop accepting new connections
    if (server) {
        server.close(async () => { // Use the callback of server.close
            logger.info('HTTP server closed.');

            // 2. Close DB pool
            if (pool) {
                logger.info('Closing DB pool...');
                try {
                    await pool.close();
                    logger.info('DB pool closed successfully.');
                } catch (err) {
                    logger.error('Error closing DB pool:', { error: err.message, stack: err.stack });
                }
            }

            // 3. Exit process
            logger.info('Shutdown complete.');
            process.exit(0);
        });

         // Force shutdown after a timeout if graceful shutdown takes too long
         setTimeout(() => {
            logger.error('Could not close connections in time, forcing shutdown.');
            process.exit(1);
         }, 10000); // 10 seconds timeout

    } else {
        // If server hasn't started yet or already closed
         if (pool) {
             try { await pool.close(); logger.info('DB pool closed.'); } catch(err) { logger.error('Error closing DB pool during shutdown:', err); }
         }
        process.exit(0);
    }
}

// Handle termination signals
process.on('SIGINT', () => shutdown('SIGINT')); // Ctrl+C
process.on('SIGTERM', () => shutdown('SIGTERM')); // Docker stop, Kubernetes termination etc.
process.on('uncaughtException', (error) => {
    logger.error('UNCAUGHT EXCEPTION! Shutting down...', { error: error.message, stack: error.stack });
    // Perform minimal cleanup if possible, then exit forcefully
    // Avoid async operations here as the process state is unstable
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    logger.error('UNHANDLED PROMISE REJECTION!', { reason, promise });
    // Depending on the severity, you might decide to shut down or just log
    // For now, just log it, but investigate these!
    // Consider shutting down: process.exit(1);
});


// Start the server
startServer();