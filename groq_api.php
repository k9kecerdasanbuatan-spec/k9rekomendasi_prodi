<?php
declare(strict_types=1);

header("Content-Type: application/json; charset=utf-8");

$apiKey = getenv("GROQ_API_KEY");
if (!$apiKey) {
  http_response_code(500);
  echo json_encode(["error" => "GROQ_API_KEY belum diset di environment"], JSON_UNESCAPED_UNICODE);
  exit;
}

$rawInput = file_get_contents("php://input") ?: "";
$input = json_decode($rawInput, true);

if (!is_array($input) || !isset($input["prompt"])) {
  http_response_code(400);
  echo json_encode(["error" => "Body JSON harus punya field 'prompt'"], JSON_UNESCAPED_UNICODE);
  exit;
}

$prompt = (string)$input["prompt"];

$model = getenv("GROQ_MODEL") ?: "llama-3.1-8b-instant";
$payload = [
  "model" => $model,
  "messages" => [
    ["role" => "user", "content" => $prompt]
  ],
  "temperature" => 0.7
];

$ch = curl_init("https://api.groq.com/openai/v1/chat/completions");

curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_HTTPHEADER => [
    "Authorization: Bearer " . trim($apiKey),
    "Content-Type: application/json"
  ],
  CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
]);

$response = curl_exec($ch);
$httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);

if ($response === false) {
  http_response_code(500);
  echo json_encode(["error" => curl_error($ch)], JSON_UNESCAPED_UNICODE);
  curl_close($ch);
  exit;
}

curl_close($ch);

// kalau Groq error (401/429/dll), teruskan status code + body-nya biar kebaca di JS
if ($httpCode < 200 || $httpCode >= 300) {
  http_response_code($httpCode);
  echo $response; // biasanya sudah JSON error dari Groq
  exit;
}

// sukses: proxy response Groq apa adanya (punya "choices")
http_response_code(200);
echo $response;
