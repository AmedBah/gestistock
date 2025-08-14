<?php

use App\Models\User;

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== UTILISATEURS GESTISTOCK ===\n\n";

$users = User::all(['name', 'email', 'role', 'active']);

foreach ($users as $user) {
    $status = $user->active ? 'Actif' : 'Inactif';
    echo "Nom: {$user->name}\n";
    echo "Email: {$user->email}\n";
    echo "Rôle: {$user->role}\n";
    echo "Statut: {$status}\n";
    echo "Mot de passe: password (par défaut)\n";
    echo "----------------------------\n";
}
