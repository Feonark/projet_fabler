<?php
// src/Enum/Genre.php
namespace App\Enum;

enum Genre: string
{
  case FANTASY = 'FANTASY';
  case SCIENCE_FICTION = 'SCIENCE_FICTION';
  case HORROR = 'HORROR';
  case ROMANCE = 'ROMANCE';
  case MEDIEVAL = 'MEDIEVAL';
  case POST_APOCALYPTIC = 'POST_APOCALYPTIC';
  case CYBERPUNK = 'CYBERPUNK';
  case SUPERNATURAL = 'SUPERNATURAL';
  case MYSTERY = 'MYSTERY';
  case ADVENTURE = 'ADVENTURE';
  case STEAMPUNK = 'STEAMPUNK';
  case HISTORICAL = 'HISTORICAL';
  case COMEDY = 'COMEDY';
  case DRAMA = 'DRAMA';
  case THRILLER = 'THRILLER';
}
