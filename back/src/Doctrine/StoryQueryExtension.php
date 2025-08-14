<?php
// api/src/Doctrine/StoryQueryExtension.php

namespace App\Doctrine;

use App\Entity\Story;
use ApiPlatform\Doctrine\Orm\Extension\QueryCollectionExtensionInterface;
use ApiPlatform\Doctrine\Orm\Extension\QueryItemExtensionInterface;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\Metadata\GetCollection;
use Doctrine\ORM\QueryBuilder;

final readonly class StoryQueryExtension implements QueryCollectionExtensionInterface
{
  private function applyPartialSelect(QueryBuilder $qb, string $alias): void
  {
    $qb->resetDQLPart('select');
    $qb->addSelect(sprintf(
      'partial %s.{id, title, description, bannerImageUrl, isPublic, genreType, audienceType, accessType, languageType}',
      $alias
    ));

    $qb->leftJoin(sprintf('%s.author', $alias), 'a')
      ->addSelect('partial a.{id, username}');
  }

  public function applyToCollection(
    QueryBuilder $qb,
    QueryNameGeneratorInterface $qng,
    string $resourceClass,
    ?Operation $operation = null,
    array $context = []
  ): void {
    if ($resourceClass !== Story::class || !$operation instanceof GetCollection) {
      return;
    }

    $alias = $qb->getRootAliases()[0];
    $this->applyPartialSelect($qb, $alias);

    // Filtre uniquement les stories publiques
    $qb->andWhere(sprintf('%s.isPublic = :isPublic', $alias))
      ->setParameter('isPublic', true);
  }
}
