<?php
// src/Enum/Access.php
namespace App\Enum;

enum Access: string
{
  case ON_APPROVAL = 'ON_APPROVAL';
  case OPEN = 'OPEN';
  case CLOSED = 'CLOSED';
}
