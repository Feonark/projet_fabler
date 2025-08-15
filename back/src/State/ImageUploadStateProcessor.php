<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Dto\ImageUploadInput;
use App\Dto\ImageUploadOutput;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\String\Slugger\AsciiSlugger;

final class ImageUploadStateProcessor implements ProcessorInterface
{
  public function __construct(
    private RequestStack $requestStack,
    #[Autowire('%kernel.project_dir%')]
    private string $projectDir,
    #[Autowire('%env(resolve:APP_UPLOADS_BASE)%')]
    private string $uploadsBase
  ) {}

  /** @param ImageUploadInput $data */
  public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): ImageUploadOutput
  {
    $request = $this->requestStack->getCurrentRequest();
    $uploadedFile = $request?->files->get('file');
    $folder = $request?->request->get('folder');
    $wanted = $request?->request->get('filename');

    if (!$uploadedFile || !$folder) {
      throw new \InvalidArgumentException('Paramètres manquants (file, folder).');
    }

    // On s'assure que le folder est autorisé
    $allowedFolders = ['avatars', 'banners', 'places', 'portraits'];
    if (!in_array($folder, $allowedFolders, true)) {
      throw new \InvalidArgumentException(sprintf(
        'Le dossier "%s" n\'est pas autorisé. Autorisés : %s',
        $folder,
        implode(', ', $allowedFolders)
      ));
    }

    $slugger = new AsciiSlugger();
    $original = pathinfo($uploadedFile->getClientOriginalName(), PATHINFO_FILENAME);
    $base = $wanted ?: (string) $slugger->slug($original);

    // Génération d’un nom unique
    $ext = pathinfo($uploadedFile->getClientOriginalName(), PATHINFO_EXTENSION);
    if (!$ext || $ext === 'default') {
      $ext = 'jpg'; // ou bin par défaut
    }
    $uniqueId = bin2hex(random_bytes(6));
    $filename = sprintf('%s-%s.%s', $base, $uniqueId, $ext);

    // Création du dossier si besoin
    $targetDir = sprintf('%s/public%s/%s', $this->projectDir, $this->uploadsBase, $folder);
    if (!is_dir($targetDir) && !@mkdir($targetDir, 0775, true) && !is_dir($targetDir)) {
      throw new \RuntimeException(sprintf('Impossible de créer le dossier "%s".', $targetDir));
    }

    // Déplacement du fichier
    $uploadedFile->move($targetDir, $filename);

    // Chemin public + URL
    $relativePath = sprintf('%s/%s/%s', $this->uploadsBase, $folder, $filename);
    $publicUrl = $relativePath;

    // Ici on retourne bien le vrai nom pour qu'il soit persisté en BDD
    return new ImageUploadOutput(
      url: $publicUrl,
      path: $relativePath,
      filename: $filename
    );
  }
}
