<?php
header('Content-Type: text/plain; charset=utf-8');
echo "GROQ_API_KEY=" . (getenv("GROQ_API_KEY") ? "KEBACA" : "TIDAK KEBACA");
