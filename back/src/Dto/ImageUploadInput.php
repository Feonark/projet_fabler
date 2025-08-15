<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\HttpFoundation\File\UploadedFile;

final class ImageUploadInput
{

  #[Assert\NotNull]
  #[Assert\File(
    maxSize: '5M',
    extensions: ['jpg', 'png', 'bmp', 'webp'],
    extensionsMessage: 'Please upload a valid file (jpg, png, bmp or webp)',
  )]
  public ?UploadedFile $file = null;

  #[Assert\NotBlank]
  public ?string $folder = null;

  public ?string $filename = null;
}
