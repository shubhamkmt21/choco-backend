<?php
include("../../include/database.php"); 
header("Pragma: no-cache");
header("Cache-Control: no-cache");
header("Expires: 0");

require('lib/config.php');

session_start();

require('razorpay-php/Razorpay.php');
use Razorpay\Api\Api;
use Razorpay\Api\Errors\SignatureVerificationError;

$success = true;



$error = "Payment Failed";

if (empty($_POST['razorpay_payment_id']) === false)
{
    $api = new Api($keyId, $keySecret);

    try
    {
        // Please note that the razorpay order ID must
        // come from a trusted source (session here, but
        // could be database or something else)
        $attributes = array(
            'razorpay_order_id' => $_SESSION['razorpay_order_id'],
            'razorpay_payment_id' => $_POST['razorpay_payment_id'],
            'razorpay_signature' => $_POST['razorpay_signature']
        );

        $api->utility->verifyPaymentSignature($attributes);
    }
    catch(SignatureVerificationError $e)
    {
        $success = false;
        $error = 'Razorpay Error : ' . $e->getMessage();
    }
}

if ($success === true)
{
    //$html = "<p>Your payment was successful</p>
     //        <p>Payment ID: {$_POST['razorpay_payment_id']}</p>
		//	 <p>Order ID: {$_SESSION['razorpay_order_id']}</p>
		//	 <p>Signature ID: {$_POST['razorpay_signature']}</p>
		//	 <p>ORDER : {$_POST['order_id']}</p>";
			 
	
$order_id=mysqli_real_escape_string($con,$_POST['order_id']); 
$sqls_order="SELECT cmobile,email,fullname FROM orderr WHERE id='$order_id'";
$results_order=$con->query($sqls_order);
$rows= $results_order->fetch_array();
$cmobile=$rows['cmobile'];





$last_order_id=$order_id;
$fullname=$rows['fullname'];




    $txnid=mysqli_real_escape_string($con,$_POST['razorpay_payment_id']); 
	$payment_gateway_success_status=1;
	$payment_gateway_history=mysqli_real_escape_string($con,$_POST['razorpay_signature']); 
	
			 
	$update_qry_s="update orderr set txnid='$txnid', payment_gateway_success_status='$payment_gateway_success_status', payment_gateway_history='$payment_gateway_history'    where id=$order_id";

    $updated_qry = $con->query($update_qry_s);

    header("location:../../checkout-confirmation");  exit;
}
else
{
    $html = "<p>Your payment failed</p>
             <p>{$error}</p>";
			 
     header("location:../../checkout-failure");  exit;
}

echo $html;

?>
