<?php

namespace App\ApiResource;

use App\Dto\ImageUploadInput;
use ApiPlatform\Metadata\Post;
use App\Dto\ImageUploadOutput;
use ApiPlatform\Metadata\ApiResource;
use App\State\ImageUploadStateProcessor;

#[ApiResource(
  shortName: 'Image',
  operations: [
    new Post(
      uriTemplate: '/images',
      input: false,
      output: ImageUploadOutput::class,
      processor: ImageUploadStateProcessor::class,
      extraProperties: [
        'openapi_context' => [
          'summary' => 'Upload d\'une image (multipart/form-data)',
          'requestBody' => [
            'content' => [
              'multipart/form-data' => [
                'schema' => [
                  'type' => 'object',
                  'properties' => [
                    'file' => ['type' => 'string', 'format' => 'binary'],
                    'folder' => ['type' => 'string', 'enum' => ['avatars', 'banners', 'places', 'portraits']],
                    'filename' => ['type' => 'string'],
                  ],
                  'required' => ['file', 'folder'],
                ]
              ]
            ]
          ]
        ]
      ]
    )
  ]
)]
final class ImageUpload {}
