<?php
// CHOCO BLOSSOM: Delhivery Logistics Integration Endpoint
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$token = 'a03732edf2f76333ed5a3ac47b9b98d1c4ed66c3';
$pincode = $_GET['pincode'] ?? '';

if (!$pincode || !preg_match('/^\d{6}$/', $pincode)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid pincode format"]);
    exit;
}

$url = "https://track.delhivery.com/c/api/pin-codes/json/?filter_codes=" . urlencode($pincode);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Token " . $token,
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || !$response) {
    // If Delhivery API fails or returns error, fallback to mock status to prevent checkout block
    echo json_encode([
        "status" => "fallback",
        "is_serviceable" => true,
        "city" => "",
        "state" => "",
        "days" => "3-5 Days Delivery",
        "courier" => "Delhivery Courier"
    ]);
    exit;
}

$data = json_decode($response, true);
$pincodeList = $data['delivery_codes'] ?? [];

if (empty($pincodeList)) {
    echo json_encode([
        "status" => "success",
        "is_serviceable" => false,
        "message" => "Pincode not serviceable"
    ]);
    exit;
}

// Extract pincode details from first result
$info = $pincodeList[0]['postal_code'] ?? [];
$isServiceable = ($info['is_serviceable'] ?? 'N') === 'Y' || ($info['pre_paid'] ?? 'N') === 'Y';

$city = $info['district'] ?? $info['city'] ?? '';
$state = $info['state_name'] ?? '';

echo json_encode([
    "status" => "success",
    "is_serviceable" => $isServiceable,
    "city" => $city,
    "state" => $state,
    "days" => $isServiceable ? "2-4 Days Delivery" : "",
    "courier" => "Delhivery Express"
]);
