<?php

namespace App\Dto;

final class ImageUploadOutput
{
  public function __construct(
    public string $url,
    public string $path,
    public string $filename
  ) {}
}
