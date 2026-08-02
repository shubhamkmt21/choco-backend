<?php
// CHOCO BLOSSOM: Order & Notification Engine (Hostinger Ready)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$file = 'orders_vault.json';

function getOrders($file) {
    if (!file_exists($file)) return [];
    return json_decode(file_get_contents($file), true) ?: [];
}

function saveOrders($file, $orders) {
    return file_put_contents($file, json_encode($orders, JSON_PRETTY_PRINT));
}

function sendWhatsapp($phone, $name) {
    $cleanPhone = preg_replace('/\D/', '', $phone);
    if (strlen($cleanPhone) === 10) $cleanPhone = "91" . $cleanPhone;
    else if (strlen($cleanPhone) === 11 && strpos($cleanPhone, '0') === 0) $cleanPhone = "91" . substr($cleanPhone, 1);

    $data = [
        "key" => "df66364294d64d7cbb2031cffb273847",
        "username" => "chocoblossom1089588",
        "name" => "whatsapp",
        "remarks" => "Thank you for choosing *ChocoBlossom.* \n\nYour order is confirmed and is being crafted with care ✨\nOur delivery partner will keep you updated on the shipment 📦",
        "whatsapp" => [
            "to" => $cleanPhone,
            "type" => "template",
            "category" => "UTILITY",
            "recipient_type" => "individual",
            "template" => [
                "namespace" => "",
                "language" => ["policy" => "deterministic", "code" => "en"],
                "name" => "order_msg"
            ]
        ]
    ];

    $ch = curl_init('https://services.kit19.com/IMS/Whatsapp/Template');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    $response = curl_exec($ch);
    curl_close($ch);
    return $response;
}

function sendEmail($email, $name, $order) {
    if (empty($email)) return false;

    $orderId = $order['id'];
    $subject = "Tax Invoice for Order #$orderId - Choco Blossom 🍫";
    
    // Parse address
    $addr = $order['shipping_address'] ?? [];
    if (is_string($addr)) {
        $addr = json_decode($addr, true) ?: [];
    }
    $addressStr = "";
    if (is_array($addr)) {
        $addressStr = ($addr['street'] ?? '') . ", " . ($addr['city'] ?? '') . ", " . ($addr['state'] ?? '') . " - " . ($addr['pincode'] ?? '');
    } else {
        $addressStr = $addr;
    }

    // Format items
    $items = $order['items'] ?? [];
    if (is_string($items)) {
        $items = json_decode($items, true) ?: [];
    }
    
    $itemsHtml = "";
    $subtotal = 0;
    if (is_array($items)) {
        foreach ($items as $item) {
            $itemName = htmlspecialchars($item['name']);
            $itemQty = (int)$item['quantity'];
            $itemPrice = (float)$item['price'];
            $itemTotal = $itemPrice * $itemQty;
            $subtotal += $itemTotal;
            
            $formattedPrice = number_format($itemPrice, 2);
            $formattedTotal = number_format($itemTotal, 2);
            
            $itemsHtml .= "
                <tr>
                    <td style='padding: 10px; border-bottom: 1px solid #eee;'>$itemName</td>
                    <td style='padding: 10px; border-bottom: 1px solid #eee; text-align: center;'>$itemQty</td>
                    <td style='padding: 10px; border-bottom: 1px solid #eee; text-align: right;'>₹$formattedPrice</td>
                    <td style='padding: 10px; border-bottom: 1px solid #eee; text-align: right;'>₹$formattedTotal</td>
                </tr>
            ";
        }
    }

    $totalAmountVal = (float)$order['total_amount'];
    $shippingCharge = $totalAmountVal - $subtotal;
    if ($shippingCharge < 0) $shippingCharge = 0;

    $formattedSubtotal = number_format($subtotal, 2);
    $formattedShipping = number_format($shippingCharge, 2);
    $formattedTotal = number_format($totalAmountVal, 2);

    $paymentMethod = htmlspecialchars(strtoupper($order['payment_method'] ?? 'Razorpay'));
    $paymentStatus = htmlspecialchars($order['payment_status'] ?? 'Paid');
    $transactionId = htmlspecialchars($order['transaction_id'] ?? 'N/A');

    $message = "
    <html>
    <head>
        <title>Order Tax Invoice</title>
        <meta charset='utf-8'>
    </head>
    <body style=\"font-family: 'Segoe UI', Arial, sans-serif; background-color: #faf6f0; color: #2D1B18; margin: 0; padding: 20px;\">
        <div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e7d8c9; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.03);'>
            <!-- Header -->
            <div style='background-color: #5D4037; padding: 30px; text-align: center; color: #ffffff;'>
                <h1 style='margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px;'>Choco Blossom</h1>
                <p style='margin: 5px 0 0 0; font-size: 14px; color: #d7ccc8;'>TAX INVOICE / RECEIPT</p>
            </div>
            <!-- Body -->
            <div style='padding: 30px;'>
                <p style='font-size: 16px; line-height: 1.6; margin-top: 0;'>Dear <strong>" . htmlspecialchars($name) . "</strong>,</p>
                <p style='font-size: 14px; line-height: 1.6;'>Thank you for shopping with Choco Blossom. Your order has been successfully placed. Please find your official purchase invoice details below:</p>
                
                <!-- Invoice Details Grid -->
                <table style='width: 100%; font-size: 13px; margin: 20px 0; border-collapse: collapse;'>
                    <tr>
                        <td style='vertical-align: top; width: 50%; padding-right: 10px;'>
                            <h4 style='margin: 0 0 5px 0; color: #5D4037;'>Billed To:</h4>
                            <strong>" . htmlspecialchars($name) . "</strong><br>
                            Email: " . htmlspecialchars($email) . "<br>
                            Phone: " . htmlspecialchars($order['customer_phone'] ?? '') . "<br>
                            Address: " . htmlspecialchars($addressStr) . "
                        </td>
                        <td style='vertical-align: top; width: 50%; padding-left: 10px; border-left: 1px solid #eee;'>
                            <h4 style='margin: 0 0 5px 0; color: #5D4037;'>Invoice Details:</h4>
                            <strong>Invoice No:</strong> #CB-INV-$orderId<br>
                            <strong>Date:</strong> " . date('d M Y, h:i A') . "<br>
                            <strong>Payment Method:</strong> $paymentMethod<br>
                            <strong>Payment Status:</strong> $paymentStatus<br>
                            <strong>Txn ID:</strong> $transactionId
                        </td>
                    </tr>
                </table>

                <!-- Items Table -->
                <h3 style='color: #5D4037; border-bottom: 2px solid #5D4037; padding-bottom: 5px; margin-top: 25px; font-size: 15px;'>Invoice Summary</h3>
                <table style='width: 100%; border-collapse: collapse; font-size: 13px;'>
                    <thead>
                        <tr style='background: #f5ece1; color: #5D4037;'>
                            <th style='padding: 10px; text-align: left;'>Item Description</th>
                            <th style='padding: 10px; text-align: center; width: 50px;'>Qty</th>
                            <th style='padding: 10px; text-align: right; width: 80px;'>Unit Price</th>
                            <th style='padding: 10px; text-align: right; width: 90px;'>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        $itemsHtml
                        <tr>
                            <td colspan='3' style='padding: 10px 10px 5px 10px; text-align: right; font-weight: bold; color: #555;'>Subtotal:</td>
                            <td style='padding: 10px 10px 5px 10px; text-align: right; color: #555;'>₹$formattedSubtotal</td>
                        </tr>
                        <tr>
                            <td colspan='3' style='padding: 5px 10px 5px 10px; text-align: right; font-weight: bold; color: #555;'>Shipping & Handling:</td>
                            <td style='padding: 5px 10px 5px 10px; text-align: right; color: #555;'>₹$formattedShipping</td>
                        </tr>
                        <tr style='border-top: 1px solid #ddd;'>
                            <td colspan='3' style='padding: 15px 10px 10px 10px; text-align: right; font-weight: bold; font-size: 14px;'>Grand Total Paid:</td>
                            <td style='padding: 15px 10px 10px 10px; text-align: right; font-weight: bold; font-size: 16px; color: #5D4037;'>₹$formattedTotal</td>
                        </tr>
                    </tbody>
                </table>

                <p style='font-size: 14px; line-height: 1.6; margin-top: 30px;'>Our chocolatiers are preparing your order. You will receive a shipment notification once it's on the way!</p>
                
                <p style='font-size: 13px; line-height: 1.6; color: #666;'>For support or queries, email us at <a href='mailto:chocoblossom12@gmail.com' style='color: #5D4037; text-decoration: underline;'>chocoblossom12@gmail.com</a>.</p>
            </div>
            <!-- Footer -->
            <div style='background-color: #faf6f0; text-align: center; padding: 20px; font-size: 12px; color: #777; border-top: 1px solid #e7d8c9;'>
                <p style='margin: 0;'>&copy; " . date('Y') . " Choco Blossom India. All rights reserved.</p>
                <p style='margin: 5px 0 0 0;'>Thank you for choosing Choco Blossom 🍫❤️</p>
            </div>
        </div>
    </body>
    </html>
    ";

    // Set headers
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= 'From: Choco Blossom <orders@chocoblossomindia.com>' . "\r\n";
    $headers .= 'Reply-To: chocoblossom12@gmail.com' . "\r\n";
    $headers .= 'X-Mailer: PHP/' . phpversion();

    return mail($email, $subject, $message, $headers);
}

function sendOrderStatusEmail($email, $name, $orderId, $status) {
    if (empty($email)) return false;

    $statusTitle = ucfirst($status);
    $subject = "Order #$orderId Status Update: $statusTitle 🍫";

    // Friendly messages based on status
    $statusDescription = "";
    switch (strtolower($status)) {
        case 'processing':
            $statusDescription = "Our chocolatiers are currently crafting your premium chocolates with care. They will be ready to ship very soon! 🍫✨";
            break;
        case 'shipped':
            $statusDescription = "Exciting news! Your sweet package is now on the way and has been handed over to our delivery partner. 🚚💨";
            break;
        case 'delivered':
            $statusDescription = "Yay! Your delicious chocolates have been successfully delivered. We hope they bring a smile to your face! We'd love to hear your feedback. 🍫❤️";
            break;
        case 'pending':
        default:
            $statusDescription = "Your order status has been set to Pending. We are verifying details and will begin preparation shortly.";
            break;
    }

    $message = "
    <html>
    <head>
        <title>Order Status Update</title>
        <meta charset='utf-8'>
    </head>
    <body style=\"font-family: 'Segoe UI', Arial, sans-serif; background-color: #faf6f0; color: #2D1B18; margin: 0; padding: 20px;\">
        <div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e7d8c9; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.03);'>
            <!-- Header -->
            <div style='background-color: #5D4037; padding: 30px; text-align: center; color: #ffffff;'>
                <h1 style='margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px;'>Choco Blossom</h1>
                <p style='margin: 5px 0 0 0; font-size: 14px; color: #d7ccc8;'>Order Status Update</p>
            </div>
            <!-- Body -->
            <div style='padding: 30px;'>
                <p style='font-size: 16px; line-height: 1.6; margin-top: 0;'>Dear <strong>" . htmlspecialchars($name) . "</strong>,</p>
                <p style='font-size: 14px; line-height: 1.6;'>We are writing to let you know that the status of your order <strong>#$orderId</strong> has been updated.</p>
                
                <!-- Status Badge -->
                <div style='text-align: center; margin: 25px 0;'>
                    <span style='background-color: #f5ece1; color: #5D4037; font-size: 18px; font-weight: bold; padding: 10px 25px; border-radius: 50px; border: 1px dashed #5D4037; display: inline-block; text-transform: uppercase; letter-spacing: 1px;'>
                        $statusTitle
                    </span>
                </div>

                <!-- Status details description -->
                <div style='background: #faf6f0; border-radius: 8px; padding: 20px; text-align: center; line-height: 1.6; font-size: 14px; border: 1px solid #e7d8c9;'>
                    $statusDescription
                </div>

                <p style='font-size: 14px; line-height: 1.6; margin-top: 30px;'>If you have any questions or concerns regarding this update, please don't hesitate to reach out to us at <a href='mailto:chocoblossom12@gmail.com' style='color: #5D4037; text-decoration: underline;'>chocoblossom12@gmail.com</a>.</p>
            </div>
            <!-- Footer -->
            <div style='background-color: #faf6f0; text-align: center; padding: 20px; font-size: 12px; color: #777; border-top: 1px solid #e7d8c9;'>
                <p style='margin: 0;'>&copy; " . date('Y') . " Choco Blossom India. All rights reserved.</p>
                <p style='margin: 5px 0 0 0;'>Crafting premium artisanal chocolates with love 🍫❤️</p>
            </div>
        </div>
    </body>
    </html>
    ";

    // Set headers
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= 'From: Choco Blossom <orders@chocoblossomindia.com>' . "\r\n";
    $headers .= 'Reply-To: chocoblossom12@gmail.com' . "\r\n";
    $headers .= 'X-Mailer: PHP/' . phpversion();

    return mail($email, $subject, $message, $headers);
}

$method = $_SERVER['REQUEST_METHOD'];
$auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

switch ($method) {
    case 'GET':
        // Admin Auth Check
        if ($auth !== 'Bearer admin123') {
            http_response_code(401);
            echo json_encode(["error" => "Unauthorized"]);
            exit;
        }
        $orders = getOrders($file);
        echo json_encode(["message" => "success", "data" => $orders]);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || !isset($input['customer_name']) || !isset($input['total_amount'])) {
            http_response_code(400);
            echo json_encode(["error" => "Missing required fields"]);
            exit;
        }

        $orders = getOrders($file);
        $newOrder = [
            "id" => count($orders) + 1,
            "customer_name" => $input['customer_name'],
            "customer_phone" => $input['customer_phone'] ?? '',
            "customer_email" => $input['customer_email'] ?? '',
            "shipping_address" => $input['shipping_address'] ?? [],
            "greetings" => $input['greetings'] ?? '',
            "delivery_type" => $input['delivery_type'] ?? 'regular',
            "delivery_date" => $input['delivery_date'] ?? '',
            "total_amount" => $input['total_amount'],
            "items" => $input['items'],
            "payment_status" => $input['payment_status'] ?? 'Pending',
            "transaction_id" => $input['transaction_id'] ?? '',
            "payment_method" => $input['payment_method'] ?? 'Unknown',
            "status" => 'pending',
            "created_at" => date('c')
        ];

        array_unshift($orders, $newOrder);
        if (saveOrders($file, $orders)) {
            if (!empty($newOrder['customer_phone'])) {
                sendWhatsapp($newOrder['customer_phone'], $newOrder['customer_name']);
            }
            if (!empty($newOrder['customer_email'])) {
                sendEmail($newOrder['customer_email'], $newOrder['customer_name'], $newOrder);
            }
            echo json_encode(["message" => "success", "orderId" => $newOrder['id']]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Vault Write Error"]);
        }
        break;

    case 'PUT':
        if ($auth !== 'Bearer admin123') {
            http_response_code(401);
            echo json_encode(["error" => "Unauthorized"]);
            exit;
        }
        $id = (int)$_GET['id'];
        $input = json_decode(file_get_contents('php://input'), true);
        $orders = getOrders($file);
        $found = false;
        $updatedOrder = null;

        foreach ($orders as &$o) {
            if ($o['id'] === $id) {
                $o['status'] = $input['status'];
                $found = true;
                $updatedOrder = $o;
                break;
            }
        }

        if ($found && saveOrders($file, $orders)) {
            if ($updatedOrder && !empty($updatedOrder['customer_email'])) {
                sendOrderStatusEmail($updatedOrder['customer_email'], $updatedOrder['customer_name'], $updatedOrder['id'], $updatedOrder['status']);
            }
            echo json_encode(["message" => "success"]);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Order not found"]);
        }
        break;

    case 'DELETE':
        if ($auth !== 'Bearer admin123') {
            http_response_code(401);
            echo json_encode(["error" => "Unauthorized"]);
            exit;
        }
        if (isset($_GET['reset'])) {
            saveOrders($file, []);
            echo json_encode(["message" => "All orders deleted successfully"]);
        }
        break;
}
?>
