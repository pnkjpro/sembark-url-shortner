<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Sembark URL Shortener Dashboard — Manage your shortened links with role-based access control.">
    <title>Dashboard — Sembark Links</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(['resources/css/dashboard.css', 'resources/js/dashboard.js'])
</head>
<body>
    <div id="app">
        <div class="login-wrapper">
            <div class="spinner"></div>
        </div>
    </div>
</body>
</html>
