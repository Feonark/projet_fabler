<?php

namespace App\State;

use App\Dto\ImageUploadInput;
use App\Dto\ImageUploadOutput;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Symfony\Component\String\Slugger\AsciiSlugger;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Validator\Exception\ValidationFailedException;

final class ImageUploadStateProcessor implements ProcessorInterface
{
  public function __construct(
    private RequestStack $requestStack,
    private ValidatorInterface $validator,
    #[Autowire('%kernel.project_dir%')]
    private string $projectDir,
    #[Autowire('%env(resolve:APP_UPLOADS_BASE)%')]
    private string $uploadsBase
  ) {}

  public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): ImageUploadOutput
  {
    $request = $this->requestStack->getCurrentRequest();

    // Créer le DTO à partir de la requête
    $dto = new ImageUploadInput();
    $dto->file = $request->files->get('file');
    $dto->folder = $request->request->get('folder');
    $dto->filename = $request->request->get('filename');

    // Validation
    $violations = $this->validator->validate($dto);
    if (count($violations) > 0) {
      throw new ValidationFailedException($dto, $violations);
    }

    $allowedFolders = ['avatars', 'banners', 'places', 'portraits'];
    if (!in_array($dto->folder, $allowedFolders, true)) {
      throw new BadRequestHttpException(sprintf(
        'Le dossier "%s" n\'est pas autorisé. Autorisés : %s',
        $dto->folder,
        implode(', ', $allowedFolders)
      ));
    }

    $slugger = new AsciiSlugger();
    $original = pathinfo($dto->file->getClientOriginalName(), PATHINFO_FILENAME);
    $base = $dto->filename ?: (string) $slugger->slug($original);
    $ext = pathinfo($dto->file->getClientOriginalName(), PATHINFO_EXTENSION) ?: 'jpg';
    $uniqueId = bin2hex(random_bytes(6));
    $filename = sprintf('%s-%s.%s', $base, $uniqueId, $ext);

    $targetDir = sprintf('%s/public%s/%s', $this->projectDir, $this->uploadsBase, $dto->folder);
    if (!is_dir($targetDir) && !@mkdir($targetDir, 0775, true) && !is_dir($targetDir)) {
      throw new \RuntimeException(sprintf('Impossible de créer le dossier "%s".', $targetDir));
    }

    $dto->file->move($targetDir, $filename);
    $relativePath = sprintf('%s/%s/%s', $this->uploadsBase, $dto->folder, $filename);

    return new ImageUploadOutput(
      url: $relativePath,
      path: $relativePath,
      filename: $filename
    );
  }
}
