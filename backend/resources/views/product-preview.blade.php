<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $product->name }} - Monyenyo</title>
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ $shareUrl }}">
    <meta property="og:title" content="{{ $product->name }} - Monyenyo">
    <meta property="og:description" content="{{ $product->description }}">
    <meta property="og:image" content="{{ $imageUrl }}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="Monyenyo">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="{{ $shareUrl }}">
    <meta property="twitter:title" content="{{ $product->name }} - Monyenyo">
    <meta property="twitter:description" content="{{ $product->description }}">
    <meta property="twitter:image" content="{{ $imageUrl }}">
    
    <!-- WhatsApp specific -->
    <meta property="og:image:alt" content="{{ $product->name }}">
    
    <!-- Telegram -->
    <meta name="telegram:channel" content="@monyenyo">
    
    <!-- Auto redirect ke frontend setelah 2 detik -->
    <meta http-equiv="refresh" content="2;url=https://monyenyo.com/menu/{{ $product->id }}">
    
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .container {
            background: white;
            border-radius: 15px;
            padding: 30px;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .product-image {
            width: 200px;
            height: 200px;
            object-fit: cover;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        
        .product-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
        }
        
        .product-description {
            color: #666;
            margin-bottom: 20px;
            line-height: 1.5;
        }
        
        .price {
            font-size: 20px;
            font-weight: bold;
            color: #e74c3c;
            margin-bottom: 20px;
        }
        
        .redirect-info {
            color: #888;
            font-size: 14px;
            margin-top: 20px;
        }
        
        .logo {
            font-size: 18px;
            font-weight: bold;
            color: #667eea;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        @if($imageUrl)
            <img src="{{ $imageUrl }}" alt="{{ $product->name }}" class="product-image">
        @endif
        
        <div class="product-name">{{ $product->name }}</div>
        <div class="product-description">{{ Str::limit($product->description, 100) }}</div>
        <div class="price">{{ $product->formatted_final_price }}</div>
        
        <div class="redirect-info">
            Redirecting to Monyenyo app...
        </div>
        
        <div class="logo">🍰 Monyenyo</div>
    </div>
    
    <script>
        // Fallback redirect jika meta refresh tidak bekerja
        setTimeout(() => {
            window.location.href = 'https://monyenyo.com/menu/{{ $product->id }}';
        }, 2000);
    </script>
</body>
</html>