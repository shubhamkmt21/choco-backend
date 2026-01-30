<?php
include("../../include/database.php"); 
header("Pragma: no-cache");
header("Cache-Control: no-cache");
header("Expires: 0");



require('lib/config.php');
require('razorpay-php/Razorpay.php');
session_start();

// Create the Razorpay Order

use Razorpay\Api\Api;

$api = new Api($keyId, $keySecret);

//
// We create an razorpay order using orders api
// Docs: https://docs.razorpay.com/docs/orders
$ORDER_ID = $_SESSION['last_order_id']; 
$CUST_ID = 1;
$INDUSTRY_TYPE_ID =  'Retail';
$CHANNEL_ID = 'WEB';
$TXN_AMOUNT = $_SESSION['total_shopcart_amount'];
if(strlen($_SESSION['define_currency_name'])>1){  $TXN_AMOUNT_CURRENCY = $_SESSION['define_currency_name'];    }

if(strlen($TXN_AMOUNT_CURRENCY)<1){ $TXN_AMOUNT_CURRENCY = "INR"; }


$cmobile=$_SESSION['cmobile'];  if(strlen($cmobile)<1){   $cmobile=$dis_seller_profile_company_mobile;  }
$email=$_SESSION['email'];      if(strlen($email)<1){  $email=$dis_seller_profile_company_email;  }

//unset session varaible
unset($_SESSION['last_order_id']);
unset($_SESSION['total_shopcart_amount']);
unset($_SESSION['cmobile']);
unset($_SESSION['email']);




$orderData = [
    'receipt'         => $ORDER_ID,
    'amount'          => $TXN_AMOUNT * 100, // 2000 rupees in paise
    'currency'        => $TXN_AMOUNT_CURRENCY,
    'payment_capture' => 1 // auto capture
];

$razorpayOrder = $api->order->create($orderData);

$razorpayOrderId = $razorpayOrder['id'];

$_SESSION['razorpay_order_id'] = $razorpayOrderId;

$displayAmount = $amount = $orderData['amount'];

if ($displayCurrency !== 'INR')
{
    $url = "https://api.fixer.io/latest?symbols=$displayCurrency&base=INR";
    $exchange = json_decode(file_get_contents($url), true);

    $displayAmount = $exchange['rates'][$displayCurrency] * $amount / 100;
}

$checkout = 'automatic';

//if (isset($_GET['checkout']) and in_array($_GET['checkout'], ['automatic', 'manual'], true))
//{
//    $checkout = $_GET['checkout'];
//}

$data = [
    "key"               => $keyId,
    "amount"            => $amount,
    "name"              => $dis_seller_profile_company_name,
    "description"       => $define_courier_shipment_label_default_product_name,
    "image"             => $define_courier_shipment_label_default_logo,
    "prefill"           => [
    "name"              => "",
    "email"             => $email,
    "contact"           => $cmobile,
    ],
     "theme"             => [
    "color"             => "#F37254"
    ],
    "order_id"          => $razorpayOrderId,
];

if ($displayCurrency !== 'INR')
{
    $data['display_currency']  = $displayCurrency;
    $data['display_amount']    = $displayAmount;
}

$json = json_encode($data);
?>
<html>
<head>
<title>Merchant Check Out Page</title>
</head>
<body>
	<center><h1>Please do not refresh this page...</h1></center>

<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<form name='razorpayform' action="pgResponse.php" method="POST">
    <input type="hidden" name="razorpay_payment_id" id="razorpay_payment_id">
    <input type="hidden" name="razorpay_signature"  id="razorpay_signature" >
    <input type="hidden" name="order_id"  id="order_id" value="<?=$ORDER_ID;?>">
</form>
<script>
// Checkout details as a json
var options = <?php echo $json?>;

/**
 * The entire list of Checkout fields is available at
 * https://docs.razorpay.com/docs/checkout-form#checkout-fields
 */
options.handler = function (response){
    document.getElementById('razorpay_payment_id').value = response.razorpay_payment_id;
    document.getElementById('razorpay_signature').value = response.razorpay_signature;
	
    document.razorpayform.submit();
};

// Boolean whether to show image inside a white frame. (default: true)
options.theme.image_padding = true;

options.modal = {
    ondismiss: function() { window.location.href = '../../checkout-failure';
        //console.log("This code runs when the popup is closed");
    },
    // Boolean indicating whether pressing escape key 
    // should close the checkout form. (default: true)
    escape: true,
    // Boolean indicating whether clicking translucent blank
    // space outside checkout form should close the form. (default: false)
    backdropclose: false
};

var rzp = new Razorpay(options);
rzp.open();
e.preventDefault();

</script>
		
</body>
</html>