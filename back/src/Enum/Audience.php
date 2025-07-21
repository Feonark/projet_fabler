<?php
// src/Enum/Audience.php
namespace App\Enum;

enum Audience: string
{
  case GENERAL = 'GENERAL';
  case TEEN = 'TEEN';
  case MATURE = 'MATURE';
  case ADULT = 'ADULT';
}
